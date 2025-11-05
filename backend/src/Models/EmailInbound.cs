using System;

namespace Tickly.Api.Models
{
    public enum EmailStatus
    {
        Pending = 0,
        Processed = 1,
        Failed = 2,
        Rerouted = 3
    }

    public class EmailInbound
    {
        public long Id { get; set; }
        public Guid TenantId { get; set; }
        public string RawMessageId { get; set; } = null!;
        public string FromAddress { get; set; } = null!;
        public string ToAddress { get; set; } = null!;
        public string? Subject { get; set; }
        public string? ParsedJson { get; set; }
        public int? TicketId { get; set; }
        public DateTime ReceivedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ProcessedAt { get; set; }
        public EmailStatus Status { get; set; } = EmailStatus.Pending;
    }
}
