using System;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Tickly.Api.Data;
using Tickly.Api.Models;

namespace Tickly.Api.Services
{
    public class VirusScanWorker : BackgroundService
    {
        private readonly IServiceProvider _services;
        private readonly ILogger<VirusScanWorker> _logger;

        public VirusScanWorker(IServiceProvider services, ILogger<VirusScanWorker> logger)
        {
            _services = services;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("VirusScanWorker started");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ScanPendingFilesAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in VirusScanWorker");
                }

                await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
            }
        }

        private async Task ScanPendingFilesAsync(CancellationToken cancellationToken)
        {
            using var scope = _services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var pendingFiles = await db.Attachments
                .Where(a => a.ScanStatus == ScanStatus.Pending)
                .OrderBy(a => a.CreatedAt)
                .Take(10)
                .ToListAsync(cancellationToken);

            foreach (var attachment in pendingFiles)
            {
                if (cancellationToken.IsCancellationRequested) break;

                try
                {
                    // Simulated virus scan (replace with real ClamAV/ICAP integration)
                    var isClean = await SimulateScanAsync(attachment.StoragePath);

                    attachment.ScanStatus = isClean ? ScanStatus.Clean : ScanStatus.Quarantined;
                    attachment.ScannedAt = DateTime.UtcNow;

                    await db.SaveChangesAsync(cancellationToken);

                    _logger.LogInformation("Scanned attachment {Id}: {Status}", attachment.Id, attachment.ScanStatus);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to scan attachment {Id}", attachment.Id);
                    attachment.ScanStatus = ScanStatus.Failed;
                    await db.SaveChangesAsync(cancellationToken);
                }
            }
        }

        private Task<bool> SimulateScanAsync(string filePath)
        {
            // TODO: Integrate with ClamAV or similar
            // Example: call external antivirus API or use local ClamAV daemon
            return Task.FromResult(true); // Always clean for now
        }
    }
}
