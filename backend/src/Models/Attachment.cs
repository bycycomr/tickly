using System;

namespace Tickly.Api.Models
{
    public enum ScanStatus
    {
        Pending = 0,
        Clean = 1,
        Quarantined = 2,
        Failed = 3
    }

    public class Attachment
    {
        public long Id { get; set; }
        public int TicketId { get; set; }
        public Guid TenantId { get; set; }
        public string FileName { get; set; } = null!;
        public string MimeType { get; set; } = null!;
        public string StoragePath { get; set; } = null!;
        public long SizeBytes { get; set; }
        public string? Checksum { get; set; }
        public string? UploadedBy { get; set; }
        public DateTime? ScannedAt { get; set; }
        public ScanStatus ScanStatus { get; set; } = ScanStatus.Pending;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
