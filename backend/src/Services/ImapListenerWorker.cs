using MailKit;
using MailKit.Net.Imap;
using MailKit.Search;
using MimeKit;
using Microsoft.EntityFrameworkCore;
using Tickly.Api.Services;

namespace Tickly.Api.Services
{
    public class ImapListenerWorker : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<ImapListenerWorker> _logger;
        private readonly IConfiguration _configuration;

        public ImapListenerWorker(
            IServiceProvider serviceProvider,
            ILogger<ImapListenerWorker> logger,
            IConfiguration configuration)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
            _configuration = configuration;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("IMAP Listener Worker starting...");

            // Check if IMAP is enabled in config
            var imapEnabled = _configuration.GetValue<bool>("Email:Imap:Enabled");
            if (!imapEnabled)
            {
                _logger.LogInformation("IMAP listener is disabled in configuration");
                return;
            }

            var imapServer = _configuration["Email:Imap:Server"];
            var imapPort = _configuration.GetValue<int>("Email:Imap:Port", 993);
            var imapUsername = _configuration["Email:Imap:Username"];
            var imapPassword = _configuration["Email:Imap:Password"];
            var useSsl = _configuration.GetValue<bool>("Email:Imap:UseSsl", true);
            var checkIntervalMinutes = _configuration.GetValue<int>("Email:Imap:CheckIntervalMinutes", 5);

            if (string.IsNullOrEmpty(imapServer) || string.IsNullOrEmpty(imapUsername) || string.IsNullOrEmpty(imapPassword))
            {
                _logger.LogWarning("IMAP configuration incomplete. Worker will not start.");
                return;
            }

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    _logger.LogInformation("Connecting to IMAP server: {Server}:{Port}", imapServer, imapPort);

                    using var client = new ImapClient();
                    await client.ConnectAsync(imapServer, imapPort, useSsl, stoppingToken);
                    await client.AuthenticateAsync(imapUsername, imapPassword, stoppingToken);

                    _logger.LogInformation("Connected to IMAP server successfully");

                    var inbox = client.Inbox;
                    await inbox.OpenAsync(FolderAccess.ReadWrite, stoppingToken);

                    // Search for unread messages
                    var uids = await inbox.SearchAsync(SearchQuery.NotSeen, stoppingToken);
                    _logger.LogInformation("Found {Count} unread emails", uids.Count);

                    foreach (var uid in uids)
                    {
                        if (stoppingToken.IsCancellationRequested) break;

                        try
                        {
                            var message = await inbox.GetMessageAsync(uid, stoppingToken);
                            await ProcessEmailAsync(message);

                            // Mark as read
                            await inbox.AddFlagsAsync(uid, MessageFlags.Seen, true, stoppingToken);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Error processing email UID {Uid}", uid);
                        }
                    }

                    await client.DisconnectAsync(true, stoppingToken);
                    _logger.LogInformation("Disconnected from IMAP server");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in IMAP listener worker");
                }

                // Wait before next check
                _logger.LogInformation("Waiting {Minutes} minutes before next check...", checkIntervalMinutes);
                await Task.Delay(TimeSpan.FromMinutes(checkIntervalMinutes), stoppingToken);
            }

            _logger.LogInformation("IMAP Listener Worker stopped");
        }

        private async Task ProcessEmailAsync(MimeMessage message)
        {
            using var scope = _serviceProvider.CreateScope();
            var emailInboundService = scope.ServiceProvider.GetRequiredService<IEmailInboundService>();

            // TODO: Determine tenant from email domain or configuration
            // For now, use first tenant in database
            var dbContext = scope.ServiceProvider.GetRequiredService<Data.AppDbContext>();
            var tenant = await dbContext.Tenants.FirstOrDefaultAsync();
            if (tenant == null)
            {
                _logger.LogWarning("No tenant found, cannot process email");
                return;
            }

            _logger.LogInformation("Processing email from {From}: {Subject}", 
                message.From.Mailboxes.FirstOrDefault()?.Address, 
                message.Subject);

            // Parse and create EmailInbound
            var emailInbound = await emailInboundService.ParseAndCreateEmailInboundAsync(message, tenant.Id);
            if (emailInbound == null)
            {
                _logger.LogWarning("Failed to create EmailInbound record");
                return;
            }

            // Convert to ticket
            var ticket = await emailInboundService.ConvertEmailToTicketAsync(emailInbound.Id);
            if (ticket != null)
            {
                _logger.LogInformation("Email converted to ticket {TicketId}", ticket.Id);
            }
            else
            {
                _logger.LogWarning("Failed to convert email to ticket");
            }
        }
    }
}
