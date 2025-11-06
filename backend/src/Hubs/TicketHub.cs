using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace Tickly.Api.Hubs
{
    [Authorize]
    public class TicketHub : Hub
    {
        private readonly ILogger<TicketHub> _logger;

        public TicketHub(ILogger<TicketHub> logger)
        {
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var username = Context.User?.FindFirst(ClaimTypes.Name)?.Value;
            
            _logger.LogInformation("User {Username} ({UserId}) connected to TicketHub", username, userId);
            
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var username = Context.User?.FindFirst(ClaimTypes.Name)?.Value;
            
            _logger.LogInformation("User {Username} ({UserId}) disconnected from TicketHub", username, userId);
            
            await base.OnDisconnectedAsync(exception);
        }

        // Join a ticket room to receive updates
        public async Task JoinTicket(string ticketId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"ticket-{ticketId}");
            _logger.LogInformation("User {ConnectionId} joined ticket {TicketId}", Context.ConnectionId, ticketId);
        }

        // Leave a ticket room
        public async Task LeaveTicket(string ticketId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"ticket-{ticketId}");
            _logger.LogInformation("User {ConnectionId} left ticket {TicketId}", Context.ConnectionId, ticketId);
        }

        // Send a comment to a ticket (will be saved via API, this just broadcasts)
        public async Task SendComment(string ticketId, string message, bool isInternal)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var username = Context.User?.FindFirst(ClaimTypes.Name)?.Value;

            // Broadcast to all users watching this ticket
            await Clients.Group($"ticket-{ticketId}").SendAsync("ReceiveComment", new
            {
                ticketId,
                userId,
                username,
                message,
                isInternal,
                timestamp = DateTime.UtcNow
            });

            _logger.LogInformation("Comment sent to ticket {TicketId} by {Username}", ticketId, username);
        }

        // Notify typing status
        public async Task UserTyping(string ticketId)
        {
            var username = Context.User?.FindFirst(ClaimTypes.Name)?.Value;
            
            await Clients.OthersInGroup($"ticket-{ticketId}").SendAsync("UserTyping", new
            {
                username,
                ticketId
            });
        }
    }
}
