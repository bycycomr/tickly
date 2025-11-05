using System;

namespace Tickly.Api.Models
{
    public enum VisibilityPolicy
    {
        TenantOnly = 0,
        AgentTeam = 1,
        Custom = 2
    }

    public class Department
    {
        public int Id { get; set; }
        public Guid TenantId { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public VisibilityPolicy VisibilityPolicy { get; set; } = VisibilityPolicy.TenantOnly;
        public string? ModulesEnabledJson { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
