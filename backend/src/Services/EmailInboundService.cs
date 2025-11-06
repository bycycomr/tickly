using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using MimeKit;
using Tickly.Api.Data;
using Tickly.Api.Models;

namespace Tickly.Api.Services
{
    public class EmailInboundService : IEmailInboundService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<EmailInboundService> _logger;

        public EmailInboundService(AppDbContext context, ILogger<EmailInboundService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<EmailInbound?> ParseAndCreateEmailInboundAsync(MimeMessage message, Guid tenantId)
        {
            try
            {
                var emailInbound = new EmailInbound
                {
                    TenantId = tenantId,
                    RawMessageId = message.MessageId ?? Guid.NewGuid().ToString(),
                    FromAddress = message.From.Mailboxes.FirstOrDefault()?.Address ?? "unknown@unknown.com",
                    ToAddress = message.To.Mailboxes.FirstOrDefault()?.Address ?? "",
                    Subject = message.Subject ?? "(No Subject)",
                    ParsedJson = JsonSerializer.Serialize(new
                    {
                        from = message.From.ToString(),
                        to = message.To.ToString(),
                        cc = message.Cc.ToString(),
                        subject = message.Subject,
                        date = message.Date.DateTime,
                        body = message.TextBody ?? message.HtmlBody ?? "",
                        attachmentCount = message.Attachments.Count()
                    }),
                    ReceivedAt = DateTime.UtcNow,
                    Status = EmailStatus.Pending
                };

                _context.EmailInbounds.Add(emailInbound);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Email inbound created: {EmailId} from {From}", emailInbound.Id, emailInbound.FromAddress);

                return emailInbound;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error parsing email from {From}", message.From.ToString());
                return null;
            }
        }

        public async Task<Ticket?> ConvertEmailToTicketAsync(long emailInboundId)
        {
            var emailInbound = await _context.EmailInbounds.FindAsync(emailInboundId);
            if (emailInbound == null || emailInbound.Status != EmailStatus.Pending)
            {
                _logger.LogWarning("EmailInbound {EmailId} not found or already processed", emailInboundId);
                return null;
            }

            try
            {
                // Find user by email
                var user = await _context.Users.FirstOrDefaultAsync(u => 
                    u.Email == emailInbound.FromAddress && u.TenantId == emailInbound.TenantId);

                if (user == null)
                {
                    _logger.LogWarning("User not found for email {Email}, cannot create ticket", emailInbound.FromAddress);
                    await MarkAsFailedAsync(emailInboundId, "User not found");
                    return null;
                }

                // Parse email body from JSON
                var parsed = JsonSerializer.Deserialize<JsonElement>(emailInbound.ParsedJson ?? "{}");
                var body = parsed.TryGetProperty("body", out var bodyProp) ? bodyProp.GetString() : "";

                // Determine department based on ToAddress (e.g., it@company.com -> IT department)
                var departmentName = ExtractDepartmentFromEmail(emailInbound.ToAddress);
                var department = await _context.Departments.FirstOrDefaultAsync(d =>
                    d.Name.ToLower() == departmentName.ToLower() && d.TenantId == emailInbound.TenantId);

                // Create ticket
                var ticket = new Ticket
                {
                    TenantId = emailInbound.TenantId,
                    Title = emailInbound.Subject ?? "(No Subject)",
                    Description = body ?? "",
                    Status = TicketStatus.New,
                    Priority = TicketPriority.Normal,
                    CreatorId = user.Id,
                    DepartmentId = department?.Id,
                    Channel = TicketChannel.Email,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Tickets.Add(ticket);
                await _context.SaveChangesAsync();

                // Log event
                var ticketEvent = new TicketEvent
                {
                    TicketId = ticket.Id,
                    TenantId = ticket.TenantId,
                    Type = TicketEventType.Custom,
                    ActorId = user.Id,
                    PayloadJson = JsonSerializer.Serialize(new { source = "email", emailId = emailInboundId }),
                    CreatedAt = DateTime.UtcNow
                };
                _context.TicketEvents.Add(ticketEvent);

                // Update EmailInbound
                emailInbound.TicketId = ticket.Id;
                emailInbound.ProcessedAt = DateTime.UtcNow;
                emailInbound.Status = EmailStatus.Processed;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Ticket {TicketId} created from email {EmailId}", ticket.Id, emailInboundId);

                return ticket;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error converting email {EmailId} to ticket", emailInboundId);
                await MarkAsFailedAsync(emailInboundId, ex.Message);
                return null;
            }
        }

        public async Task<List<EmailInbound>> GetPendingEmailsAsync(Guid tenantId)
        {
            return await _context.EmailInbounds
                .Where(e => e.TenantId == tenantId && e.Status == EmailStatus.Pending)
                .OrderBy(e => e.ReceivedAt)
                .ToListAsync();
        }

        public async Task MarkAsProcessedAsync(long emailInboundId, int? ticketId)
        {
            var emailInbound = await _context.EmailInbounds.FindAsync(emailInboundId);
            if (emailInbound != null)
            {
                emailInbound.Status = EmailStatus.Processed;
                emailInbound.ProcessedAt = DateTime.UtcNow;
                emailInbound.TicketId = ticketId;
                await _context.SaveChangesAsync();
            }
        }

        public async Task MarkAsFailedAsync(long emailInboundId, string errorReason)
        {
            var emailInbound = await _context.EmailInbounds.FindAsync(emailInboundId);
            if (emailInbound != null)
            {
                emailInbound.Status = EmailStatus.Failed;
                emailInbound.ProcessedAt = DateTime.UtcNow;
                emailInbound.ParsedJson = JsonSerializer.Serialize(new { error = errorReason, originalJson = emailInbound.ParsedJson });
                await _context.SaveChangesAsync();
            }
        }

        private string ExtractDepartmentFromEmail(string email)
        {
            // Example: it@company.com -> "IT"
            // hr@company.com -> "HR"
            var localPart = email.Split('@').FirstOrDefault()?.ToLower();
            return localPart switch
            {
                "it" or "support" or "helpdesk" => "IT",
                "hr" or "insan-kaynaklari" => "HR",
                "erp" or "muhasebe" => "ERP",
                _ => "IT" // Default to IT department
            };
        }
    }
}
