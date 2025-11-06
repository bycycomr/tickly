using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Tickly.Api.Data;
using Tickly.Api.Models;
using Tickly.Api.Services;

namespace Tickly.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CategoriesController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly AuditService _audit;

        public CategoriesController(AppDbContext db, AuditService audit)
        {
            _db = db;
            _audit = audit;
        }

        private Guid? GetTenantId()
        {
            var claim = User?.FindFirst("tenant_id");
            return claim != null && Guid.TryParse(claim.Value, out var tid) ? tid : null;
        }

        private string? GetUserId()
        {
            // .NET maps "sub" claim to ClaimTypes.NameIdentifier
            return User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                ?? User?.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int? departmentId = null)
        {
            var tenantId = GetTenantId();
            if (tenantId == null) return Unauthorized();

            var query = _db.Categories.Where(c => c.TenantId == tenantId.Value);

            if (departmentId.HasValue)
            {
                query = query.Where(c => c.DepartmentId == departmentId.Value || c.DepartmentId == null);
            }

            var categories = await query
                .OrderBy(c => c.SortOrder)
                .ThenBy(c => c.Name)
                .ToListAsync();

            return Ok(categories);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> Get(int id)
        {
            var tenantId = GetTenantId();
            if (tenantId == null) return Unauthorized();

            var category = await _db.Categories
                .FirstOrDefaultAsync(c => c.Id == id && c.TenantId == tenantId.Value);

            if (category == null) return NotFound();
            return Ok(category);
        }

        [HttpPost]
        [Authorize(Policy = "SuperAdminOnly")]
        public async Task<IActionResult> Create([FromBody] CategoryCreateRequest req)
        {
            var tenantId = GetTenantId();
            var userId = GetUserId();
            if (tenantId == null || userId == null) return Unauthorized();

            var category = new Category
            {
                TenantId = tenantId.Value,
                DepartmentId = req.DepartmentId,
                ParentId = req.ParentId,
                Name = req.Name,
                FormSchemaJson = req.FormSchemaJson,
                Visibility = req.Visibility,
                SortOrder = req.SortOrder
            };

            _db.Categories.Add(category);
            await _db.SaveChangesAsync();

            await _audit.LogAsync(
                tenantId,
                userId,
                "CompanyAdmin",
                "Category",
                category.Id.ToString(),
                "Create",
                null,
                category
            );

            return CreatedAtAction(nameof(Get), new { id = category.Id }, category);
        }

        [HttpPut("{id:int}")]
        [Authorize(Policy = "SuperAdminOnly")]
        public async Task<IActionResult> Update(int id, [FromBody] CategoryUpdateRequest req)
        {
            var tenantId = GetTenantId();
            var userId = GetUserId();
            if (tenantId == null || userId == null) return Unauthorized();

            var category = await _db.Categories
                .FirstOrDefaultAsync(c => c.Id == id && c.TenantId == tenantId.Value);

            if (category == null) return NotFound();

            var before = new { category.Name, category.FormSchemaJson, category.SortOrder };

            category.Name = req.Name ?? category.Name;
            category.FormSchemaJson = req.FormSchemaJson ?? category.FormSchemaJson;
            category.SortOrder = req.SortOrder ?? category.SortOrder;
            category.Visibility = req.Visibility ?? category.Visibility;

            await _db.SaveChangesAsync();

            await _audit.LogAsync(
                tenantId,
                userId,
                "CompanyAdmin",
                "Category",
                id.ToString(),
                "Update",
                before,
                new { category.Name, category.FormSchemaJson, category.SortOrder }
            );

            return NoContent();
        }

        [HttpDelete("{id:int}")]
        [Authorize(Policy = "SuperAdminOnly")]
        public async Task<IActionResult> Delete(int id)
        {
            var tenantId = GetTenantId();
            var userId = GetUserId();
            if (tenantId == null || userId == null) return Unauthorized();

            var category = await _db.Categories
                .FirstOrDefaultAsync(c => c.Id == id && c.TenantId == tenantId.Value);

            if (category == null) return NotFound();

            _db.Categories.Remove(category);
            await _db.SaveChangesAsync();

            await _audit.LogAsync(
                tenantId,
                userId,
                "CompanyAdmin",
                "Category",
                id.ToString(),
                "Delete",
                category,
                null
            );

            return NoContent();
        }

        [HttpGet("tree")]
        public async Task<IActionResult> GetTree([FromQuery] int? departmentId = null)
        {
            var tenantId = GetTenantId();
            if (tenantId == null) return Unauthorized();

            var query = _db.Categories.Where(c => c.TenantId == tenantId.Value);

            if (departmentId.HasValue)
            {
                query = query.Where(c => c.DepartmentId == departmentId.Value || c.DepartmentId == null);
            }

            var categories = await query
                .OrderBy(c => c.SortOrder)
                .ThenBy(c => c.Name)
                .ToListAsync();

            var tree = BuildTree(categories, null);
            return Ok(tree);
        }

        private List<CategoryTreeNode> BuildTree(List<Category> all, int? parentId)
        {
            return all
                .Where(c => c.ParentId == parentId)
                .Select(c => new CategoryTreeNode
                {
                    Category = c,
                    Children = BuildTree(all, c.Id)
                })
                .ToList();
        }
    }

    public record CategoryCreateRequest(
        int? DepartmentId,
        int? ParentId,
        string Name,
        string? FormSchemaJson,
        CategoryVisibility Visibility,
        int SortOrder
    );

    public record CategoryUpdateRequest(
        string? Name,
        string? FormSchemaJson,
        CategoryVisibility? Visibility,
        int? SortOrder
    );

    public class CategoryTreeNode
    {
        public Category Category { get; set; } = null!;
        public List<CategoryTreeNode> Children { get; set; } = new();
    }
}
