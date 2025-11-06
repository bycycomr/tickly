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
    }
}
