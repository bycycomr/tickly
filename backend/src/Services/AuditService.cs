using System;
using System.Text.Json;
using System.Threading.Tasks;
using Tickly.Api.Data;
using Tickly.Api.Models;

namespace Tickly.Api.Services
{
    public class AuditService
    {
        private readonly AppDbContext _db;

        public AuditService(AppDbContext db)
        {
            _db = db;
        }

        public async Task LogAsync(
            Guid? tenantId,
            string? actorId,
            string? actorRole,
            string entity,
            string entityId,
            string action,
            object? before = null,
            object? after = null,
            string? ipAddress = null,
            string? userAgent = null)
        {
            var diff = new { before, after };
            var auditLog = new AuditLog
            {
                TenantId = tenantId,
                ActorId = actorId,
                ActorRole = actorRole,
                Entity = entity,
                EntityId = entityId,
                Action = action,
                DiffJson = JsonSerializer.Serialize(diff),
                IpAddress = ipAddress,
                UserAgent = userAgent,
                CreatedAt = DateTime.UtcNow
            };

            _db.AuditLogs.Add(auditLog);
            await _db.SaveChangesAsync();
        }
    }
}
