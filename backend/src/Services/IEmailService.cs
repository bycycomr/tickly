using System.Threading.Tasks;
using Tickly.Api.Models;

namespace Tickly.Api.Services
{
    public interface IEmailService
    {
        Task SendTicketCreatedEmailAsync(Ticket ticket, User creator, string recipientEmail);
        Task SendStatusChangedEmailAsync(Ticket ticket, TicketStatus oldStatus, TicketStatus newStatus, string recipientEmail);
        Task SendTicketAssignedEmailAsync(Ticket ticket, User assignee);
        Task SendCommentAddedEmailAsync(Ticket ticket, TicketEvent comment, string recipientEmail);
        Task SendSLAViolationWarningAsync(Ticket ticket, string recipientEmail, string violationType);
        Task SendPasswordResetEmailAsync(string recipientEmail, string resetLink, string displayName);
    }
}
