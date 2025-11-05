using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Tickly.Api.Data;
using Tickly.Api.Models;

namespace Tickly.Api.Services;

/// <summary>
/// Service for evaluating and executing automation rules
/// </summary>
public class AutomationService
{
    private readonly AppDbContext _db;
    private readonly ILogger<AutomationService> _logger;
    private readonly AuditService _auditService;
    private readonly IHttpClientFactory _httpClientFactory;

    public AutomationService(
        AppDbContext db,
        ILogger<AutomationService> logger,
        AuditService auditService,
        IHttpClientFactory httpClientFactory)
    {
        _db = db;
        _logger = logger;
        _auditService = auditService;
        _httpClientFactory = httpClientFactory;
    }

    /// <summary>
    /// Evaluate and execute automation rules for a ticket event
    /// </summary>
    public async Task ProcessTicketEventAsync(int ticketId, AutomationTrigger trigger)
    {
        var ticket = await _db.Tickets.FindAsync(ticketId);
        if (ticket == null) return;

        // Get active automation rules for this tenant and trigger
        var rules = await _db.AutomationRules
            .Where(r => 
                r.TenantId == ticket.TenantId &&
                r.Trigger == trigger &&
                r.IsActive)
            .OrderBy(r => r.Priority)
            .ToListAsync();

        foreach (var rule in rules)
        {
            try
            {
                // Evaluate condition
                if (EvaluateCondition(ticket, rule.ConditionJson))
                {
                    _logger.LogInformation(
                        "Automation rule {RuleId} triggered for ticket {TicketId}",
                        rule.Id,
                        ticketId);

                    // Execute actions
                    await ExecuteActionsAsync(ticket, rule.ActionJson);

                    // Update rule execution tracking
                    rule.LastRunAt = DateTime.UtcNow;
                    await _db.SaveChangesAsync();

                    // Log to audit
                    await _auditService.LogAsync(
                        tenantId: ticket.TenantId,
                        actorId: null,
                        actorRole: "Automation",
                        entity: "Ticket",
                        entityId: ticketId.ToString(),
                        action: "AutomationExecuted",
                        before: null,
                        after: new { ruleId = rule.Id, ruleName = rule.Name }
                    );
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error executing automation rule {RuleId} for ticket {TicketId}",
                    rule.Id,
                    ticketId);
            }
        }
    }

    /// <summary>
    /// Evaluate condition JSON against ticket
    /// </summary>
    private bool EvaluateCondition(Ticket ticket, string? conditionJson)
    {
        if (string.IsNullOrEmpty(conditionJson)) return true;

        try
        {
            var condition = JsonSerializer.Deserialize<AutomationCondition>(conditionJson);
            if (condition == null) return true;

            // Check status condition
            if (condition.Status != null && ticket.Status.ToString() != condition.Status)
                return false;

            // Check priority condition
            if (condition.Priority != null && ticket.Priority.ToString() != condition.Priority)
                return false;

            // Check department condition
            if (condition.DepartmentId.HasValue && ticket.DepartmentId != condition.DepartmentId.Value)
                return false;

            // Check category condition
            if (condition.CategoryId.HasValue && ticket.CategoryId != condition.CategoryId.Value)
                return false;

            // Check tags condition (any match)
            if (condition.Tags != null && condition.Tags.Length > 0)
            {
                if (ticket.Tags == null || !ticket.Tags.Intersect(condition.Tags).Any())
                    return false;
            }

            // Check assigned condition
            if (condition.IsAssigned.HasValue)
            {
                var isAssigned = !string.IsNullOrEmpty(ticket.AssignedToUserId);
                if (condition.IsAssigned.Value != isAssigned)
                    return false;
            }

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error evaluating automation condition: {Json}", conditionJson);
            return false;
        }
    }

    /// <summary>
    /// Execute actions from JSON
    /// </summary>
    private async Task ExecuteActionsAsync(Ticket ticket, string? actionJson)
    {
        if (string.IsNullOrEmpty(actionJson)) return;

        try
        {
            var actions = JsonSerializer.Deserialize<AutomationAction[]>(actionJson);
            if (actions == null) return;

            foreach (var action in actions)
            {
                await ExecuteActionAsync(ticket, action);
            }

            await _db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing automation actions: {Json}", actionJson);
        }
    }

    /// <summary>
    /// Execute a single action
    /// </summary>
    private async Task ExecuteActionAsync(Ticket ticket, AutomationAction action)
    {
        switch (action.Type?.ToLower())
        {
            case "set_status":
                if (Enum.TryParse<TicketStatus>(action.Value, out var status))
                {
                    ticket.Status = status;
                    ticket.UpdatedAt = DateTime.UtcNow;
                    _logger.LogInformation("Automation: Set ticket {TicketId} status to {Status}", ticket.Id, status);
                }
                break;

            case "set_priority":
                if (Enum.TryParse<TicketPriority>(action.Value, out var priority))
                {
                    ticket.Priority = priority;
                    ticket.UpdatedAt = DateTime.UtcNow;
                    _logger.LogInformation("Automation: Set ticket {TicketId} priority to {Priority}", ticket.Id, priority);
                }
                break;

            case "assign_to":
                ticket.AssignedToUserId = action.Value;
                ticket.UpdatedAt = DateTime.UtcNow;
                _logger.LogInformation("Automation: Assigned ticket {TicketId} to user {UserId}", ticket.Id, action.Value);
                break;

            case "add_tag":
                if (!string.IsNullOrEmpty(action.Value))
                {
                    var tags = ticket.Tags?.ToList() ?? new List<string>();
                    if (!tags.Contains(action.Value))
                    {
                        tags.Add(action.Value);
                        ticket.Tags = tags.ToArray();
                        ticket.UpdatedAt = DateTime.UtcNow;
                        _logger.LogInformation("Automation: Added tag {Tag} to ticket {TicketId}", action.Value, ticket.Id);
                    }
                }
                break;

            case "remove_tag":
                if (!string.IsNullOrEmpty(action.Value) && ticket.Tags != null)
                {
                    var tags = ticket.Tags.ToList();
                    if (tags.Remove(action.Value))
                    {
                        ticket.Tags = tags.ToArray();
                        ticket.UpdatedAt = DateTime.UtcNow;
                        _logger.LogInformation("Automation: Removed tag {Tag} from ticket {TicketId}", action.Value, ticket.Id);
                    }
                }
                break;

            case "add_comment":
                if (!string.IsNullOrEmpty(action.Value))
                {
                    var comment = new TicketEvent
                    {
                        TicketId = ticket.Id,
                        TenantId = ticket.TenantId,
                        Type = TicketEventType.CommentInternal,
                        Visibility = EventVisibility.Internal,
                        ActorId = null, // System
                        PayloadJson = JsonSerializer.Serialize(new { text = action.Value, source = "automation" }),
                        CreatedAt = DateTime.UtcNow
                    };
                    _db.TicketEvents.Add(comment);
                    _logger.LogInformation("Automation: Added comment to ticket {TicketId}", ticket.Id);
                }
                break;

            case "webhook":
                if (!string.IsNullOrEmpty(action.Value))
                {
                    await SendWebhookAsync(ticket, action.Value);
                }
                break;

            case "set_sla":
                if (int.TryParse(action.Value, out var slaPlanId))
                {
                    ticket.SLAPlanId = slaPlanId;
                    ticket.UpdatedAt = DateTime.UtcNow;
                    _logger.LogInformation("Automation: Set SLA plan {SLAPlanId} for ticket {TicketId}", slaPlanId, ticket.Id);
                }
                break;

            case "notify":
                // Log notification (could integrate with email/SMS service)
                _logger.LogInformation("Automation: Notification queued for ticket {TicketId}: {Message}", ticket.Id, action.Value);
                break;

            default:
                _logger.LogWarning("Unknown automation action type: {Type}", action.Type);
                break;
        }
    }

    /// <summary>
    /// Send webhook notification
    /// </summary>
    private async Task SendWebhookAsync(Ticket ticket, string webhookUrl)
    {
        try
        {
            var httpClient = _httpClientFactory.CreateClient();
            httpClient.Timeout = TimeSpan.FromSeconds(10);

            var payload = new
            {
                ticketId = ticket.Id,
                tenantId = ticket.TenantId,
                title = ticket.Title,
                status = ticket.Status.ToString(),
                priority = ticket.Priority.ToString(),
                createdAt = ticket.CreatedAt,
                updatedAt = ticket.UpdatedAt
            };

            var response = await httpClient.PostAsJsonAsync(webhookUrl, payload);
            
            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Webhook sent successfully for ticket {TicketId} to {Url}", ticket.Id, webhookUrl);
            }
            else
            {
                _logger.LogWarning("Webhook failed for ticket {TicketId} to {Url}: {StatusCode}", 
                    ticket.Id, webhookUrl, response.StatusCode);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending webhook for ticket {TicketId} to {Url}", ticket.Id, webhookUrl);
        }
    }
}

/// <summary>
/// Automation condition structure
/// </summary>
public class AutomationCondition
{
    public string? Status { get; set; }
    public string? Priority { get; set; }
    public int? DepartmentId { get; set; }
    public int? CategoryId { get; set; }
    public string[]? Tags { get; set; }
    public bool? IsAssigned { get; set; }
}

/// <summary>
/// Automation action structure
/// </summary>
public class AutomationAction
{
    public string? Type { get; set; } // set_status, set_priority, assign_to, add_tag, add_comment, webhook, etc.
    public string? Value { get; set; }
}
