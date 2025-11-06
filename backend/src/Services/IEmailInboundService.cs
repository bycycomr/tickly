using MimeKit;
using Tickly.Api.Models;

namespace Tickly.Api.Services
{
    public interface IEmailInboundService
    {
        Task<EmailInbound?> ParseAndCreateEmailInboundAsync(MimeMessage message, Guid tenantId);
        Task<Ticket?> ConvertEmailToTicketAsync(long emailInboundId);
        Task<List<EmailInbound>> GetPendingEmailsAsync(Guid tenantId);
        Task MarkAsProcessedAsync(long emailInboundId, int? ticketId);
        Task MarkAsFailedAsync(long emailInboundId, string errorReason);
    }
}
