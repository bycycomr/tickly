using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Tickly.Api.Data;
using Tickly.Api.Models;

namespace Tickly.Api.Services
{
    public class TicketWorkflowService
    {
        private readonly AppDbContext _db;

        public TicketWorkflowService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<TicketEvent> TransitionStatusAsync(int ticketId, TicketStatus newStatus, string? actorId, string? note = null)
        {
            var ticket = await _db.Tickets.FindAsync(ticketId);
            if (ticket == null) throw new InvalidOperationException("Ticket not found");

            var oldStatus = ticket.Status;
            if (!IsTransitionAllowed(oldStatus, newStatus))
                throw new InvalidOperationException($"Transition from {oldStatus} to {newStatus} not allowed");

            ticket.Status = newStatus;
            ticket.UpdatedAt = DateTime.UtcNow;
            ticket.LastEventAt = DateTime.UtcNow;

            if (newStatus == TicketStatus.Closed)
                ticket.ClosedAt = DateTime.UtcNow;

            var ticketEvent = new TicketEvent
            {
                TicketId = ticketId,
                TenantId = ticket.TenantId,
                Type = TicketEventType.StatusChange,
                ActorId = actorId,
                Visibility = EventVisibility.Public,
                PayloadJson = System.Text.Json.JsonSerializer.Serialize(new
                {
                    from = oldStatus.ToString(),
                    to = newStatus.ToString(),
                    note
                }),
                CreatedAt = DateTime.UtcNow
            };

            _db.TicketEvents.Add(ticketEvent);
            await _db.SaveChangesAsync();

            return ticketEvent;
        }

        public async Task<TicketEvent> AssignTicketAsync(int ticketId, string assigneeId, string? actorId)
        {
            var ticket = await _db.Tickets.FindAsync(ticketId);
            if (ticket == null) throw new InvalidOperationException("Ticket not found");

            var oldAssignee = ticket.AssignedToUserId;
            ticket.AssignedToUserId = assigneeId;
            ticket.UpdatedAt = DateTime.UtcNow;
            ticket.LastEventAt = DateTime.UtcNow;

            if (ticket.Status == TicketStatus.New)
                ticket.Status = TicketStatus.Assigned;

            var ticketEvent = new TicketEvent
            {
                TicketId = ticketId,
                TenantId = ticket.TenantId,
                Type = TicketEventType.Assignment,
                ActorId = actorId,
                Visibility = EventVisibility.Public,
                PayloadJson = System.Text.Json.JsonSerializer.Serialize(new
                {
                    from = oldAssignee,
                    to = assigneeId
                }),
                CreatedAt = DateTime.UtcNow
            };

            _db.TicketEvents.Add(ticketEvent);
            await _db.SaveChangesAsync();

            return ticketEvent;
        }

        public async Task<TicketEvent> AddCommentAsync(int ticketId, string text, bool isInternal, string? actorId)
        {
            var ticket = await _db.Tickets.FindAsync(ticketId);
            if (ticket == null) throw new InvalidOperationException("Ticket not found");

            ticket.LastEventAt = DateTime.UtcNow;

            var ticketEvent = new TicketEvent
            {
                TicketId = ticketId,
                TenantId = ticket.TenantId,
                Type = isInternal ? TicketEventType.CommentInternal : TicketEventType.CommentPublic,
                ActorId = actorId,
                Visibility = isInternal ? EventVisibility.Internal : EventVisibility.Public,
                PayloadJson = System.Text.Json.JsonSerializer.Serialize(new { text }),
                CreatedAt = DateTime.UtcNow
            };

            _db.TicketEvents.Add(ticketEvent);
            await _db.SaveChangesAsync();

            return ticketEvent;
        }

        public async Task StartSLATimersAsync(int ticketId)
        {
            var ticket = await _db.Tickets
                .Include(t => t)
                .FirstOrDefaultAsync(t => t.Id == ticketId);

            if (ticket?.SLAPlanId == null) return;

            var slaPlan = await _db.SLAPlans.FindAsync(ticket.SLAPlanId);
            if (slaPlan == null) return;

            if (ticket.DueAt == null)
            {
                var dueMinutes = slaPlan.ResolutionTimeMinutes;
                ticket.DueAt = DateTime.UtcNow.AddMinutes(dueMinutes);
                await _db.SaveChangesAsync();
            }
        }

        private bool IsTransitionAllowed(TicketStatus from, TicketStatus to)
        {
            var allowedTransitions = new Dictionary<TicketStatus, List<TicketStatus>>
            {
                [TicketStatus.New] = new() { TicketStatus.Assigned, TicketStatus.Rejected },
                [TicketStatus.Assigned] = new() { TicketStatus.InProgress, TicketStatus.New },
                [TicketStatus.InProgress] = new() { TicketStatus.WaitingForInfo, TicketStatus.Completed },
                [TicketStatus.WaitingForInfo] = new() { TicketStatus.InProgress },
                [TicketStatus.Completed] = new() { TicketStatus.Closed, TicketStatus.InProgress },
                [TicketStatus.Closed] = new() { TicketStatus.InProgress }
            };

            return allowedTransitions.ContainsKey(from) && allowedTransitions[from].Contains(to);
        }
    }
}
