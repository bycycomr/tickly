using System;

namespace Tickly.Api.Models
{
    public enum RoleName
    {
        SuperAdmin = 0,
        DepartmentManager = 1,
        TeamLead = 2, // Takım Lideri - DepartmentManager ile aynı yetkilere sahip
        DepartmentStaff = 3,
        EndUser = 4
    }

    public class RoleAssignment
    {
        public int Id { get; set; }
        public string UserId { get; set; } = null!;
        public Guid TenantId { get; set; }
        public int? DepartmentId { get; set; } // null => global role
        public RoleName Role { get; set; }
        public string? AssignedBy { get; set; }
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    }
}
