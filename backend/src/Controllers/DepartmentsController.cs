using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Tickly.Api.Data;
using Tickly.Api.Models;

namespace Tickly.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DepartmentsController : ControllerBase
    {
        private readonly AppDbContext _db;
        
        public DepartmentsController(AppDbContext db) 
        { 
            _db = db;
        }

        // GET: api/departments
        [HttpGet]
        [AllowAnonymous] // Herkes departman listesini görebilir
        public async Task<IActionResult> GetAll()
        {
            var departments = await _db.Departments
                .OrderBy(d => d.Name)
                .ToListAsync();
            return Ok(departments);
        }

        // GET: api/departments/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var department = await _db.Departments.FindAsync(id);
            if (department == null) 
                return NotFound(new { error = "Department not found" });
            
            return Ok(department);
        }

        // GET: api/departments/{id}/users
        [HttpGet("{id}/users")]
        public async Task<IActionResult> GetDepartmentUsers(int id)
        {
            var department = await _db.Departments.FindAsync(id);
            if (department == null) 
                return NotFound(new { error = "Department not found" });

            var userIds = await _db.RoleAssignments
                .Where(ra => ra.DepartmentId == id)
                .Select(ra => ra.UserId)
                .Distinct()
                .ToListAsync();

            var users = await _db.Users
                .Where(u => userIds.Contains(u.Id))
                .Select(u => new 
                { 
                    u.Id, 
                    u.Username, 
                    u.Email, 
                    u.DisplayName 
                })
                .ToListAsync();

            return Ok(users);
        }

        // DELETE: api/departments/{departmentId}/users/{userId}
        [HttpDelete("{departmentId}/users/{userId}")]
        [Authorize(Roles = "SuperAdmin,DepartmentManager")]
        public async Task<IActionResult> RemoveDepartmentRole(int departmentId, string userId)
        {
            var currentUserId = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (currentUserId == null) return Unauthorized();

            var department = await _db.Departments.FindAsync(departmentId);
            if (department == null) 
                return NotFound(new { error = "Department not found" });

            // Kendini çıkaramaz
            if (currentUserId == userId)
                return BadRequest(new { error = "You cannot remove yourself from the department" });

            // DepartmentManager sadece kendi departmanından çıkarabilir
            var currentUserRole = User?.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            if (currentUserRole == "DepartmentManager")
            {
                var isManagerOfDept = await _db.RoleAssignments
                    .AnyAsync(ra => ra.UserId == currentUserId 
                        && ra.DepartmentId == departmentId 
                        && ra.Role == RoleName.DepartmentManager);
                
                if (!isManagerOfDept)
                    return Forbid();
            }

            // Kullanıcının bu departmandaki tüm rol atamalarını bul
            var roleAssignments = await _db.RoleAssignments
                .Where(ra => ra.UserId == userId && ra.DepartmentId == departmentId)
                .ToListAsync();

            if (!roleAssignments.Any())
                return NotFound(new { error = "User is not assigned to this department" });

            // Rol atamalarını sil
            _db.RoleAssignments.RemoveRange(roleAssignments);
            await _db.SaveChangesAsync();

            return Ok(new { message = "User successfully removed from department" });
        }
    }
}
