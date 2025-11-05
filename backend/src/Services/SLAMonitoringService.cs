using Tickly.Api.Data;
using Tickly.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Tickly.Api.Services;

/// <summary>
/// Service for SLA monitoring and escalation logic
/// </summary>
public class SLAMonitoringService
{
    private readonly AppDbContext _db;
    private readonly ILogger<SLAMonitoringService> _logger;
    private readonly AuditService _auditService;

    public SLAMonitoringService(
        AppDbContext db,
        ILogger<SLAMonitoringService> logger,
        AuditService auditService)
    {
        _db = db;
        _logger = logger;
        _auditService = auditService;
    }

    /// <summary>
    /// Check tickets approaching or breaching SLA deadlines
    /// </summary>
    public async Task<List<Ticket>> CheckSLAViolationsAsync()
    {
        var now = DateTime.UtcNow;
        
        // Find tickets with DueAt set and not yet closed/resolved
        var violatingTickets = await _db.Tickets
            .Where(t => 
                t.DueAt.HasValue && 
                t.DueAt.Value < now &&
                t.Status != TicketStatus.Closed &&
                t.Status != TicketStatus.Completed)
            .ToListAsync();

        return violatingTickets;
    }

    /// <summary>
    /// Check tickets approaching SLA deadline (within warning threshold)
    /// </summary>
    public async Task<List<Ticket>> CheckSLAWarningsAsync(int warningMinutes = 30)
    {
        var now = DateTime.UtcNow;
        var warningThreshold = now.AddMinutes(warningMinutes);
        
        var warningTickets = await _db.Tickets
            .Where(t => 
                t.DueAt.HasValue && 
                t.DueAt.Value > now &&
                t.DueAt.Value <= warningThreshold &&
                t.Status != TicketStatus.Closed &&
                t.Status != TicketStatus.Completed)
            .ToListAsync();

        return warningTickets;
    }

    /// <summary>
    /// Escalate a ticket based on SLA breach
    /// </summary>
    public async Task EscalateTicketAsync(int ticketId, string reason)
    {
        var ticket = await _db.Tickets
            .FirstOrDefaultAsync(t => t.Id == ticketId);

        if (ticket == null)
        {
            _logger.LogWarning("Ticket {TicketId} not found for escalation", ticketId);
            return;
        }

        // Get SLA plan if assigned
        SLAPlan? slaPlan = null;
        if (ticket.SLAPlanId.HasValue)
        {
            slaPlan = await _db.SLAPlans.FindAsync(ticket.SLAPlanId.Value);
        }

        // Parse escalation policy from SLAPlan
        var escalationPolicy = ParseEscalationPolicy(slaPlan?.EscalationPolicyJson);

        // Apply escalation actions
        var escalated = false;

        // Increase priority
        if (escalationPolicy.IncreasePriority && ticket.Priority < TicketPriority.Urgent)
        {
            ticket.Priority = ticket.Priority switch
            {
                TicketPriority.Low => TicketPriority.Normal,
                TicketPriority.Normal => TicketPriority.High,
                TicketPriority.High => TicketPriority.Urgent,
                _ => ticket.Priority
            };
            escalated = true;
        }

        // Reassign to manager/supervisor
        if (escalationPolicy.ReassignToManager && ticket.DepartmentId.HasValue)
        {
            // Find department manager
            var managerUserId = await _db.RoleAssignments
                .Where(ra => 
                    ra.TenantId == ticket.TenantId &&
                    ra.DepartmentId == ticket.DepartmentId &&
                    ra.Role == RoleName.DepartmentManager)
                .Select(ra => ra.UserId)
                .FirstOrDefaultAsync();

            if (!string.IsNullOrEmpty(managerUserId) && managerUserId != ticket.AssignedToUserId)
            {
                ticket.AssignedToUserId = managerUserId;
                escalated = true;
            }
        }

        // Notify stakeholders (log for now, can integrate with notification service)
        if (escalationPolicy.NotifyStakeholders)
        {
            _logger.LogWarning(
                "SLA BREACH NOTIFICATION: Ticket {TicketId} breached SLA. Reason: {Reason}. Priority: {Priority}",
                ticketId,
                reason,
                ticket.Priority);
            escalated = true;
        }

        if (escalated)
        {
            ticket.UpdatedAt = DateTime.UtcNow;

            // Create escalation event
            var escalationEvent = new TicketEvent
            {
                TicketId = ticketId,
                TenantId = ticket.TenantId,
                Type = TicketEventType.Escalation,
                Visibility = EventVisibility.Internal,
                CreatedAt = DateTime.UtcNow,
                PayloadJson = System.Text.Json.JsonSerializer.Serialize(new
                {
                    action = "sla_escalation",
                    reason = reason,
                    priority = ticket.Priority.ToString(),
                    assignedTo = ticket.AssignedToUserId,
                    escalationPolicy = escalationPolicy
                })
            };

            _db.TicketEvents.Add(escalationEvent);

            // Audit log
            await _auditService.LogAsync(
                tenantId: ticket.TenantId,
                actorId: null,
                actorRole: "System",
                entity: "Ticket",
                entityId: ticketId.ToString(),
                action: "SLAEscalation",
                before: null,
                after: new { priority = ticket.Priority, assignedTo = ticket.AssignedToUserId }
            );

            await _db.SaveChangesAsync();

            _logger.LogInformation(
                "Ticket {TicketId} escalated due to SLA breach. New priority: {Priority}",
                ticketId,
                ticket.Priority);
        }
    }

    /// <summary>
    /// Parse escalation policy JSON
    /// </summary>
    private EscalationPolicy ParseEscalationPolicy(string? json)
    {
        if (string.IsNullOrEmpty(json))
        {
            return new EscalationPolicy
            {
                IncreasePriority = true,
                ReassignToManager = true,
                NotifyStakeholders = true
            };
        }

        try
        {
            var policy = System.Text.Json.JsonSerializer.Deserialize<EscalationPolicy>(json);
            return policy ?? new EscalationPolicy
            {
                IncreasePriority = true,
                ReassignToManager = true,
                NotifyStakeholders = true
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to parse escalation policy JSON: {Json}", json);
            return new EscalationPolicy
            {
                IncreasePriority = true,
                ReassignToManager = true,
                NotifyStakeholders = true
            };
        }
    }

    /// <summary>
    /// Calculate SLA due date based on plan
    /// </summary>
    public DateTime? CalculateSLADueDate(SLAPlan? slaPlan, DateTime startTime)
    {
        if (slaPlan == null) return null;

        var targetMinutes = slaPlan.ResolutionTimeMinutes > 0 
            ? slaPlan.ResolutionTimeMinutes 
            : slaPlan.ResponseTimeMinutes;
            
        if (targetMinutes <= 0) return null;

        if (slaPlan.Calendar == CalendarMode.BusinessHours)
        {
            // Business hours: Mon-Fri 9AM-5PM
            return CalculateBusinessHoursDue(startTime, targetMinutes);
        }
        else
        {
            // 24/7 mode: simple addition
            return startTime.AddMinutes(targetMinutes);
        }
    }

    /// <summary>
    /// Calculate due date considering business hours (Mon-Fri 9AM-5PM)
    /// </summary>
    private DateTime CalculateBusinessHoursDue(DateTime startTime, int targetMinutes)
    {
        var current = startTime;
        var remainingMinutes = targetMinutes;

        while (remainingMinutes > 0)
        {
            // Skip weekends
            if (current.DayOfWeek == DayOfWeek.Saturday)
            {
                current = current.Date.AddDays(2).AddHours(9); // Move to Monday 9AM
                continue;
            }
            if (current.DayOfWeek == DayOfWeek.Sunday)
            {
                current = current.Date.AddDays(1).AddHours(9); // Move to Monday 9AM
                continue;
            }

            // If before business hours, move to 9AM
            if (current.Hour < 9)
            {
                current = current.Date.AddHours(9);
                continue;
            }

            // If after business hours, move to next day 9AM
            if (current.Hour >= 17)
            {
                current = current.Date.AddDays(1).AddHours(9);
                continue;
            }

            // Calculate minutes available in current day
            var endOfDay = current.Date.AddHours(17);
            var availableMinutes = (int)(endOfDay - current).TotalMinutes;

            if (remainingMinutes <= availableMinutes)
            {
                // Can finish today
                return current.AddMinutes(remainingMinutes);
            }
            else
            {
                // Use today's remaining time and move to next day
                remainingMinutes -= availableMinutes;
                current = current.Date.AddDays(1).AddHours(9);
            }
        }

        return current;
    }
}

/// <summary>
/// Escalation policy configuration
/// </summary>
public class EscalationPolicy
{
    public bool IncreasePriority { get; set; }
    public bool ReassignToManager { get; set; }
    public bool NotifyStakeholders { get; set; }
    public List<string>? NotificationEmails { get; set; }
    public string? WebhookUrl { get; set; }
}
