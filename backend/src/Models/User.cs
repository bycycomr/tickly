using System;

namespace Tickly.Api.Models
{
    public enum AuthProvider
    {
        Local = 0,
        OIDC = 1,
        SCIM = 2
    }

    public enum UserStatus
    {
        Pending = 0,
        Active = 1,
        Suspended = 2,
        Archived = 3
    }

    public class User
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public Guid TenantId { get; set; }
        public string Username { get; set; } = null!;
        public string? DisplayName { get; set; }
        public string? Email { get; set; }
        public string? PasswordHash { get; set; }
        public AuthProvider AuthProvider { get; set; } = AuthProvider.Local;
        public UserStatus Status { get; set; } = UserStatus.Active;
        public int? DepartmentId { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public string? MetadataJson { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Password Reset
        public string? PasswordResetToken { get; set; }
        public DateTime? PasswordResetTokenExpiry { get; set; }
    }
}
