using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Tickly.Api.Data;
using Tickly.Api.Models;
using Tickly.Api.Services;

namespace Tickly.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TicketsController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly TicketWorkflowService _workflow;
        private readonly AuditService _audit;

        public TicketsController(AppDbContext db, TicketWorkflowService workflow, AuditService audit)
        {
            _db = db;
            _workflow = workflow;
            _audit = audit;
        }

        // Helper: get user id from token (sub)
        private string? GetUserId()
        {
            return User?.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
        }

        // Helper: parse dept_role claims formatted as "{departmentId}:{RoleName}"
        private List<(int DeptId, RoleName Role)> GetDeptRoles()
        {
            var list = new List<(int, RoleName)>();
            var claims = User?.FindAll("dept_role") ?? Enumerable.Empty<System.Security.Claims.Claim>();
            foreach (var c in claims)
            {
                var parts = c.Value.Split(':', 2);
                if (parts.Length != 2) continue;
                if (int.TryParse(parts[0], out var deptId) && Enum.TryParse<RoleName>(parts[1], out var role))
                {
                    list.Add((deptId, role));
                }
            }
            return list;
        }

        private bool IsSuperAdmin()
        {
            return User?.IsInRole(RoleName.SuperAdmin.ToString()) ?? false;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            // Authorization scoping:
            // - SuperAdmin: all tickets
            // - DepartmentManager/DepartmentStaff: tickets for their departments
            // - Users with no dept roles: tickets assigned to them
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            if (IsSuperAdmin())
            {
                var all = await _db.Tickets.OrderByDescending(t => t.CreatedAt).ToListAsync();
                return Ok(all);
            }

            var deptRoles = GetDeptRoles();
            var allowedDeptIds = deptRoles.Select(d => d.DeptId).Distinct().ToList();

            var query = _db.Tickets.AsQueryable();
            if (allowedDeptIds.Any())
            {
                query = query.Where(t => (t.DepartmentId != null && allowedDeptIds.Contains(t.DepartmentId.Value))
                                         || t.AssignedToUserId == userId
                                         || t.CreatorId == userId);
            }
            else
            {
                // no department roles – only tickets assigned to the current user or created by them
                query = query.Where(t => t.AssignedToUserId == userId || t.CreatorId == userId);
            }

            var list = await query.OrderByDescending(t => t.CreatedAt).ToListAsync();
            return Ok(list);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> Get(int id)
        {
            var t = await _db.Tickets.FindAsync(id);
            if (t == null) return NotFound();

            var userId = GetUserId();
            if (userId == null) return Unauthorized();
            if (IsSuperAdmin()) return Ok(t);

            var deptRoles = GetDeptRoles();
            var allowedDeptIds = deptRoles.Select(d => d.DeptId).Distinct().ToList();

            if (t.AssignedToUserId == userId) return Ok(t);
            if (t.CreatorId == userId) return Ok(t);
            if (t.DepartmentId != null && allowedDeptIds.Contains(t.DepartmentId.Value)) return Ok(t);

            return Forbid();
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Ticket ticket)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            if (!IsSuperAdmin())
            {
                // Ensure user has rights to create in this department (if specified)
                var deptRoles = GetDeptRoles();
                var allowedDeptIds = deptRoles.Select(d => d.DeptId).Distinct().ToList();
                if (ticket.DepartmentId != null && !allowedDeptIds.Contains(ticket.DepartmentId.Value))
                {
                    return Forbid();
                }
            }

            // set creator
            ticket.CreatorId = userId;

            _db.Tickets.Add(ticket);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = ticket.Id }, ticket);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] Ticket input)
        {
            var t = await _db.Tickets.FindAsync(id);
            if (t == null) return NotFound();
            var userId = GetUserId();
            if (userId == null) return Unauthorized();
            if (!IsSuperAdmin())
            {
                var deptRoles = GetDeptRoles();
                var allowedDeptIds = deptRoles.Select(d => d.DeptId).Distinct().ToList();

                // allow if assigned to user or user has department privileges
                var hasDeptAccess = t.DepartmentId != null && allowedDeptIds.Contains(t.DepartmentId.Value);
                if (!hasDeptAccess && t.AssignedToUserId != userId)
                    return Forbid();
            }

            t.Title = input.Title;
            t.Description = input.Description;
            t.Priority = input.Priority;
            t.Status = input.Status;
            t.AssignedToUserId = input.AssignedToUserId;
            t.EstimatedResolutionAt = input.EstimatedResolutionAt;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var t = await _db.Tickets.FindAsync(id);
            if (t == null) return NotFound();
            var userId = GetUserId();
            if (userId == null) return Unauthorized();
            // only SuperAdmin or DepartmentManager for the ticket's department can delete
            if (!IsSuperAdmin())
            {
                var deptRoles = GetDeptRoles();
                var isDeptManager = deptRoles.Any(dr => dr.DeptId == (t.DepartmentId ?? -1) && dr.Role == RoleName.DepartmentManager);
                if (!isDeptManager) return Forbid();
            }

            _db.Tickets.Remove(t);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("{id:int}/transition")]
        public async Task<IActionResult> TransitionStatus(int id, [FromBody] TransitionRequest req)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            try
            {
                var ticketEvent = await _workflow.TransitionStatusAsync(id, req.Status, userId, req.Note);
                await _audit.LogAsync(
                    ticketEvent.TenantId,
                    userId,
                    User?.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value,
                    "Ticket",
                    id.ToString(),
                    "TransitionStatus",
                    null,
                    new { status = req.Status.ToString() }
                );
                return Ok(ticketEvent);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("{id:int}/assign")]
        public async Task<IActionResult> Assign(int id, [FromBody] AssignRequest req)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            try
            {
                var ticketEvent = await _workflow.AssignTicketAsync(id, req.AssigneeId, userId);
                await _audit.LogAsync(
                    ticketEvent.TenantId,
                    userId,
                    User?.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value,
                    "Ticket",
                    id.ToString(),
                    "Assign",
                    null,
                    new { assigneeId = req.AssigneeId }
                );
                return Ok(ticketEvent);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("{id:int}/comments")]
        public async Task<IActionResult> AddComment(int id, [FromBody] CommentRequest req)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            try
            {
                var ticketEvent = await _workflow.AddCommentAsync(id, req.Text, req.IsInternal, userId);
                return Ok(ticketEvent);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("{id:int}/events")]
        public async Task<IActionResult> GetEvents(int id)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var ticket = await _db.Tickets.FindAsync(id);
            if (ticket == null) return NotFound();

            // Check access
            if (!IsSuperAdmin())
            {
                var deptRoles = GetDeptRoles();
                var allowedDeptIds = deptRoles.Select(d => d.DeptId).Distinct().ToList();
                if (ticket.AssignedToUserId != userId && 
                    ticket.CreatorId != userId &&
                    (ticket.DepartmentId == null || !allowedDeptIds.Contains(ticket.DepartmentId.Value)))
                {
                    return Forbid();
                }
            }

            var events = await _db.TicketEvents
                .Where(e => e.TicketId == id)
                .OrderBy(e => e.CreatedAt)
                .ToListAsync();

            // Filter internal comments for non-agents
            var isDeptAgent = GetDeptRoles().Any(r => ticket.DepartmentId != null && r.DeptId == ticket.DepartmentId.Value);
            if (!IsSuperAdmin() && !isDeptAgent)
            {
                events = events.Where(e => e.Visibility == EventVisibility.Public).ToList();
            }

            return Ok(events);
        }
    }

    public record TransitionRequest(TicketStatus Status, string? Note);
    public record AssignRequest(string AssigneeId);
    public record CommentRequest(string Text, bool IsInternal);
}
