using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace Tickly.Api.Hubs
{
    [Authorize]
    public class NotificationHub : Hub
    {
        private readonly ILogger<NotificationHub> _logger;

        public NotificationHub(ILogger<NotificationHub> logger)
        {
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var username = Context.User?.FindFirst(ClaimTypes.Name)?.Value;

            if (!string.IsNullOrEmpty(userId))
            {
                // Join user's personal notification group
                await Groups.AddToGroupAsync(Context.ConnectionId, $"user-{userId}");
                _logger.LogInformation("User {Username} ({UserId}) connected to NotificationHub", username, userId);
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var username = Context.User?.FindFirst(ClaimTypes.Name)?.Value;

            _logger.LogInformation("User {Username} ({UserId}) disconnected from NotificationHub", username, userId);

            await base.OnDisconnectedAsync(exception);
        }

        // Mark notification as read
        public async Task MarkAsRead(string notificationId)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            _logger.LogInformation("Notification {NotificationId} marked as read by user {UserId}", notificationId, userId);
            
            // TODO: Update notification status in database
        }

        // Get online users count (for admin dashboard)
        public int GetOnlineUsersCount()
        {
            // This is a simplified implementation
            // In production, you'd track this in a distributed cache (Redis)
            return 0;
        }
    }

    // Extension methods for sending notifications from services
    public static class NotificationHubExtensions
    {
        public static async Task SendTicketStatusChangedAsync(
            this IHubContext<NotificationHub> hubContext,
            string userId,
            int ticketId,
            string oldStatus,
            string newStatus,
            string ticketTitle)
        {
            await hubContext.Clients.Group($"user-{userId}").SendAsync("TicketStatusChanged", new
            {
                ticketId,
                oldStatus,
                newStatus,
                ticketTitle,
                timestamp = DateTime.UtcNow,
                message = $"Talep #{ticketId} durumu değişti: {oldStatus} → {newStatus}"
            });
        }

        public static async Task SendTicketAssignedAsync(
            this IHubContext<NotificationHub> hubContext,
            string userId,
            int ticketId,
            string ticketTitle,
            string assignerName)
        {
            await hubContext.Clients.Group($"user-{userId}").SendAsync("TicketAssigned", new
            {
                ticketId,
                ticketTitle,
                assignerName,
                timestamp = DateTime.UtcNow,
                message = $"Size yeni talep atandı: #{ticketId} - {ticketTitle}"
            });
        }

        public static async Task SendCommentAddedAsync(
            this IHubContext<NotificationHub> hubContext,
            string userId,
            int ticketId,
            string ticketTitle,
            string commenterName,
            bool isInternal)
        {
            await hubContext.Clients.Group($"user-{userId}").SendAsync("CommentAdded", new
            {
                ticketId,
                ticketTitle,
                commenterName,
                isInternal,
                timestamp = DateTime.UtcNow,
                message = $"Talep #{ticketId} için yeni yorum: {commenterName}"
            });
        }

        public static async Task SendSLAViolationAsync(
            this IHubContext<NotificationHub> hubContext,
            string userId,
            int ticketId,
            string ticketTitle,
            string violationType)
        {
            await hubContext.Clients.Group($"user-{userId}").SendAsync("SLAViolation", new
            {
                ticketId,
                ticketTitle,
                violationType,
                timestamp = DateTime.UtcNow,
                message = $"⚠️ SLA İhlali: Talep #{ticketId} - {violationType}",
                severity = "urgent"
            });
        }
    }
}
