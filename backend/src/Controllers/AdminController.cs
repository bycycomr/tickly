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
    [Authorize] // Genel authorize, her endpoint kendi policy'sini belirler
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
        [AllowAnonymous] // Departman listesi herkes görebilir
        public IActionResult GetDepartments()
        {
            var deps = _db.Departments.ToList();
            return Ok(deps);
        }

        [HttpPost("departments")]
        [Authorize(Policy = "SuperAdminOnly")]
        public IActionResult CreateDepartment([FromBody] CreateDepartmentDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name)) return BadRequest(new { error = "Name required" });
            var d = new Department { Name = dto.Name, Description = dto.Description };
            _db.Departments.Add(d);
            _db.SaveChanges();
            return Ok(d);
        }

        [HttpPut("departments/{id}")]
        [Authorize(Policy = "SuperAdminOnly")]
        public IActionResult UpdateDepartment(int id, [FromBody] CreateDepartmentDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name)) return BadRequest(new { error = "Name required" });
            
            var dept = _db.Departments.Find(id);
            if (dept == null) return NotFound(new { error = "Department not found" });
            
            dept.Name = dto.Name;
            dept.Description = dto.Description;
            _db.SaveChanges();
            
            return Ok(dept);
        }

        [HttpDelete("departments/{id}")]
        [Authorize(Policy = "SuperAdminOnly")]
        public IActionResult DeleteDepartment(int id)
        {
            var dept = _db.Departments.Find(id);
            if (dept == null) return NotFound(new { error = "Department not found" });
            
            // Check if department has users
            var hasUsers = _db.RoleAssignments.Any(r => r.DepartmentId == id);
            if (hasUsers)
                return BadRequest(new { error = "Cannot delete department with assigned users" });
            
            _db.Departments.Remove(dept);
            _db.SaveChanges();
            return Ok(new { message = "Department deleted successfully" });
        }

        // User Management
        [HttpGet("users")]
        public IActionResult GetUsers()
        {
            var users = _db.Users
                .Select(u => new
                {
                    u.Id,
                    u.Username,
                    u.Email,
                    u.DisplayName,
                    u.Status,
                    u.DepartmentId,
                    u.OrganizationalDepartment,
                    u.JobTitle,
                    u.CreatedAt,
                    Roles = _db.RoleAssignments
                        .Where(r => r.UserId == u.Id)
                        .Select(r => r.Role.ToString())
                        .ToList()
                })
                .ToList();
            return Ok(users);
        }

        [HttpGet("users/{id}")]
        public IActionResult GetUser(string id)
        {
            var user = _db.Users.Find(id);
            if (user == null) return NotFound(new { error = "User not found" });
            
            var roles = _db.RoleAssignments.Where(r => r.UserId == id).ToList();
            
            return Ok(new
            {
                user.Id,
                user.Username,
                user.Email,
                user.DisplayName,
                user.Status,
                user.DepartmentId,
                user.CreatedAt,
                Roles = roles
            });
        }

        [HttpPut("users/{id}")]
        public IActionResult UpdateUser(string id, [FromBody] UpdateUserDto dto)
        {
            var user = _db.Users.Find(id);
            if (user == null) return NotFound(new { error = "User not found" });
            
            if (!string.IsNullOrWhiteSpace(dto.DisplayName))
                user.DisplayName = dto.DisplayName;
            
            if (!string.IsNullOrWhiteSpace(dto.Email))
                user.Email = dto.Email;
            
            if (dto.DepartmentId.HasValue)
                user.DepartmentId = dto.DepartmentId.Value;
            
            if (dto.Status.HasValue)
                user.Status = dto.Status.Value;
            
            if (dto.OrganizationalDepartment != null)
                user.OrganizationalDepartment = string.IsNullOrWhiteSpace(dto.OrganizationalDepartment) ? null : dto.OrganizationalDepartment;
            
            if (dto.JobTitle != null)
                user.JobTitle = string.IsNullOrWhiteSpace(dto.JobTitle) ? null : dto.JobTitle;
            
            _db.SaveChanges();
            return Ok(user);
        }

        [HttpDelete("users/{id}")]
        public IActionResult DeleteUser(string id)
        {
            var user = _db.Users.Find(id);
            if (user == null) return NotFound(new { error = "User not found" });
            
            // Check if this is the last SuperAdmin
            var isSuperAdmin = _db.RoleAssignments.Any(r => r.UserId == id && r.Role == RoleName.SuperAdmin);
            if (isSuperAdmin)
            {
                var superAdminCount = _db.RoleAssignments.Count(r => r.Role == RoleName.SuperAdmin);
                if (superAdminCount <= 1)
                {
                    return BadRequest(new { error = "Cannot delete the last SuperAdmin" });
                }
            }
            
            // Remove role assignments
            var roles = _db.RoleAssignments.Where(r => r.UserId == id).ToList();
            _db.RoleAssignments.RemoveRange(roles);
            
            // Remove user completely from database
            _db.Users.Remove(user);
            _db.SaveChanges();
            
            return Ok(new { message = "User deleted successfully" });
        }

        [HttpGet("departments/{id}/members")]
        [AllowAnonymous] // Ticket assignment için tüm kullanıcılar görebilir
        public IActionResult GetDepartmentMembers(int id)
        {
            var members = _db.RoleAssignments.Where(r => r.DepartmentId == id).ToList();
            var users = from m in members
                        join u in _db.Users on m.UserId equals u.Id
                        select new { 
                            AssignmentId = m.Id,  // Benzersiz key için RoleAssignment.Id
                            UserId = u.Id, 
                            u.Username, 
                            u.DisplayName, 
                            Role = m.Role 
                        };
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

        [HttpDelete("departments/{deptId}/users/{userId}")]
        public IActionResult RemoveUserFromDepartment(int deptId, string userId)
        {
            var user = _db.Users.Find(userId);
            if (user == null) return NotFound(new { error = "User not found" });

            var dept = _db.Departments.Find(deptId);
            if (dept == null) return NotFound(new { error = "Department not found" });

            var assignments = _db.RoleAssignments
                .Where(r => r.UserId == userId && r.DepartmentId == deptId)
                .ToList();

            if (assignments.Count == 0)
                return NotFound(new { error = "User is not assigned to this department" });

            _db.RoleAssignments.RemoveRange(assignments);
            _db.SaveChanges();

            return Ok(new { message = "User removed from department successfully" });
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
    
    public class UpdateUserDto
    {
        public string? DisplayName { get; set; }
        public string? Email { get; set; }
        public int? DepartmentId { get; set; }
        public UserStatus? Status { get; set; }
        public string? OrganizationalDepartment { get; set; }
        public string? JobTitle { get; set; }
    }
    
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

    public class CreateAutomationRuleDto
    {
        public Guid TenantId { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public AutomationTrigger Trigger { get; set; }
        public string? ConditionJson { get; set; }
        public string? ActionJson { get; set; }
        public int Priority { get; set; } = 100;
        public bool Enabled { get; set; } = true;
    }

    public class UpdateAutomationRuleDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public AutomationTrigger? Trigger { get; set; }
        public string? ConditionJson { get; set; }
        public string? ActionJson { get; set; }
        public int? Priority { get; set; }
        public bool? Enabled { get; set; }
    }
}
