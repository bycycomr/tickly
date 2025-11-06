using Microsoft.EntityFrameworkCore;
using Tickly.Api.Models;

namespace Tickly.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Tenant> Tenants { get; set; } = null!;
        public DbSet<Ticket> Tickets { get; set; } = null!;
        public DbSet<TicketEvent> TicketEvents { get; set; } = null!;
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Department> Departments { get; set; } = null!;
        public DbSet<RoleAssignment> RoleAssignments { get; set; } = null!;
        public DbSet<Attachment> Attachments { get; set; } = null!;
        public DbSet<Category> Categories { get; set; } = null!;
        public DbSet<SLAPlan> SLAPlans { get; set; } = null!;
        public DbSet<AutomationRule> AutomationRules { get; set; } = null!;
        public DbSet<EmailInbound> EmailInbounds { get; set; } = null!;
        public DbSet<AuditLog> AuditLogs { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Tenant>(b =>
            {
                b.HasKey(t => t.Id);
                b.Property(t => t.Name).IsRequired().HasMaxLength(200);
                b.Property(t => t.PrimaryDomain).IsRequired().HasMaxLength(250);
                b.HasIndex(t => t.PrimaryDomain).IsUnique();
            });

            modelBuilder.Entity<Ticket>(b =>
            {
                b.HasKey(t => t.Id);
                b.Property(t => t.Title).IsRequired().HasMaxLength(250);
                b.Property(t => t.Description).HasMaxLength(4000);
                b.Property(t => t.CreatorId).HasMaxLength(50);
                b.HasIndex(t => new { t.TenantId, t.DepartmentId, t.Status });
                b.HasIndex(t => new { t.TenantId, t.CreatorId });
                b.HasOne<Department>().WithMany().HasForeignKey(t => t.DepartmentId).OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<TicketEvent>(b =>
            {
                b.HasKey(e => e.Id);
                b.HasIndex(e => new { e.TicketId, e.CreatedAt });
            });

            modelBuilder.Entity<User>(b =>
            {
                b.HasKey(u => u.Id);
                b.Property(u => u.Username).IsRequired().HasMaxLength(100);
                b.Property(u => u.DisplayName).HasMaxLength(250);
                b.Property(u => u.Email).HasMaxLength(250);
                b.HasIndex(u => new { u.TenantId, u.Email }).IsUnique();
            });

            modelBuilder.Entity<Department>(b =>
            {
                b.HasKey(d => d.Id);
                b.Property(d => d.Name).IsRequired().HasMaxLength(200);
                b.Property(d => d.Description).HasMaxLength(1000);
                b.HasIndex(d => new { d.TenantId, d.Name }).IsUnique();
            });

            modelBuilder.Entity<RoleAssignment>(b =>
            {
                b.HasKey(r => r.Id);
                b.Property(r => r.UserId).IsRequired().HasMaxLength(50);
                b.HasIndex(r => new { r.TenantId, r.UserId, r.DepartmentId, r.Role });
            });

            modelBuilder.Entity<Attachment>(b =>
            {
                b.HasKey(a => a.Id);
                b.Property(a => a.FileName).IsRequired().HasMaxLength(500);
                b.Property(a => a.StoragePath).IsRequired().HasMaxLength(1000);
                b.HasIndex(a => a.TicketId);
                b.HasIndex(a => a.ScanStatus);
            });

            modelBuilder.Entity<Category>(b =>
            {
                b.HasKey(c => c.Id);
                b.Property(c => c.Name).IsRequired().HasMaxLength(200);
                b.HasIndex(c => new { c.TenantId, c.DepartmentId, c.ParentId });
            });

            modelBuilder.Entity<SLAPlan>(b =>
            {
                b.HasKey(s => s.Id);
                b.Property(s => s.Name).IsRequired().HasMaxLength(200);
                b.HasIndex(s => new { s.TenantId, s.Name }).IsUnique();
            });

            modelBuilder.Entity<AutomationRule>(b =>
            {
                b.HasKey(r => r.Id);
                b.Property(r => r.Name).IsRequired().HasMaxLength(200);
                b.HasIndex(r => new { r.TenantId, r.Trigger, r.Enabled });
            });

            modelBuilder.Entity<EmailInbound>(b =>
            {
                b.HasKey(e => e.Id);
                b.Property(e => e.RawMessageId).IsRequired().HasMaxLength(500);
                b.HasIndex(e => e.RawMessageId).IsUnique();
                b.HasIndex(e => new { e.TenantId, e.Status });
            });

            modelBuilder.Entity<AuditLog>(b =>
            {
                b.HasKey(a => a.Id);
                b.Property(a => a.Entity).IsRequired().HasMaxLength(100);
                b.Property(a => a.EntityId).IsRequired().HasMaxLength(100);
                b.Property(a => a.Action).IsRequired().HasMaxLength(50);
                b.HasIndex(a => new { a.TenantId, a.CreatedAt });
            });
        }
    }
}
