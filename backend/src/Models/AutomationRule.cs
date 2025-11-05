using System;

namespace Tickly.Api.Models
{
    public enum AutomationTrigger
    {
        TicketCreated = 0,
        TicketUpdated = 1,
        StatusChanged = 2,
        CommentAdded = 3,
        SLAWarning = 4,
        ScheduleCron = 5,
        InboundEmail = 6,
        CustomWebhook = 7
    }

    public class AutomationRule
    {
        public long Id { get; set; }
        public Guid TenantId { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public bool Enabled { get; set; } = true;
        public AutomationTrigger Trigger { get; set; }
        public string? ConditionJson { get; set; }
        public string? ActionJson { get; set; }
        public int Priority { get; set; } = 100;
        public string? CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastRunAt { get; set; }
    }
}
