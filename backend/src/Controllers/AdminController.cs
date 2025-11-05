using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Tickly.Api.Data;
using Tickly.Api.Models;
using Tickly.Api.Services;

namespace Tickly.Api.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Policy = "SuperAdminOnly")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly AuditService _auditService;
        
        public AdminController(AppDbContext db, AuditService auditService) 
        { 
            _db = db;
            _auditService = auditService;
        }

        [HttpGet("departments")]
        public IActionResult GetDepartments()
        {
            var deps = _db.Departments.ToList();
            return Ok(deps);
        }

        [HttpPost("departments")]
        public IActionResult CreateDepartment([FromBody] CreateDepartmentDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name)) return BadRequest(new { error = "Name required" });
            var d = new Department { Name = dto.Name, Description = dto.Description };
            _db.Departments.Add(d);
            _db.SaveChanges();
            return Ok(d);
        }

        [HttpGet("departments/{id}/members")]
        public IActionResult GetDepartmentMembers(int id)
        {
            var members = _db.RoleAssignments.Where(r => r.DepartmentId == id).ToList();
            var users = from m in members
                        join u in _db.Users on m.UserId equals u.Id
                        select new { u.Id, u.Username, u.DisplayName, Role = m.Role };
            return Ok(users);
        }

        [HttpPost("departments/{id}/assign")]
        public IActionResult AssignRole(int id, [FromBody] AssignRoleDto dto)
        {
            var user = _db.Users.Find(dto.UserId);
            if (user == null) return NotFound(new { error = "User not found" });
            if (!Enum.TryParse<RoleName>(dto.Role, out var role)) return BadRequest(new { error = "Invalid role" });
            var ra = new RoleAssignment { UserId = user.Id, DepartmentId = id, Role = role };
            _db.RoleAssignments.Add(ra);
            _db.SaveChanges();
            return Ok(ra);
        }

        [HttpPost("roles/assign-global")]
        public IActionResult AssignGlobalRole([FromBody] AssignRoleDto dto)
        {
            var user = _db.Users.Find(dto.UserId);
            if (user == null) return NotFound(new { error = "User not found" });
            if (!Enum.TryParse<RoleName>(dto.Role, out var role)) return BadRequest(new { error = "Invalid role" });
            var ra = new RoleAssignment { UserId = user.Id, DepartmentId = null, Role = role };
            _db.RoleAssignments.Add(ra);
            _db.SaveChanges();
            return Ok(ra);
        }

        // SLA Plan Management
        [HttpGet("sla-plans")]
        public async Task<IActionResult> GetSLAPlans([FromQuery] Guid? tenantId)
        {
            var query = _db.SLAPlans.AsQueryable();
            
            if (tenantId.HasValue)
            {
                query = query.Where(s => s.TenantId == tenantId.Value);
            }
            
            var plans = await query.OrderBy(s => s.Name).ToListAsync();
            return Ok(plans);
        }

        [HttpGet("sla-plans/{id}")]
        public async Task<IActionResult> GetSLAPlan(int id)
        {
            var plan = await _db.SLAPlans.FindAsync(id);
            if (plan == null) return NotFound(new { error = "SLA plan not found" });
            return Ok(plan);
        }

        [HttpPost("sla-plans")]
        public async Task<IActionResult> CreateSLAPlan([FromBody] CreateSLAPlanDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest(new { error = "Name is required" });

            if (dto.ResponseTimeMinutes <= 0 && dto.ResolutionTimeMinutes <= 0)
                return BadRequest(new { error = "At least one of ResponseTimeMinutes or ResolutionTimeMinutes must be greater than 0" });

            var plan = new SLAPlan
            {
                TenantId = dto.TenantId,
                Name = dto.Name,
                Description = dto.Description,
                ResponseTimeMinutes = dto.ResponseTimeMinutes,
                ResolutionTimeMinutes = dto.ResolutionTimeMinutes,
                Calendar = dto.Calendar,
                EscalationPolicyJson = dto.EscalationPolicyJson,
                IsActive = true
            };

            _db.SLAPlans.Add(plan);
            await _db.SaveChangesAsync();

            await _auditService.LogAsync(
                tenantId: plan.TenantId,
                actorId: GetUserId()?.ToString(),
                actorRole: "SuperAdmin",
                entity: "SLAPlan",
                entityId: plan.Id.ToString(),
                action: "CreateSLAPlan",
                before: null,
                after: plan
            );

            return Ok(plan);
        }

        [HttpPut("sla-plans/{id}")]
        public async Task<IActionResult> UpdateSLAPlan(int id, [FromBody] UpdateSLAPlanDto dto)
        {
            var plan = await _db.SLAPlans.FindAsync(id);
            if (plan == null) return NotFound(new { error = "SLA plan not found" });

            var before = new
            {
                plan.Name,
                plan.Description,
                plan.ResponseTimeMinutes,
                plan.ResolutionTimeMinutes,
                plan.Calendar,
                plan.EscalationPolicyJson,
                plan.IsActive
            };

            if (!string.IsNullOrWhiteSpace(dto.Name))
                plan.Name = dto.Name;

            if (dto.Description != null)
                plan.Description = dto.Description;

            if (dto.ResponseTimeMinutes.HasValue)
                plan.ResponseTimeMinutes = dto.ResponseTimeMinutes.Value;

            if (dto.ResolutionTimeMinutes.HasValue)
                plan.ResolutionTimeMinutes = dto.ResolutionTimeMinutes.Value;

            if (dto.Calendar.HasValue)
                plan.Calendar = dto.Calendar.Value;

            if (dto.EscalationPolicyJson != null)
                plan.EscalationPolicyJson = dto.EscalationPolicyJson;

            if (dto.IsActive.HasValue)
                plan.IsActive = dto.IsActive.Value;

            await _db.SaveChangesAsync();

            await _auditService.LogAsync(
                tenantId: plan.TenantId,
                actorId: GetUserId()?.ToString(),
                actorRole: "SuperAdmin",
                entity: "SLAPlan",
                entityId: plan.Id.ToString(),
                action: "UpdateSLAPlan",
                before: before,
                after: new
                {
                    plan.Name,
                    plan.Description,
                    plan.ResponseTimeMinutes,
                    plan.ResolutionTimeMinutes,
                    plan.Calendar,
                    plan.EscalationPolicyJson,
                    plan.IsActive
                }
            );

            return Ok(plan);
        }

        [HttpDelete("sla-plans/{id}")]
        public async Task<IActionResult> DeleteSLAPlan(int id)
        {
            var plan = await _db.SLAPlans.FindAsync(id);
            if (plan == null) return NotFound(new { error = "SLA plan not found" });

            // Check if any tickets are using this plan
            var ticketsUsingPlan = await _db.Tickets.AnyAsync(t => t.SLAPlanId == id);
            if (ticketsUsingPlan)
            {
                return BadRequest(new { error = "Cannot delete SLA plan that is assigned to tickets. Deactivate it instead." });
            }

            _db.SLAPlans.Remove(plan);
            await _db.SaveChangesAsync();

            await _auditService.LogAsync(
                tenantId: plan.TenantId,
                actorId: GetUserId()?.ToString(),
                actorRole: "SuperAdmin",
                entity: "SLAPlan",
                entityId: plan.Id.ToString(),
                action: "DeleteSLAPlan",
                before: plan,
                after: null
            );

            return Ok(new { message = "SLA plan deleted successfully" });
        }

        // Automation Rules Management
        [HttpGet("automation-rules")]
        public async Task<IActionResult> GetAutomationRules([FromQuery] Guid? tenantId)
        {
            var query = _db.AutomationRules.AsQueryable();
            
            if (tenantId.HasValue)
            {
                query = query.Where(r => r.TenantId == tenantId.Value);
            }
            
            var rules = await query.OrderBy(r => r.Priority).ThenBy(r => r.Name).ToListAsync();
            return Ok(rules);
        }

        [HttpGet("automation-rules/{id}")]
        public async Task<IActionResult> GetAutomationRule(int id)
        {
            var rule = await _db.AutomationRules.FindAsync(id);
            if (rule == null) return NotFound(new { error = "Automation rule not found" });
            return Ok(rule);
        }

        [HttpPost("automation-rules")]
        public async Task<IActionResult> CreateAutomationRule([FromBody] CreateAutomationRuleDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest(new { error = "Name is required" });

            var rule = new AutomationRule
            {
                TenantId = dto.TenantId,
                Name = dto.Name,
                Description = dto.Description,
                Trigger = dto.Trigger,
                ConditionJson = dto.ConditionJson,
                ActionJson = dto.ActionJson,
                Priority = dto.Priority,
                Enabled = dto.Enabled
            };

            _db.AutomationRules.Add(rule);
            await _db.SaveChangesAsync();

            await _auditService.LogAsync(
                tenantId: rule.TenantId,
                actorId: GetUserId()?.ToString(),
                actorRole: "SuperAdmin",
                entity: "AutomationRule",
                entityId: rule.Id.ToString(),
                action: "CreateAutomationRule",
                before: null,
                after: rule
            );

            return Ok(rule);
        }

        [HttpPut("automation-rules/{id}")]
        public async Task<IActionResult> UpdateAutomationRule(int id, [FromBody] UpdateAutomationRuleDto dto)
        {
            var rule = await _db.AutomationRules.FindAsync(id);
            if (rule == null) return NotFound(new { error = "Automation rule not found" });

            var before = new
            {
                rule.Name,
                rule.Description,
                rule.Trigger,
                rule.ConditionJson,
                rule.ActionJson,
                rule.Priority,
                rule.Enabled
            };

            if (!string.IsNullOrWhiteSpace(dto.Name))
                rule.Name = dto.Name;

            if (dto.Description != null)
                rule.Description = dto.Description;

            if (dto.Trigger.HasValue)
                rule.Trigger = dto.Trigger.Value;

            if (dto.ConditionJson != null)
                rule.ConditionJson = dto.ConditionJson;

            if (dto.ActionJson != null)
                rule.ActionJson = dto.ActionJson;

            if (dto.Priority.HasValue)
                rule.Priority = dto.Priority.Value;

            if (dto.Enabled.HasValue)
                rule.Enabled = dto.Enabled.Value;

            await _db.SaveChangesAsync();

            await _auditService.LogAsync(
                tenantId: rule.TenantId,
                actorId: GetUserId()?.ToString(),
                actorRole: "SuperAdmin",
                entity: "AutomationRule",
                entityId: rule.Id.ToString(),
                action: "UpdateAutomationRule",
                before: before,
                after: new
                {
                    rule.Name,
                    rule.Description,
                    rule.Trigger,
                    rule.ConditionJson,
                    rule.ActionJson,
                    rule.Priority,
                    rule.Enabled
                }
            );

            return Ok(rule);
        }

        [HttpDelete("automation-rules/{id}")]
        public async Task<IActionResult> DeleteAutomationRule(int id)
        {
            var rule = await _db.AutomationRules.FindAsync(id);
            if (rule == null) return NotFound(new { error = "Automation rule not found" });

            _db.AutomationRules.Remove(rule);
            await _db.SaveChangesAsync();

            await _auditService.LogAsync(
                tenantId: rule.TenantId,
                actorId: GetUserId()?.ToString(),
                actorRole: "SuperAdmin",
                entity: "AutomationRule",
                entityId: rule.Id.ToString(),
                action: "DeleteAutomationRule",
                before: rule,
                after: null
            );

            return Ok(new { message = "Automation rule deleted successfully" });
        }

        // Helper method
        private int? GetUserId()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var userId))
            {
                return userId;
            }
            return null;
        }
    }

    public class CreateDepartmentDto { public string Name { get; set; } = null!; public string? Description { get; set; } }
    public class AssignRoleDto { public string UserId { get; set; } = null!; public string Role { get; set; } = null!; }
    
    public class CreateSLAPlanDto
    {
        public Guid TenantId { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public int ResponseTimeMinutes { get; set; }
        public int ResolutionTimeMinutes { get; set; }
        public CalendarMode Calendar { get; set; } = CalendarMode.BusinessHours;
        public string? EscalationPolicyJson { get; set; }
    }

    public class UpdateSLAPlanDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public int? ResponseTimeMinutes { get; set; }
        public int? ResolutionTimeMinutes { get; set; }
        public CalendarMode? Calendar { get; set; }
        public string? EscalationPolicyJson { get; set; }
        public bool? IsActive { get; set; }
    }
}
