using System;

namespace Tickly.Api.Models
{
    public enum ArticleStatus
    {
        Draft = 0,
        Published = 1,
        Archived = 2
    }

    public class Article
    {
        public long Id { get; set; }
        public Guid TenantId { get; set; }
        public int? DepartmentId { get; set; }
        public int? CategoryId { get; set; }
        
        public string Title { get; set; } = null!;
        public string Slug { get; set; } = null!;
        public string Content { get; set; } = null!;
        public string? Summary { get; set; }
        
        public ArticleStatus Status { get; set; } = ArticleStatus.Draft;
        public bool IsFeatured { get; set; } = false;
        public int ViewCount { get; set; } = 0;
        public int HelpfulCount { get; set; } = 0;
        
        public string? Tags { get; set; } // Comma-separated tags
        public string? AuthorId { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? PublishedAt { get; set; }
        
        // Navigation
        public Department? Department { get; set; }
        public Category? Category { get; set; }
    }
}
