using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text;
using Tickly.Api.Data;
using Tickly.Api.Models;

namespace Tickly.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ILogger<ReportsController> _logger;

    public ReportsController(AppDbContext db, ILogger<ReportsController> logger)
    {
        _db = db;
        _logger = logger;
    }

    /// <summary>
    /// Get dashboard statistics
    /// </summary>
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboardStats([FromQuery] Guid? tenantId, [FromQuery] int? departmentId)
    {
        var query = _db.Tickets.AsQueryable();

        if (tenantId.HasValue)
            query = query.Where(t => t.TenantId == tenantId.Value);

        if (departmentId.HasValue)
            query = query.Where(t => t.DepartmentId == departmentId.Value);

        var tickets = await query.ToListAsync();

        var stats = new
        {
            total = tickets.Count,
            byStatus = tickets.GroupBy(t => t.Status)
                .Select(g => new { status = g.Key.ToString(), count = g.Count() })
                .OrderBy(x => x.status)
                .ToList(),
            byPriority = tickets.GroupBy(t => t.Priority)
                .Select(g => new { priority = g.Key.ToString(), count = g.Count() })
                .OrderBy(x => x.priority)
                .ToList(),
            byChannel = tickets.GroupBy(t => t.Channel)
                .Select(g => new { channel = g.Key.ToString(), count = g.Count() })
                .OrderBy(x => x.channel)
                .ToList(),
            avgResolutionTime = tickets
                .Where(t => t.ClosedAt.HasValue && t.CreatedAt != default)
                .Select(t => (t.ClosedAt!.Value - t.CreatedAt).TotalHours)
                .DefaultIfEmpty(0)
                .Average(),
            openTickets = tickets.Count(t => t.Status != TicketStatus.Closed && t.Status != TicketStatus.Completed),
            overdueTickets = tickets.Count(t => t.DueAt.HasValue && t.DueAt.Value < DateTime.UtcNow && t.Status != TicketStatus.Closed),
            recentActivity = tickets
                .OrderByDescending(t => t.UpdatedAt)
                .Take(10)
                .Select(t => new
                {
                    t.Id,
                    t.Title,
                    status = t.Status.ToString(),
                    priority = t.Priority.ToString(),
                    t.UpdatedAt
                })
                .ToList()
        };

        return Ok(stats);
    }

    /// <summary>
    /// Get ticket trends over time
    /// </summary>
    [HttpGet("trends")]
    public async Task<IActionResult> GetTrends(
        [FromQuery] Guid? tenantId,
        [FromQuery] int? departmentId,
        [FromQuery] int days = 30)
    {
        var startDate = DateTime.UtcNow.AddDays(-days).Date;
        var query = _db.Tickets.Where(t => t.CreatedAt >= startDate);

        if (tenantId.HasValue)
            query = query.Where(t => t.TenantId == tenantId.Value);

        if (departmentId.HasValue)
            query = query.Where(t => t.DepartmentId == departmentId.Value);

        var tickets = await query.ToListAsync();

        var trends = new
        {
            createdByDay = tickets
                .GroupBy(t => t.CreatedAt.Date)
                .Select(g => new { date = g.Key, count = g.Count() })
                .OrderBy(x => x.date)
                .ToList(),
            closedByDay = tickets
                .Where(t => t.ClosedAt.HasValue)
                .GroupBy(t => t.ClosedAt!.Value.Date)
                .Select(g => new { date = g.Key, count = g.Count() })
                .OrderBy(x => x.date)
                .ToList(),
            averageResolutionTimeByDay = tickets
                .Where(t => t.ClosedAt.HasValue)
                .GroupBy(t => t.ClosedAt!.Value.Date)
                .Select(g => new
                {
                    date = g.Key,
                    avgHours = g.Average(t => (t.ClosedAt!.Value - t.CreatedAt).TotalHours)
                })
                .OrderBy(x => x.date)
                .ToList()
        };

        return Ok(trends);
    }

    /// <summary>
    /// Get agent performance metrics
    /// </summary>
    [HttpGet("agent-performance")]
    public async Task<IActionResult> GetAgentPerformance(
        [FromQuery] Guid? tenantId,
        [FromQuery] int? departmentId,
        [FromQuery] int days = 30)
    {
        var startDate = DateTime.UtcNow.AddDays(-days);
        var query = _db.Tickets
            .Where(t => t.AssignedToUserId != null && t.CreatedAt >= startDate);

        if (tenantId.HasValue)
            query = query.Where(t => t.TenantId == tenantId.Value);

        if (departmentId.HasValue)
            query = query.Where(t => t.DepartmentId == departmentId.Value);

        var tickets = await query.ToListAsync();

        var performance = tickets
            .GroupBy(t => t.AssignedToUserId)
            .Select(g => new
            {
                userId = g.Key,
                totalAssigned = g.Count(),
                completed = g.Count(t => t.Status == TicketStatus.Completed || t.Status == TicketStatus.Closed),
                avgResolutionHours = g
                    .Where(t => t.ClosedAt.HasValue)
                    .Select(t => (t.ClosedAt!.Value - t.CreatedAt).TotalHours)
                    .DefaultIfEmpty(0)
                    .Average(),
                onTime = g.Count(t => 
                    t.ClosedAt.HasValue && 
                    t.DueAt.HasValue && 
                    t.ClosedAt.Value <= t.DueAt.Value),
                breached = g.Count(t => 
                    t.DueAt.HasValue && 
                    (t.ClosedAt == null ? DateTime.UtcNow : t.ClosedAt.Value) > t.DueAt.Value)
            })
            .OrderByDescending(x => x.completed)
            .ToList();

        return Ok(performance);
    }

    /// <summary>
    /// Export tickets to CSV
    /// </summary>
    [HttpGet("export/csv")]
    public async Task<IActionResult> ExportCsv(
        [FromQuery] Guid? tenantId,
        [FromQuery] int? departmentId,
        [FromQuery] TicketStatus? status)
    {
        var query = _db.Tickets.AsQueryable();

        if (tenantId.HasValue)
            query = query.Where(t => t.TenantId == tenantId.Value);

        if (departmentId.HasValue)
            query = query.Where(t => t.DepartmentId == departmentId.Value);

        if (status.HasValue)
            query = query.Where(t => t.Status == status.Value);

        var tickets = await query.OrderByDescending(t => t.CreatedAt).ToListAsync();

        var csv = new StringBuilder();
        csv.AppendLine("ID,Title,Status,Priority,Channel,Department,Assigned To,Created At,Updated At,Closed At");

        foreach (var ticket in tickets)
        {
            csv.AppendLine($"{ticket.Id}," +
                          $"\"{ticket.Title?.Replace("\"", "\"\"")}\"," +
                          $"{ticket.Status}," +
                          $"{ticket.Priority}," +
                          $"{ticket.Channel}," +
                          $"{ticket.DepartmentId}," +
                          $"{ticket.AssignedToUserId}," +
                          $"{ticket.CreatedAt:yyyy-MM-dd HH:mm:ss}," +
                          $"{ticket.UpdatedAt:yyyy-MM-dd HH:mm:ss}," +
                          $"{ticket.ClosedAt?.ToString("yyyy-MM-dd HH:mm:ss")}");
        }

        var bytes = Encoding.UTF8.GetBytes(csv.ToString());
        return File(bytes, "text/csv", $"tickets-export-{DateTime.UtcNow:yyyyMMdd-HHmmss}.csv");
    }

    /// <summary>
    /// Get SLA compliance report
    /// </summary>
    [HttpGet("sla-compliance")]
    public async Task<IActionResult> GetSLACompliance(
        [FromQuery] Guid? tenantId,
        [FromQuery] int? departmentId,
        [FromQuery] int days = 30)
    {
        var startDate = DateTime.UtcNow.AddDays(-days);
        var query = _db.Tickets
            .Where(t => t.SLAPlanId != null && t.CreatedAt >= startDate);

        if (tenantId.HasValue)
            query = query.Where(t => t.TenantId == tenantId.Value);

        if (departmentId.HasValue)
            query = query.Where(t => t.DepartmentId == departmentId.Value);

        var tickets = await query.ToListAsync();

        var compliance = new
        {
            total = tickets.Count,
            withSLA = tickets.Count(t => t.DueAt.HasValue),
            metSLA = tickets.Count(t => 
                t.DueAt.HasValue && 
                t.ClosedAt.HasValue && 
                t.ClosedAt.Value <= t.DueAt.Value),
            breachedSLA = tickets.Count(t => 
                t.DueAt.HasValue && 
                ((t.ClosedAt.HasValue && t.ClosedAt.Value > t.DueAt.Value) || 
                 (!t.ClosedAt.HasValue && DateTime.UtcNow > t.DueAt.Value))),
            bySLAPlan = tickets
                .GroupBy(t => t.SLAPlanId)
                .Select(g => new
                {
                    slaPlanId = g.Key,
                    total = g.Count(),
                    met = g.Count(t => 
                        t.DueAt.HasValue && 
                        t.ClosedAt.HasValue && 
                        t.ClosedAt.Value <= t.DueAt.Value),
                    breached = g.Count(t => 
                        t.DueAt.HasValue && 
                        ((t.ClosedAt.HasValue && t.ClosedAt.Value > t.DueAt.Value) || 
                         (!t.ClosedAt.HasValue && DateTime.UtcNow > t.DueAt.Value))),
                    complianceRate = g.Count() > 0 
                        ? (double)g.Count(t => 
                            t.DueAt.HasValue && 
                            t.ClosedAt.HasValue && 
                            t.ClosedAt.Value <= t.DueAt.Value) / g.Count() * 100 
                        : 0
                })
                .ToList()
        };

        return Ok(compliance);
    }

    /// <summary>
    /// Get category distribution
    /// </summary>
    [HttpGet("category-distribution")]
    public async Task<IActionResult> GetCategoryDistribution(
        [FromQuery] Guid? tenantId,
        [FromQuery] int? departmentId,
        [FromQuery] int days = 30)
    {
        var startDate = DateTime.UtcNow.AddDays(-days);
        var query = _db.Tickets
            .Where(t => t.CategoryId != null && t.CreatedAt >= startDate);

        if (tenantId.HasValue)
            query = query.Where(t => t.TenantId == tenantId.Value);

        if (departmentId.HasValue)
            query = query.Where(t => t.DepartmentId == departmentId.Value);

        var tickets = await query.ToListAsync();

        var distribution = tickets
            .GroupBy(t => t.CategoryId)
            .Select(g => new
            {
                categoryId = g.Key,
                count = g.Count(),
                avgResolutionHours = g
                    .Where(t => t.ClosedAt.HasValue)
                    .Select(t => (t.ClosedAt!.Value - t.CreatedAt).TotalHours)
                    .DefaultIfEmpty(0)
                    .Average()
            })
            .OrderByDescending(x => x.count)
            .ToList();

        return Ok(distribution);
    }
}
