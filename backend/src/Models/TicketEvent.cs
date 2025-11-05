using System;

namespace Tickly.Api.Models
{
    public enum TicketEventType
    {
        StatusChange = 0,
        CommentPublic = 1,
        CommentInternal = 2,
        Assignment = 3,
        AttachmentAdded = 4,
        Automation = 5,
        Escalation = 6,
        Merge = 7,
        SLABreach = 8,
        Custom = 9
    }

    public enum EventVisibility
    {
        Public = 0,
        Internal = 1
    }

    public class TicketEvent
    {
        public long Id { get; set; }
        public int TicketId { get; set; }
        public Guid TenantId { get; set; }
        public TicketEventType Type { get; set; }
        public string? ActorId { get; set; }
        public EventVisibility Visibility { get; set; } = EventVisibility.Public;
        public string? PayloadJson { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
