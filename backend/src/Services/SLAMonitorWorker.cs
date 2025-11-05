using Tickly.Api.Services;

namespace Tickly.Api.Services;

/// <summary>
/// Background worker that monitors SLA violations and triggers escalations
/// </summary>
public class SLAMonitorWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<SLAMonitorWorker> _logger;
    private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(5); // Check every 5 minutes

    public SLAMonitorWorker(
        IServiceProvider serviceProvider,
        ILogger<SLAMonitorWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("SLA Monitor Worker started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await MonitorSLAAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in SLA monitoring loop");
            }

            await Task.Delay(_checkInterval, stoppingToken);
        }

        _logger.LogInformation("SLA Monitor Worker stopped");
    }

    private async Task MonitorSLAAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var slaService = scope.ServiceProvider.GetRequiredService<SLAMonitoringService>();

        // Check for SLA violations (breached)
        var violatingTickets = await slaService.CheckSLAViolationsAsync();
        
        if (violatingTickets.Any())
        {
            _logger.LogWarning(
                "Found {Count} tickets with SLA violations",
                violatingTickets.Count);

            foreach (var ticket in violatingTickets)
            {
                try
                {
                    var breachTime = DateTime.UtcNow - ticket.DueAt!.Value;
                    var reason = $"SLA breached by {breachTime.TotalMinutes:F0} minutes";
                    
                    await slaService.EscalateTicketAsync(ticket.Id, reason);
                    
                    _logger.LogInformation(
                        "Escalated ticket {TicketId} (Tenant: {TenantId}, Title: {Title})",
                        ticket.Id,
                        ticket.TenantId,
                        ticket.Title);
                }
                catch (Exception ex)
                {
                    _logger.LogError(
                        ex,
                        "Failed to escalate ticket {TicketId}",
                        ticket.Id);
                }
            }
        }

        // Check for SLA warnings (approaching deadline)
        var warningTickets = await slaService.CheckSLAWarningsAsync(warningMinutes: 30);
        
        if (warningTickets.Any())
        {
            _logger.LogInformation(
                "Found {Count} tickets approaching SLA deadline (within 30 minutes)",
                warningTickets.Count);

            // Here you could send warning notifications without escalating
            foreach (var ticket in warningTickets)
            {
                var remainingTime = ticket.DueAt!.Value - DateTime.UtcNow;
                _logger.LogInformation(
                    "SLA WARNING: Ticket {TicketId} (Tenant: {TenantId}) due in {Minutes} minutes",
                    ticket.Id,
                    ticket.TenantId,
                    remainingTime.TotalMinutes);
            }
        }
    }
}
