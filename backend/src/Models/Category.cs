using System;

namespace Tickly.Api.Models
{
    public enum CategoryVisibility
    {
        Tenant = 0,
        Department = 1
    }

    public class Category
    {
        public int Id { get; set; }
        public Guid TenantId { get; set; }
        public int? DepartmentId { get; set; }
        public int? ParentId { get; set; }
        public string Name { get; set; } = null!;
        public string? FormSchemaJson { get; set; }
        public CategoryVisibility Visibility { get; set; } = CategoryVisibility.Tenant;
        public int SortOrder { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
