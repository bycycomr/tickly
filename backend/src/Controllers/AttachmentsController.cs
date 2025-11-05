using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Tickly.Api.Data;
using Tickly.Api.Models;
using Tickly.Api.Services;

namespace Tickly.Api.Controllers
{
    [ApiController]
    [Route("api/tickets/{ticketId}/[controller]")]
    [Authorize]
    public class AttachmentsController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly AuditService _audit;
        private readonly string _storagePath;

        public AttachmentsController(AppDbContext db, AuditService audit, Microsoft.Extensions.Configuration.IConfiguration config)
        {
            _db = db;
            _audit = audit;
            _storagePath = config["Storage:AttachmentsPath"] ?? Path.Combine(Directory.GetCurrentDirectory(), "uploads");
            Directory.CreateDirectory(_storagePath);
        }

        private Guid? GetTenantId()
        {
            var claim = User?.FindFirst("tenant_id");
            return claim != null && Guid.TryParse(claim.Value, out var tid) ? tid : null;
        }

        private string? GetUserId()
        {
            return User?.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(int ticketId)
        {
            var tenantId = GetTenantId();
            if (tenantId == null) return Unauthorized();

            var ticket = await _db.Tickets.FindAsync(ticketId);
            if (ticket == null || ticket.TenantId != tenantId.Value) return NotFound();

            var attachments = await _db.Attachments
                .Where(a => a.TicketId == ticketId)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            return Ok(attachments);
        }

        [HttpPost]
        [RequestSizeLimit(10_000_000)] // 10MB
        public async Task<IActionResult> Upload(int ticketId, IFormFile file)
        {
            var tenantId = GetTenantId();
            var userId = GetUserId();
            if (tenantId == null || userId == null) return Unauthorized();

            var ticket = await _db.Tickets.FindAsync(ticketId);
            if (ticket == null || ticket.TenantId != tenantId.Value) return NotFound();

            if (file == null || file.Length == 0)
                return BadRequest(new { error = "No file uploaded" });

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".pdf", ".docx", ".xlsx", ".txt", ".zip" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension))
                return BadRequest(new { error = "File type not allowed" });

            var fileName = $"{Guid.NewGuid()}{extension}";
            var relativePath = Path.Combine(tenantId.Value.ToString(), ticketId.ToString(), fileName);
            var fullPath = Path.Combine(_storagePath, relativePath);

            Directory.CreateDirectory(Path.GetDirectoryName(fullPath)!);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var attachment = new Attachment
            {
                TicketId = ticketId,
                TenantId = tenantId.Value,
                FileName = file.FileName,
                MimeType = file.ContentType,
                StoragePath = relativePath,
                SizeBytes = file.Length,
                UploadedBy = userId,
                ScanStatus = ScanStatus.Pending
            };

            _db.Attachments.Add(attachment);
            await _db.SaveChangesAsync();

            // Create ticket event
            var ticketEvent = new TicketEvent
            {
                TicketId = ticketId,
                TenantId = tenantId.Value,
                Type = TicketEventType.AttachmentAdded,
                ActorId = userId,
                Visibility = EventVisibility.Public,
                PayloadJson = System.Text.Json.JsonSerializer.Serialize(new
                {
                    attachmentId = attachment.Id,
                    fileName = file.FileName,
                    size = file.Length
                })
            };

            _db.TicketEvents.Add(ticketEvent);
            await _db.SaveChangesAsync();

            await _audit.LogAsync(
                tenantId,
                userId,
                null,
                "Attachment",
                attachment.Id.ToString(),
                "Upload",
                null,
                new { fileName = file.FileName, ticketId }
            );

            return CreatedAtAction(nameof(Download), new { ticketId, id = attachment.Id }, attachment);
        }

        [HttpGet("{id:long}")]
        public async Task<IActionResult> Download(int ticketId, long id)
        {
            var tenantId = GetTenantId();
            if (tenantId == null) return Unauthorized();

            var attachment = await _db.Attachments
                .FirstOrDefaultAsync(a => a.Id == id && a.TicketId == ticketId && a.TenantId == tenantId.Value);

            if (attachment == null) return NotFound();

            if (attachment.ScanStatus == ScanStatus.Quarantined)
                return BadRequest(new { error = "File quarantined by security scan" });

            if (attachment.ScanStatus == ScanStatus.Pending)
                return StatusCode(202, new { message = "File scan pending" });

            var fullPath = Path.Combine(_storagePath, attachment.StoragePath);
            if (!System.IO.File.Exists(fullPath))
                return NotFound(new { error = "File not found on disk" });

            var memory = new MemoryStream();
            using (var stream = new FileStream(fullPath, FileMode.Open, FileAccess.Read))
            {
                await stream.CopyToAsync(memory);
            }
            memory.Position = 0;

            return File(memory, attachment.MimeType, attachment.FileName);
        }

        [HttpDelete("{id:long}")]
        public async Task<IActionResult> Delete(int ticketId, long id)
        {
            var tenantId = GetTenantId();
            var userId = GetUserId();
            if (tenantId == null || userId == null) return Unauthorized();

            var attachment = await _db.Attachments
                .FirstOrDefaultAsync(a => a.Id == id && a.TicketId == ticketId && a.TenantId == tenantId.Value);

            if (attachment == null) return NotFound();

            var fullPath = Path.Combine(_storagePath, attachment.StoragePath);
            if (System.IO.File.Exists(fullPath))
            {
                System.IO.File.Delete(fullPath);
            }

            _db.Attachments.Remove(attachment);
            await _db.SaveChangesAsync();

            await _audit.LogAsync(
                tenantId,
                userId,
                null,
                "Attachment",
                id.ToString(),
                "Delete",
                attachment,
                null
            );

            return NoContent();
        }
    }
}
