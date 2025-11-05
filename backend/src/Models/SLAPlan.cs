using System;

namespace Tickly.Api.Models
{
    public enum CalendarMode
    {
        BusinessHours = 0,
        TwentyFourSeven = 1
    }

    public class SLAPlan
    {
        public int Id { get; set; }
        public Guid TenantId { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public int ResponseTimeMinutes { get; set; }
        public int ResolutionTimeMinutes { get; set; }
        public string? EscalationPolicyJson { get; set; }
        public CalendarMode Calendar { get; set; } = CalendarMode.BusinessHours;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
