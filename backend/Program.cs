using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using System.Threading;
using Tickly.Api.Configuration;
using Tickly.Api.Data;
using System;

var builder = WebApplication.CreateBuilder(args);

// Configuration
var configuration = builder.Configuration;

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Application services
builder.Services.AddScoped<Tickly.Api.Services.TicketWorkflowService>();
builder.Services.AddScoped<Tickly.Api.Services.AuditService>();
builder.Services.AddScoped<Tickly.Api.Services.SLAMonitoringService>();
builder.Services.AddScoped<Tickly.Api.Services.AutomationService>();

// HTTP Client for webhooks
builder.Services.AddHttpClient();

// Background workers
builder.Services.AddHostedService<Tickly.Api.Services.VirusScanWorker>();
builder.Services.AddHostedService<Tickly.Api.Services.SLAMonitorWorker>();

// Database configuration
builder.Services.Configure<DatabaseSettings>(configuration.GetSection("Database"));

// DbContext - SQLite connection string from configuration (see appsettings.json)
var conn = configuration.GetConnectionString("DefaultConnection") ?? "Data Source=tickly.db";
var dbProvider = configuration["Database:Provider"] ?? "Sqlite";

builder.Services.AddDbContextPool<AppDbContext>((serviceProvider, options) =>
{
	var settings = serviceProvider.GetRequiredService<IOptions<DatabaseSettings>>().Value;
	
	if (dbProvider.Equals("Sqlite", StringComparison.OrdinalIgnoreCase))
	{
		options.UseSqlite(conn, sqliteOptions =>
		{
			sqliteOptions.CommandTimeout(settings.CommandTimeout);
		});
	}
	else
	{
		// Fallback to PostgreSQL if configured
		options.UseNpgsql(conn, npgsqlOptions =>
		{
			npgsqlOptions.CommandTimeout(settings.CommandTimeout);
			npgsqlOptions.EnableRetryOnFailure(settings.RetryCount, TimeSpan.FromSeconds(settings.RetryDelaySeconds), null);
		});
	}

	if (builder.Environment.IsDevelopment())
	{
		options.EnableSensitiveDataLogging();
		options.EnableDetailedErrors();
	}
});

// Authentication - JWT
var jwtKey = configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key is not configured");
var jwtIssuer = configuration["Jwt:Issuer"] ?? "tickly.local";
var jwtAudience = configuration["Jwt:Audience"] ?? "tickly.local";

builder.Services.AddAuthentication(options =>
{
	options.DefaultAuthenticateScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
	options.DefaultChallengeScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
	options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
	{
		ValidateIssuer = true,
		ValidateAudience = true,
		ValidateLifetime = true,
		ValidateIssuerSigningKey = true,
		ValidIssuer = jwtIssuer,
		ValidAudience = jwtAudience,
		IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(jwtKey))
	};
	
	// Debug: Log token validation failures
	options.Events = new Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerEvents
	{
		OnAuthenticationFailed = context =>
		{
			Console.WriteLine($"JWT Auth Failed: {context.Exception.Message}");
			return System.Threading.Tasks.Task.CompletedTask;
		},
		OnTokenValidated = context =>
		{
			Console.WriteLine($"JWT Token Validated for: {context.Principal?.Identity?.Name}");
			return System.Threading.Tasks.Task.CompletedTask;
		},
		OnChallenge = context =>
		{
			Console.WriteLine($"JWT Challenge: {context.Error}, {context.ErrorDescription}");
			return System.Threading.Tasks.Task.CompletedTask;
		}
	};
});

// Authorization policies
builder.Services.AddAuthorization(options =>
{
	options.AddPolicy("SuperAdminOnly", policy => policy.RequireRole("SuperAdmin"));
});

// CORS for local frontend during development
var corsPolicyName = "AllowLocalDev";
builder.Services.AddCors(options =>
{
	options.AddPolicy(name: corsPolicyName,
		policy =>
		{
			policy.WithOrigins("http://localhost:5173", "http://localhost:80").AllowAnyHeader().AllowAnyMethod();
		});
});

var app = builder.Build();

// Enable Swagger in all environments for API documentation
app.UseSwagger();
app.UseSwaggerUI();

if (app.Environment.IsDevelopment())
{
	app.UseDeveloperExceptionPage();
}

app.UseRouting();
app.UseCors(corsPolicyName);
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapGet("/health", () => Results.Ok(new { status = "Healthy" }));

// Apply EF Core migrations at startup (migration-first workflow).
// This is safer for existing databases and keeps schema changes versioned.
using (var scope = app.Services.CreateScope())
{
	var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
	// DB container may not be ready immediately; retry a few times
	var retries = 12;
	for (int i = 0; i < retries; i++)
	{
		try
		{
			// Use Migrate so we apply any pending migrations instead of EnsureCreated.
			db.Database.Migrate();
			break;
		}
		catch (Exception ex)
		{
			if (i == retries - 1) throw;
			Console.WriteLine($"Database not ready yet ({i + 1}/{retries}): {ex.Message}");
			Thread.Sleep(1000);
		}
	}
}

// Seed a default SuperAdmin user for initial setup (only if none exists)
using (var scope2 = app.Services.CreateScope())
{
	var db = scope2.ServiceProvider.GetRequiredService<AppDbContext>();
	try
	{
		if (!db.Users.Any())
		{
			var adminName = configuration["InitialSuperAdmin:Username"] ?? "superadmin";
			var adminEmail = configuration["InitialSuperAdmin:Email"] ?? "admin@example.com";
			var adminPassword = configuration["InitialSuperAdmin:Password"] ?? "password";
			var user = new Tickly.Api.Models.User { Username = adminName, Email = adminEmail, DisplayName = "Super Admin", PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword) };
			db.Users.Add(user);
			db.RoleAssignments.Add(new Tickly.Api.Models.RoleAssignment { UserId = user.Id, DepartmentId = null, Role = Tickly.Api.Models.RoleName.SuperAdmin });
			db.SaveChanges();
			Console.WriteLine($"Seeded SuperAdmin user '{adminName}' (id={user.Id})");
		}
	}
	catch (Exception ex)
	{
		Console.WriteLine($"Error while seeding SuperAdmin: {ex.Message}");
	}
}

app.Run();
