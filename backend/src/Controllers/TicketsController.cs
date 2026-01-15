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
        private readonly AutomationService _automation;
        private readonly SLAMonitoringService _slaService;

        public TicketsController(
            AppDbContext db, 
            TicketWorkflowService workflow, 
            AuditService audit,
            AutomationService automation,
            SLAMonitoringService slaService)
        {
            _db = db;
            _workflow = workflow;
            _audit = audit;
            _automation = automation;
            _slaService = slaService;
        }

        // Helper: get user id from token (sub)
        private string? GetUserId()
        {
            // .NET maps "sub" claim to ClaimTypes.NameIdentifier
            return User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                ?? User?.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
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
        public async Task<IActionResult> GetAll(
            [FromQuery] int? status = null,
            [FromQuery] int? priority = null,
            [FromQuery] int? departmentId = null,
            [FromQuery] string? search = null)
        {
            // Authorization scoping:
            // - SuperAdmin: all tickets
            // - DepartmentManager/DepartmentStaff: tickets for their departments
            // - Users with no dept roles: tickets assigned to them
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            IQueryable<Ticket> query;

            if (IsSuperAdmin())
            {
                query = _db.Tickets.AsQueryable();
            }
            else
            {
                var deptRoles = GetDeptRoles();
                
                // Separate roles by type
                var managerOrLeadDepts = deptRoles
                    .Where(d => d.Role == RoleName.DepartmentManager || d.Role == RoleName.TeamLead)
                    .Select(d => d.DeptId)
                    .Distinct()
                    .ToList();
                    
                var staffDepts = deptRoles
                    .Where(d => d.Role == RoleName.DepartmentStaff)
                    .Select(d => d.DeptId)
                    .Distinct()
                    .ToList();

                query = _db.Tickets.AsQueryable();
                
                // DepartmentManager and TeamLead: See ALL tickets in their department(s)
                // DepartmentStaff: See ONLY tickets assigned to them in their department(s)
                // EndUser: See tickets they created or assigned to them
                
                if (managerOrLeadDepts.Any() || staffDepts.Any())
                {
                    query = query.Where(t => 
                        // Manager/TeamLead: All tickets in their departments
                        (t.DepartmentId != null && managerOrLeadDepts.Contains(t.DepartmentId.Value))
                        // Staff: Only assigned tickets in their departments
                        || (t.DepartmentId != null && staffDepts.Contains(t.DepartmentId.Value) && t.AssignedToUserId == userId)
                        // Own tickets
                        || t.CreatorId == userId
                    );
                }
                else
                {
                    // EndUser only: tickets they created or assigned to them
                    query = query.Where(t => t.AssignedToUserId == userId || t.CreatorId == userId);
                }
            }

            // Apply filters
            if (status.HasValue)
            {
                query = query.Where(t => t.Status == (TicketStatus)status.Value);
            }

            if (priority.HasValue)
            {
                query = query.Where(t => t.Priority == (TicketPriority)priority.Value);
            }

            if (departmentId.HasValue)
            {
                query = query.Where(t => t.DepartmentId == departmentId.Value);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchLower = search.ToLower();
                query = query.Where(t =>
                    t.Title.ToLower().Contains(searchLower) ||
                    (t.Description != null && t.Description.ToLower().Contains(searchLower))
                );
            }

            var list = await query.OrderByDescending(t => t.CreatedAt).ToListAsync();
            
            // Enrich with user names - OPTIMIZED: Single query for all users
            var userIds = list.Select(t => t.CreatorId)
                .Concat(list.Select(t => t.AssignedToUserId))
                .Where(id => id != null)
                .Distinct()
                .ToList();
            
            var users = await _db.Users
                .Where(u => userIds.Contains(u.Id))
                .Select(u => new { u.Id, u.DisplayName, u.Username })
                .ToDictionaryAsync(u => u.Id);
            
            var enrichedList = list.Select(t => new
            {
                t.Id,
                t.TenantId,
                t.Title,
                t.Description,
                t.CreatorId,
                CreatorName = t.CreatorId != null && users.ContainsKey(t.CreatorId) 
                    ? (users[t.CreatorId].DisplayName ?? users[t.CreatorId].Username) 
                    : null,
                t.DepartmentId,
                t.AssignedToUserId,
                AssignedToName = t.AssignedToUserId != null && users.ContainsKey(t.AssignedToUserId)
                    ? (users[t.AssignedToUserId].DisplayName ?? users[t.AssignedToUserId].Username)
                    : null,
                t.CategoryId,
                t.SLAPlanId,
                t.Channel,
                t.Priority,
                t.Status,
                t.Tags,
                t.CreatedAt,
                t.UpdatedAt,
                t.EstimatedResolutionAt,
                t.DueAt,
                t.ClosedAt,
                t.LastEventAt
            }).ToList();
            
            return Ok(enrichedList);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> Get(int id)
        {
            var t = await _db.Tickets.FindAsync(id);
            if (t == null) return NotFound();

            var userId = GetUserId();
            if (userId == null) return Unauthorized();
            
            var deptRoles = GetDeptRoles();
            
            // Check if user is Manager or TeamLead in ticket's department
            var isManagerOrLead = deptRoles.Any(dr => 
                dr.DeptId == (t.DepartmentId ?? -1) && 
                (dr.Role == RoleName.DepartmentManager || dr.Role == RoleName.TeamLead)
            );
            
            // Check if user is Staff in ticket's department (must be assigned)
            var isAssignedStaff = deptRoles.Any(dr => 
                dr.DeptId == (t.DepartmentId ?? -1) && 
                dr.Role == RoleName.DepartmentStaff
            ) && t.AssignedToUserId == userId;

            // Authorization check
            bool authorized = IsSuperAdmin() || 
                             t.AssignedToUserId == userId || 
                             t.CreatorId == userId ||
                             isManagerOrLead ||
                             isAssignedStaff;
            
            if (!authorized) return Forbid();
            
            // Enrich with user names
            var creatorName = t.CreatorId != null 
                ? (await _db.Users.FindAsync(t.CreatorId))?.DisplayName ?? (await _db.Users.FindAsync(t.CreatorId))?.Username
                : null;
            var assignedToName = t.AssignedToUserId != null
                ? (await _db.Users.FindAsync(t.AssignedToUserId))?.DisplayName ?? (await _db.Users.FindAsync(t.AssignedToUserId))?.Username
                : null;
            
            var enriched = new
            {
                t.Id,
                t.TenantId,
                t.Title,
                t.Description,
                t.CreatorId,
                CreatorName = creatorName,
                t.DepartmentId,
                t.AssignedToUserId,
                AssignedToName = assignedToName,
                t.CategoryId,
                t.SLAPlanId,
                t.Channel,
                t.Priority,
                t.Status,
                t.Tags,
                t.CreatedAt,
                t.UpdatedAt,
                t.EstimatedResolutionAt,
                t.DueAt,
                t.ClosedAt,
                t.LastEventAt
            };
            
            return Ok(enriched);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Ticket ticket)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            // Herkes (EndUser) ticket oluşturabilir, departman kontrolü gerekmez
            // Ticket oluşturulduğunda ilgili departman üyeleri yönetebilecek

            // set creator
            ticket.CreatorId = userId;

            // Auto-assign SLA based on priority if not specified
            if (!ticket.SLAPlanId.HasValue)
            {
                var defaultSLA = await GetDefaultSLAForPriority(ticket.TenantId, ticket.Priority);
                if (defaultSLA != null)
                {
                    ticket.SLAPlanId = defaultSLA.Id;
                }
            }

            // Calculate DueAt based on SLA
            if (ticket.SLAPlanId.HasValue)
            {
                var slaPlan = await _db.SLAPlans.FindAsync(ticket.SLAPlanId.Value);
                if (slaPlan != null)
                {
                    ticket.DueAt = _slaService.CalculateSLADueDate(slaPlan, ticket.CreatedAt);
                }
            }

            _db.Tickets.Add(ticket);
            await _db.SaveChangesAsync();

            // Trigger automation: TicketCreated
            _ = Task.Run(async () =>
            {
                try
                {
                    await _automation.ProcessTicketEventAsync(ticket.Id, AutomationTrigger.TicketCreated);
                }
                catch (Exception ex)
                {
                    // Log but don't fail the request
                    Console.WriteLine($"Automation error: {ex.Message}");
                }
            });

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
                
                // Sadece departman yöneticileri (Manager/TeamLead) güncelleme yapabilir
                // veya kendi atanmış ticketlarını güncelleyebilir
                var isManagerOrLead = deptRoles.Any(dr => 
                    dr.DeptId == (t.DepartmentId ?? -1) && 
                    (dr.Role == RoleName.DepartmentManager || dr.Role == RoleName.TeamLead)
                );
                
                var isAssigned = t.AssignedToUserId == userId;
                
                if (!isManagerOrLead && !isAssigned)
                    return Forbid();
            }

            var oldSLAPlanId = t.SLAPlanId;
            var oldPriority = t.Priority;

            t.Title = input.Title;
            t.Description = input.Description;
            t.Priority = input.Priority;
            t.Status = input.Status;
            t.AssignedToUserId = input.AssignedToUserId;
            t.EstimatedResolutionAt = input.EstimatedResolutionAt;

            // Update SLA if provided
            if (input.SLAPlanId.HasValue && input.SLAPlanId != oldSLAPlanId)
            {
                t.SLAPlanId = input.SLAPlanId;
                
                // Recalculate DueAt
                var slaPlan = await _db.SLAPlans.FindAsync(input.SLAPlanId.Value);
                if (slaPlan != null)
                {
                    t.DueAt = _slaService.CalculateSLADueDate(slaPlan, t.CreatedAt);
                }
            }
            // If priority changed and no explicit SLA set, recalculate
            else if (t.Priority != oldPriority && !t.SLAPlanId.HasValue)
            {
                var defaultSLA = await GetDefaultSLAForPriority(t.TenantId, t.Priority);
                if (defaultSLA != null)
                {
                    t.SLAPlanId = defaultSLA.Id;
                    t.DueAt = _slaService.CalculateSLADueDate(defaultSLA, t.CreatedAt);
                }
            }

            await _db.SaveChangesAsync();

            // Trigger automation: TicketUpdated
            _ = Task.Run(async () =>
            {
                try
                {
                    await _automation.ProcessTicketEventAsync(t.Id, AutomationTrigger.TicketUpdated);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Automation error: {ex.Message}");
                }
            });

            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var t = await _db.Tickets.FindAsync(id);
            if (t == null) return NotFound();
            var userId = GetUserId();
            if (userId == null) return Unauthorized();
            // only SuperAdmin or DepartmentManager/TeamLead for the ticket's department can delete
            if (!IsSuperAdmin())
            {
                var deptRoles = GetDeptRoles();
                var isManagerOrLead = deptRoles.Any(dr => 
                    dr.DeptId == (t.DepartmentId ?? -1) && 
                    (dr.Role == RoleName.DepartmentManager || dr.Role == RoleName.TeamLead)
                );
                if (!isManagerOrLead) return Forbid();
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

            // Ticket'ı kontrol et
            var ticket = await _db.Tickets.FindAsync(id);
            if (ticket == null) return NotFound();

            // Yetki kontrolü: Sadece atanan kişi veya departman yöneticisi/teamlead status değiştirebilir
            if (!IsSuperAdmin())
            {
                var deptRoles = GetDeptRoles();
                
                var isManagerOrLead = deptRoles.Any(dr => 
                    dr.DeptId == (ticket.DepartmentId ?? -1) && 
                    (dr.Role == RoleName.DepartmentManager || dr.Role == RoleName.TeamLead)
                );
                
                var isAssigned = ticket.AssignedToUserId == userId;
                
                if (!isManagerOrLead && !isAssigned)
                    return Forbid();
            }

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

                // Trigger automation: StatusChanged
                _ = Task.Run(async () =>
                {
                    try
                    {
                        await _automation.ProcessTicketEventAsync(id, AutomationTrigger.StatusChanged);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Automation error: {ex.Message}");
                    }
                });

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

                // Trigger automation: CommentAdded
                _ = Task.Run(async () =>
                {
                    try
                    {
                        await _automation.ProcessTicketEventAsync(id, AutomationTrigger.CommentAdded);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Automation error: {ex.Message}");
                    }
                });

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
                
                var isManagerOrLead = deptRoles.Any(dr => 
                    dr.DeptId == (ticket.DepartmentId ?? -1) && 
                    (dr.Role == RoleName.DepartmentManager || dr.Role == RoleName.TeamLead)
                );
                
                var isAssignedStaff = deptRoles.Any(dr => 
                    dr.DeptId == (ticket.DepartmentId ?? -1) && 
                    dr.Role == RoleName.DepartmentStaff
                ) && ticket.AssignedToUserId == userId;
                
                if (ticket.AssignedToUserId != userId && 
                    ticket.CreatorId != userId &&
                    !isManagerOrLead &&
                    !isAssignedStaff)
                {
                    return Forbid();
                }
            }

            var events = await _db.TicketEvents
                .Where(e => e.TicketId == id)
                .OrderBy(e => e.CreatedAt)
                .ToListAsync();

            // Enrich events with actor display names
            var actorIds = events.Where(e => !string.IsNullOrEmpty(e.ActorId)).Select(e => e.ActorId).Distinct().ToList();
            var users = await _db.Users
                .Where(u => actorIds.Contains(u.Id))
                .Select(u => new { u.Id, u.DisplayName, u.Username })
                .ToListAsync();
            
            var userDict = users.ToDictionary(u => u.Id, u => u.DisplayName ?? u.Username);

            // Filter internal comments for non-agents
            var isDeptAgent = GetDeptRoles().Any(r => 
                ticket.DepartmentId != null && 
                r.DeptId == ticket.DepartmentId.Value &&
                (r.Role == RoleName.DepartmentManager || r.Role == RoleName.TeamLead || r.Role == RoleName.DepartmentStaff)
            );
            if (!IsSuperAdmin() && !isDeptAgent)
            {
                events = events.Where(e => e.Visibility == EventVisibility.Public).ToList();
            }

            // Map to DTO with display names
            var eventDtos = events.Select(e => new
            {
                e.Id,
                e.TicketId,
                e.Type,
                e.ActorId,
                ActorDisplayName = !string.IsNullOrEmpty(e.ActorId) && userDict.ContainsKey(e.ActorId) 
                    ? userDict[e.ActorId] 
                    : "Sistem",
                e.Visibility,
                e.PayloadJson,
                e.CreatedAt
            }).ToList();

            return Ok(eventDtos);
        }

        // Helper: Get default SLA plan based on priority
        private async Task<SLAPlan?> GetDefaultSLAForPriority(Guid tenantId, TicketPriority priority)
        {
            // Priority-based SLA mapping (configurable in future via database)
            var slaName = priority switch
            {
                TicketPriority.Critical => "Critical",
                TicketPriority.Urgent => "Urgent",
                TicketPriority.High => "High Priority",
                TicketPriority.Normal => "Standard",
                TicketPriority.Low => "Standard",
                _ => "Standard"
            };

            var slaPlan = await _db.SLAPlans
                .Where(s => s.TenantId == tenantId && s.IsActive && s.Name.Contains(slaName))
                .OrderBy(s => s.ResponseTimeMinutes)
                .FirstOrDefaultAsync();

            // Fallback to any active SLA for the tenant
            if (slaPlan == null)
            {
                slaPlan = await _db.SLAPlans
                    .Where(s => s.TenantId == tenantId && s.IsActive)
                    .OrderBy(s => s.ResponseTimeMinutes)
                    .FirstOrDefaultAsync();
            }

            return slaPlan;
        }

        // SLA Plans - Read access for all authenticated users
        [HttpGet("sla-plans")]
        public async Task<IActionResult> GetSLAPlans()
        {
            var plans = await _db.SLAPlans
                .Where(s => s.IsActive)
                .OrderBy(s => s.Name)
                .ToListAsync();
            return Ok(plans);
        }
    }

    public record TransitionRequest(TicketStatus Status, string? Note);
    public record AssignRequest(string AssigneeId);
    public record CommentRequest(string Text, bool IsInternal);
}
