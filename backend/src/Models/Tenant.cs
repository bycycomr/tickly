using System;
using System.Text.Json;

namespace Tickly.Api.Models
{
    public enum TenantPlan
    {
        Standard = 0,
        Premium = 1,
        Enterprise = 2
    }

    public class Tenant
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = null!;
        public string PrimaryDomain { get; set; } = null!;
        public TenantPlan Plan { get; set; } = TenantPlan.Standard;
        public JsonDocument? SettingsJson { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? DeletedAt { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
