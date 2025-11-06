using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.RegularExpressions;
using Tickly.Api.Data;
using Tickly.Api.Models;

namespace Tickly.Api.Controllers
{
    [ApiController]
    [Route("api/kb")]
    [Authorize]
    public class KnowledgeBaseController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly ILogger<KnowledgeBaseController> _logger;

        public KnowledgeBaseController(AppDbContext db, ILogger<KnowledgeBaseController> logger)
        {
            _db = db;
            _logger = logger;
        }

        private string? GetUserId()
        {
            return User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                   ?? User?.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
        }

        private Guid? GetTenantId()
        {
            var tenantIdClaim = User?.FindFirst("tenant_id")?.Value;
            if (Guid.TryParse(tenantIdClaim, out var tenantId))
            {
                return tenantId;
            }
            return null;
        }

        // GET /api/kb - List published articles (public access)
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetArticles(
            [FromQuery] int? departmentId,
            [FromQuery] int? categoryId,
            [FromQuery] string? search,
            [FromQuery] bool featured = false)
        {
            // For anonymous access, we need to handle missing tenant
            var tenantId = GetTenantId();
            
            // If no tenant context, return all published articles (multi-tenant safe)
            var query = _db.Articles
                .Where(a => a.Status == ArticleStatus.Published);
            
            // If user is authenticated and has tenant, filter by tenant
            if (tenantId.HasValue)
                query = query.Where(a => a.TenantId == tenantId.Value);

            if (departmentId.HasValue)
                query = query.Where(a => a.DepartmentId == departmentId.Value || a.DepartmentId == null);

            if (categoryId.HasValue)
                query = query.Where(a => a.CategoryId == categoryId.Value);

            if (featured)
                query = query.Where(a => a.IsFeatured);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchLower = search.ToLower();
                query = query.Where(a =>
                    a.Title.ToLower().Contains(searchLower) ||
                    a.Content.ToLower().Contains(searchLower) ||
                    (a.Tags != null && a.Tags.ToLower().Contains(searchLower))
                );
            }

            var articles = await query
                .OrderByDescending(a => a.IsFeatured)
                .ThenByDescending(a => a.PublishedAt)
                .Select(a => new
                {
                    a.Id,
                    a.Title,
                    a.Slug,
                    a.Summary,
                    a.DepartmentId,
                    a.CategoryId,
                    a.IsFeatured,
                    a.ViewCount,
                    a.HelpfulCount,
                    a.Tags,
                    a.PublishedAt
                })
                .ToListAsync();

            return Ok(articles);
        }

        // GET /api/kb/{slug} - Get article by slug
        [HttpGet("{slug}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetArticle(string slug)
        {
            var tenantId = GetTenantId();
            if (tenantId == null)
                return Unauthorized(new { error = "Tenant ID bulunamadı" });

            var article = await _db.Articles
                .Include(a => a.Department)
                .Include(a => a.Category)
                .FirstOrDefaultAsync(a => a.TenantId == tenantId && a.Slug == slug);

            if (article == null)
                return NotFound(new { error = "Makale bulunamadı" });

            // Only show published articles to non-admin users
            if (article.Status != ArticleStatus.Published && !User.Identity?.IsAuthenticated == true)
                return NotFound(new { error = "Makale bulunamadı" });

            // Increment view count
            article.ViewCount++;
            await _db.SaveChangesAsync();

            return Ok(new
            {
                article.Id,
                article.Title,
                article.Slug,
                article.Content,
                article.Summary,
                article.DepartmentId,
                DepartmentName = article.Department?.Name,
                article.CategoryId,
                CategoryName = article.Category?.Name,
                article.Status,
                article.IsFeatured,
                article.ViewCount,
                article.HelpfulCount,
                article.Tags,
                article.AuthorId,
                article.CreatedAt,
                article.UpdatedAt,
                article.PublishedAt
            });
        }

        // POST /api/kb/{id}/helpful - Mark article as helpful
        [HttpPost("{id}/helpful")]
        public async Task<IActionResult> MarkHelpful(long id)
        {
            var tenantId = GetTenantId();
            if (tenantId == null)
                return Unauthorized(new { error = "Tenant ID bulunamadı" });

            var article = await _db.Articles
                .FirstOrDefaultAsync(a => a.TenantId == tenantId && a.Id == id);

            if (article == null)
                return NotFound(new { error = "Makale bulunamadı" });

            article.HelpfulCount++;
            await _db.SaveChangesAsync();

            return Ok(new { helpfulCount = article.HelpfulCount });
        }

        // Admin endpoints
        [Authorize(Policy = "SuperAdminOnly")]
        [HttpGet("admin/all")]
        public async Task<IActionResult> GetAllArticles(
            [FromQuery] ArticleStatus? status,
            [FromQuery] int? departmentId)
        {
            var tenantId = GetTenantId();
            if (tenantId == null)
                return Unauthorized(new { error = "Tenant ID bulunamadı" });

            var query = _db.Articles
                .Where(a => a.TenantId == tenantId);

            if (status.HasValue)
                query = query.Where(a => a.Status == status.Value);

            if (departmentId.HasValue)
                query = query.Where(a => a.DepartmentId == departmentId.Value);

            var articles = await query
                .Include(a => a.Department)
                .Include(a => a.Category)
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new
                {
                    a.Id,
                    a.Title,
                    a.Slug,
                    a.Summary,
                    a.Status,
                    a.IsFeatured,
                    a.ViewCount,
                    a.HelpfulCount,
                    DepartmentName = a.Department != null ? a.Department.Name : null,
                    CategoryName = a.Category != null ? a.Category.Name : null,
                    a.AuthorId,
                    a.CreatedAt,
                    a.UpdatedAt,
                    a.PublishedAt
                })
                .ToListAsync();

            return Ok(articles);
        }

        [Authorize(Policy = "SuperAdminOnly")]
        [HttpPost("admin")]
        public async Task<IActionResult> CreateArticle([FromBody] CreateArticleDto dto)
        {
            var tenantId = GetTenantId();
            if (tenantId == null)
                return Unauthorized(new { error = "Tenant ID bulunamadı" });

            var userId = GetUserId();

            // Generate slug from title
            var slug = GenerateSlug(dto.Title);

            // Check if slug already exists
            var existingSlug = await _db.Articles
                .AnyAsync(a => a.TenantId == tenantId && a.Slug == slug);

            if (existingSlug)
            {
                slug = $"{slug}-{Guid.NewGuid().ToString().Substring(0, 8)}";
            }

            var article = new Article
            {
                TenantId = tenantId.Value,
                DepartmentId = dto.DepartmentId,
                CategoryId = dto.CategoryId,
                Title = dto.Title,
                Slug = slug,
                Content = dto.Content,
                Summary = dto.Summary,
                Status = dto.Status ?? ArticleStatus.Draft,
                IsFeatured = dto.IsFeatured,
                Tags = dto.Tags,
                AuthorId = userId,
                CreatedAt = DateTime.UtcNow
            };

            if (article.Status == ArticleStatus.Published)
            {
                article.PublishedAt = DateTime.UtcNow;
            }

            _db.Articles.Add(article);
            await _db.SaveChangesAsync();

            return Ok(article);
        }

        [Authorize(Policy = "SuperAdminOnly")]
        [HttpPut("admin/{id}")]
        public async Task<IActionResult> UpdateArticle(long id, [FromBody] CreateArticleDto dto)
        {
            var tenantId = GetTenantId();
            if (tenantId == null)
                return Unauthorized(new { error = "Tenant ID bulunamadı" });

            var article = await _db.Articles
                .FirstOrDefaultAsync(a => a.TenantId == tenantId && a.Id == id);

            if (article == null)
                return NotFound(new { error = "Makale bulunamadı" });

            var oldStatus = article.Status;

            article.DepartmentId = dto.DepartmentId;
            article.CategoryId = dto.CategoryId;
            article.Title = dto.Title;
            article.Content = dto.Content;
            article.Summary = dto.Summary;
            article.Status = dto.Status ?? article.Status;
            article.IsFeatured = dto.IsFeatured;
            article.Tags = dto.Tags;
            article.UpdatedAt = DateTime.UtcNow;

            // Set published date if transitioning to published
            if (oldStatus != ArticleStatus.Published && article.Status == ArticleStatus.Published)
            {
                article.PublishedAt = DateTime.UtcNow;
            }

            await _db.SaveChangesAsync();

            return Ok(article);
        }

        [Authorize(Policy = "SuperAdminOnly")]
        [HttpDelete("admin/{id}")]
        public async Task<IActionResult> DeleteArticle(long id)
        {
            var tenantId = GetTenantId();
            if (tenantId == null)
                return Unauthorized(new { error = "Tenant ID bulunamadı" });

            var article = await _db.Articles
                .FirstOrDefaultAsync(a => a.TenantId == tenantId && a.Id == id);

            if (article == null)
                return NotFound(new { error = "Makale bulunamadı" });

            _db.Articles.Remove(article);
            await _db.SaveChangesAsync();

            return NoContent();
        }

        private static string GenerateSlug(string title)
        {
            // Convert to lowercase
            var slug = title.ToLowerInvariant();

            // Replace Turkish characters
            slug = slug.Replace("ş", "s")
                       .Replace("ğ", "g")
                       .Replace("ı", "i")
                       .Replace("ö", "o")
                       .Replace("ü", "u")
                       .Replace("ç", "c");

            // Remove non-alphanumeric characters
            slug = Regex.Replace(slug, @"[^a-z0-9\s-]", "");

            // Replace spaces with hyphens
            slug = Regex.Replace(slug, @"\s+", "-");

            // Remove consecutive hyphens
            slug = Regex.Replace(slug, @"-+", "-");

            // Trim hyphens from start and end
            slug = slug.Trim('-');

            return slug;
        }
    }

    public class CreateArticleDto
    {
        public int? DepartmentId { get; set; }
        public int? CategoryId { get; set; }
        public string Title { get; set; } = null!;
        public string Content { get; set; } = null!;
        public string? Summary { get; set; }
        public ArticleStatus? Status { get; set; }
        public bool IsFeatured { get; set; }
        public string? Tags { get; set; }
    }
}
