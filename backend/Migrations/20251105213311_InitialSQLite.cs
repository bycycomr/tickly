using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Tickly.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialSQLite : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Attachments",
                columns: table => new
                {
                    Id = table.Column<long>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    TicketId = table.Column<int>(type: "INTEGER", nullable: false),
                    TenantId = table.Column<Guid>(type: "TEXT", nullable: false),
                    FileName = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    MimeType = table.Column<string>(type: "TEXT", nullable: false),
                    StoragePath = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: false),
                    SizeBytes = table.Column<long>(type: "INTEGER", nullable: false),
                    Checksum = table.Column<string>(type: "TEXT", nullable: true),
                    UploadedBy = table.Column<string>(type: "TEXT", nullable: true),
                    ScannedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    ScanStatus = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Attachments", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AuditLogs",
                columns: table => new
                {
                    Id = table.Column<long>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    TenantId = table.Column<Guid>(type: "TEXT", nullable: true),
                    ActorId = table.Column<string>(type: "TEXT", nullable: true),
                    ActorRole = table.Column<string>(type: "TEXT", nullable: true),
                    Entity = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    EntityId = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Action = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    DiffJson = table.Column<string>(type: "TEXT", nullable: true),
                    IpAddress = table.Column<string>(type: "TEXT", nullable: true),
                    UserAgent = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AutomationRules",
                columns: table => new
                {
                    Id = table.Column<long>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    TenantId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: true),
                    Enabled = table.Column<bool>(type: "INTEGER", nullable: false),
                    Trigger = table.Column<int>(type: "INTEGER", nullable: false),
                    ConditionJson = table.Column<string>(type: "TEXT", nullable: true),
                    ActionJson = table.Column<string>(type: "TEXT", nullable: true),
                    Priority = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedBy = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    LastRunAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AutomationRules", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    TenantId = table.Column<Guid>(type: "TEXT", nullable: false),
                    DepartmentId = table.Column<int>(type: "INTEGER", nullable: true),
                    ParentId = table.Column<int>(type: "INTEGER", nullable: true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    FormSchemaJson = table.Column<string>(type: "TEXT", nullable: true),
                    Visibility = table.Column<int>(type: "INTEGER", nullable: false),
                    SortOrder = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Departments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    TenantId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    VisibilityPolicy = table.Column<int>(type: "INTEGER", nullable: false),
                    ModulesEnabledJson = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Departments", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EmailInbounds",
                columns: table => new
                {
                    Id = table.Column<long>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    TenantId = table.Column<Guid>(type: "TEXT", nullable: false),
                    RawMessageId = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    FromAddress = table.Column<string>(type: "TEXT", nullable: false),
                    ToAddress = table.Column<string>(type: "TEXT", nullable: false),
                    Subject = table.Column<string>(type: "TEXT", nullable: true),
                    ParsedJson = table.Column<string>(type: "TEXT", nullable: true),
                    TicketId = table.Column<int>(type: "INTEGER", nullable: true),
                    ReceivedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ProcessedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Status = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmailInbounds", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RoleAssignments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserId = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    TenantId = table.Column<Guid>(type: "TEXT", nullable: false),
                    DepartmentId = table.Column<int>(type: "INTEGER", nullable: true),
                    Role = table.Column<int>(type: "INTEGER", nullable: false),
                    AssignedBy = table.Column<string>(type: "TEXT", nullable: true),
                    AssignedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoleAssignments", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SLAPlans",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    TenantId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: true),
                    ResponseTimeMinutes = table.Column<int>(type: "INTEGER", nullable: false),
                    ResolutionTimeMinutes = table.Column<int>(type: "INTEGER", nullable: false),
                    EscalationPolicyJson = table.Column<string>(type: "TEXT", nullable: true),
                    Calendar = table.Column<int>(type: "INTEGER", nullable: false),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SLAPlans", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Tenants",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    PrimaryDomain = table.Column<string>(type: "TEXT", maxLength: 250, nullable: false),
                    Plan = table.Column<int>(type: "INTEGER", nullable: false),
                    SettingsJson = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tenants", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TicketEvents",
                columns: table => new
                {
                    Id = table.Column<long>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    TicketId = table.Column<int>(type: "INTEGER", nullable: false),
                    TenantId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Type = table.Column<int>(type: "INTEGER", nullable: false),
                    ActorId = table.Column<string>(type: "TEXT", nullable: true),
                    Visibility = table.Column<int>(type: "INTEGER", nullable: false),
                    PayloadJson = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TicketEvents", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    TenantId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Username = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    DisplayName = table.Column<string>(type: "TEXT", maxLength: 250, nullable: true),
                    Email = table.Column<string>(type: "TEXT", maxLength: 250, nullable: true),
                    PasswordHash = table.Column<string>(type: "TEXT", nullable: true),
                    AuthProvider = table.Column<int>(type: "INTEGER", nullable: false),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    DepartmentId = table.Column<int>(type: "INTEGER", nullable: true),
                    LastLoginAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    MetadataJson = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Tickets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    TenantId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 250, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 4000, nullable: true),
                    CreatorId = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    DepartmentId = table.Column<int>(type: "INTEGER", nullable: true),
                    AssignedToUserId = table.Column<string>(type: "TEXT", nullable: true),
                    CategoryId = table.Column<int>(type: "INTEGER", nullable: true),
                    SLAPlanId = table.Column<int>(type: "INTEGER", nullable: true),
                    Channel = table.Column<int>(type: "INTEGER", nullable: false),
                    Priority = table.Column<int>(type: "INTEGER", nullable: false),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    Tags = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    EstimatedResolutionAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    DueAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    ClosedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    LastEventAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tickets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tickets_Departments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalTable: "Departments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Attachments_ScanStatus",
                table: "Attachments",
                column: "ScanStatus");

            migrationBuilder.CreateIndex(
                name: "IX_Attachments_TicketId",
                table: "Attachments",
                column: "TicketId");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_TenantId_CreatedAt",
                table: "AuditLogs",
                columns: new[] { "TenantId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_AutomationRules_TenantId_Trigger_Enabled",
                table: "AutomationRules",
                columns: new[] { "TenantId", "Trigger", "Enabled" });

            migrationBuilder.CreateIndex(
                name: "IX_Categories_TenantId_DepartmentId_ParentId",
                table: "Categories",
                columns: new[] { "TenantId", "DepartmentId", "ParentId" });

            migrationBuilder.CreateIndex(
                name: "IX_Departments_TenantId_Name",
                table: "Departments",
                columns: new[] { "TenantId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EmailInbounds_RawMessageId",
                table: "EmailInbounds",
                column: "RawMessageId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EmailInbounds_TenantId_Status",
                table: "EmailInbounds",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_RoleAssignments_TenantId_UserId_DepartmentId_Role",
                table: "RoleAssignments",
                columns: new[] { "TenantId", "UserId", "DepartmentId", "Role" });

            migrationBuilder.CreateIndex(
                name: "IX_SLAPlans_TenantId_Name",
                table: "SLAPlans",
                columns: new[] { "TenantId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Tenants_PrimaryDomain",
                table: "Tenants",
                column: "PrimaryDomain",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TicketEvents_TicketId_CreatedAt",
                table: "TicketEvents",
                columns: new[] { "TicketId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_DepartmentId",
                table: "Tickets",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_TenantId_CreatorId",
                table: "Tickets",
                columns: new[] { "TenantId", "CreatorId" });

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_TenantId_DepartmentId_Status",
                table: "Tickets",
                columns: new[] { "TenantId", "DepartmentId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Users_TenantId_Email",
                table: "Users",
                columns: new[] { "TenantId", "Email" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Attachments");

            migrationBuilder.DropTable(
                name: "AuditLogs");

            migrationBuilder.DropTable(
                name: "AutomationRules");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropTable(
                name: "EmailInbounds");

            migrationBuilder.DropTable(
                name: "RoleAssignments");

            migrationBuilder.DropTable(
                name: "SLAPlans");

            migrationBuilder.DropTable(
                name: "Tenants");

            migrationBuilder.DropTable(
                name: "TicketEvents");

            migrationBuilder.DropTable(
                name: "Tickets");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Departments");
        }
    }
}
