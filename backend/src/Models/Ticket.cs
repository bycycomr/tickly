using System;
namespace Tickly.Api.Models
{
    public enum TicketStatus { New = 0, Assigned = 1, InProgress = 2, WaitingForInfo = 3, Completed = 4, Closed = 5, Rejected = 6, Merged = 7, Duplicate = 8 }
    public enum TicketPriority { Low = 0, Normal = 1, High = 2, Urgent = 3, Critical = 4 }
    public enum TicketChannel { Portal = 0, Email = 1, Phone = 2, API = 3, Chat = 4 }

    public class Ticket
    {
        public int Id { get; set; }
        public Guid TenantId { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public string? CreatorId { get; set; }
        public int? DepartmentId { get; set; }
        public string? AssignedToUserId { get; set; }
        public int? CategoryId { get; set; }
        public int? SLAPlanId { get; set; }
        public TicketChannel Channel { get; set; } = TicketChannel.Portal;
        public TicketPriority Priority { get; set; } = TicketPriority.Normal;
        public TicketStatus Status { get; set; } = TicketStatus.New;
        public string[]? Tags { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? EstimatedResolutionAt { get; set; }
        public DateTime? DueAt { get; set; }
        public DateTime? ClosedAt { get; set; }
        public DateTime? LastEventAt { get; set; }
    }
}
