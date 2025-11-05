using System;
using System.Text.Json;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Tickly.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddEnterpriseModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_RoleAssignments_UserId_DepartmentId_Role",
                table: "RoleAssignments");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Users");

            migrationBuilder.AddColumn<int>(
                name: "AuthProvider",
                table: "Users",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "DepartmentId",
                table: "Users",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastLoginAt",
                table: "Users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MetadataJson",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "Users",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "Users",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<int>(
                name: "CategoryId",
                table: "Tickets",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Channel",
                table: "Tickets",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "ClosedAt",
                table: "Tickets",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DueAt",
                table: "Tickets",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastEventAt",
                table: "Tickets",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SLAPlanId",
                table: "Tickets",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string[]>(
                name: "Tags",
                table: "Tickets",
                type: "text[]",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "Tickets",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Tickets",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "AssignedAt",
                table: "RoleAssignments",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "AssignedBy",
                table: "RoleAssignments",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "RoleAssignments",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Departments",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "ModulesEnabledJson",
                table: "Departments",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "Departments",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<int>(
                name: "VisibilityPolicy",
                table: "Departments",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Attachments",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TicketId = table.Column<int>(type: "integer", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    FileName = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    MimeType = table.Column<string>(type: "text", nullable: false),
                    StoragePath = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    SizeBytes = table.Column<long>(type: "bigint", nullable: false),
                    Checksum = table.Column<string>(type: "text", nullable: true),
                    UploadedBy = table.Column<string>(type: "text", nullable: true),
                    ScannedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ScanStatus = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Attachments", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AuditLogs",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: true),
                    ActorId = table.Column<string>(type: "text", nullable: true),
                    ActorRole = table.Column<string>(type: "text", nullable: true),
                    Entity = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    EntityId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Action = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    DiffJson = table.Column<string>(type: "jsonb", nullable: true),
                    IpAddress = table.Column<string>(type: "text", nullable: true),
                    UserAgent = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AutomationRules",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Enabled = table.Column<bool>(type: "boolean", nullable: false),
                    Trigger = table.Column<int>(type: "integer", nullable: false),
                    ConditionJson = table.Column<string>(type: "jsonb", nullable: true),
                    ActionJson = table.Column<string>(type: "jsonb", nullable: true),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastRunAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AutomationRules", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    DepartmentId = table.Column<int>(type: "integer", nullable: true),
                    ParentId = table.Column<int>(type: "integer", nullable: true),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    FormSchemaJson = table.Column<string>(type: "jsonb", nullable: true),
                    Visibility = table.Column<int>(type: "integer", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EmailInbounds",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    RawMessageId = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    FromAddress = table.Column<string>(type: "text", nullable: false),
                    ToAddress = table.Column<string>(type: "text", nullable: false),
                    Subject = table.Column<string>(type: "text", nullable: true),
                    ParsedJson = table.Column<string>(type: "jsonb", nullable: true),
                    TicketId = table.Column<int>(type: "integer", nullable: true),
                    ReceivedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ProcessedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmailInbounds", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SLAPlans",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    ResponseTimeMinutes = table.Column<int>(type: "integer", nullable: false),
                    ResolutionTimeMinutes = table.Column<int>(type: "integer", nullable: false),
                    EscalationPolicyJson = table.Column<string>(type: "jsonb", nullable: true),
                    Calendar = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SLAPlans", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Tenants",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    PrimaryDomain = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    Plan = table.Column<int>(type: "integer", nullable: false),
                    SettingsJson = table.Column<JsonDocument>(type: "jsonb", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tenants", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TicketEvents",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TicketId = table.Column<int>(type: "integer", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    ActorId = table.Column<string>(type: "text", nullable: true),
                    Visibility = table.Column<int>(type: "integer", nullable: false),
                    PayloadJson = table.Column<string>(type: "jsonb", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TicketEvents", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Users_TenantId_Email",
                table: "Users",
                columns: new[] { "TenantId", "Email" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_TenantId_CreatorId",
                table: "Tickets",
                columns: new[] { "TenantId", "CreatorId" });

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_TenantId_DepartmentId_Status",
                table: "Tickets",
                columns: new[] { "TenantId", "DepartmentId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_RoleAssignments_TenantId_UserId_DepartmentId_Role",
                table: "RoleAssignments",
                columns: new[] { "TenantId", "UserId", "DepartmentId", "Role" });

            migrationBuilder.CreateIndex(
                name: "IX_Departments_TenantId_Name",
                table: "Departments",
                columns: new[] { "TenantId", "Name" },
                unique: true);

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
                name: "IX_EmailInbounds_RawMessageId",
                table: "EmailInbounds",
                column: "RawMessageId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EmailInbounds_TenantId_Status",
                table: "EmailInbounds",
                columns: new[] { "TenantId", "Status" });

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
                name: "SLAPlans");

            migrationBuilder.DropTable(
                name: "Tenants");

            migrationBuilder.DropTable(
                name: "TicketEvents");

            migrationBuilder.DropIndex(
                name: "IX_Users_TenantId_Email",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Tickets_TenantId_CreatorId",
                table: "Tickets");

            migrationBuilder.DropIndex(
                name: "IX_Tickets_TenantId_DepartmentId_Status",
                table: "Tickets");

            migrationBuilder.DropIndex(
                name: "IX_RoleAssignments_TenantId_UserId_DepartmentId_Role",
                table: "RoleAssignments");

            migrationBuilder.DropIndex(
                name: "IX_Departments_TenantId_Name",
                table: "Departments");

            migrationBuilder.DropColumn(
                name: "AuthProvider",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "DepartmentId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "LastLoginAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "MetadataJson",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CategoryId",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "Channel",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "ClosedAt",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "DueAt",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "LastEventAt",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "SLAPlanId",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "Tags",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "AssignedAt",
                table: "RoleAssignments");

            migrationBuilder.DropColumn(
                name: "AssignedBy",
                table: "RoleAssignments");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "RoleAssignments");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Departments");

            migrationBuilder.DropColumn(
                name: "ModulesEnabledJson",
                table: "Departments");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Departments");

            migrationBuilder.DropColumn(
                name: "VisibilityPolicy",
                table: "Departments");

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_RoleAssignments_UserId_DepartmentId_Role",
                table: "RoleAssignments",
                columns: new[] { "UserId", "DepartmentId", "Role" });
        }
    }
}
