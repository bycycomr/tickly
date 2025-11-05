using System;
using System.Net;

namespace Tickly.Api.Models
{
    public class AuditLog
    {
        public long Id { get; set; }
        public Guid? TenantId { get; set; }
        public string? ActorId { get; set; }
        public string? ActorRole { get; set; }
        public string Entity { get; set; } = null!;
        public string EntityId { get; set; } = null!;
        public string Action { get; set; } = null!;
        public string? DiffJson { get; set; }
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
