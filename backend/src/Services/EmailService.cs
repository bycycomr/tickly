using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Tickly.Api.Models;
using MailKit.Net.Smtp;
using MimeKit;

namespace Tickly.Api.Services
{
    /// <summary>
    /// Email service with SMTP support and email templates
    /// </summary>
    public class EmailService : IEmailService
    {
        private readonly ILogger<EmailService> _logger;
        private readonly IConfiguration _configuration;
        private readonly bool _smtpEnabled;

        public EmailService(ILogger<EmailService> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
            _smtpEnabled = _configuration.GetValue<bool>("Email:Smtp:Enabled", false);
        }

        public async Task SendTicketCreatedEmailAsync(Ticket ticket, User creator, string recipientEmail)
        {
            var subject = $"Yeni Talep Oluşturuldu: #{ticket.Id} - {ticket.Title}";
            var body = GetTicketCreatedTemplate(ticket, creator);

            await SendEmailAsync(recipientEmail, subject, body);
        }

        public async Task SendStatusChangedEmailAsync(
            Ticket ticket,
            Models.TicketStatus oldStatus,
            Models.TicketStatus newStatus,
            string recipientEmail)
        {
            var subject = $"Talep Durumu Değişti: #{ticket.Id}";
            var body = GetStatusChangedTemplate(ticket, oldStatus, newStatus);

            await SendEmailAsync(recipientEmail, subject, body);
        }

        public async Task SendTicketAssignedEmailAsync(Ticket ticket, User assignee)
        {
            var subject = $"Size Yeni Talep Atandı: #{ticket.Id} - {ticket.Title}";
            var body = GetTicketAssignedTemplate(ticket, assignee);

            await SendEmailAsync(assignee.Email ?? "unknown@unknown.com", subject, body);
        }

        public async Task SendCommentAddedEmailAsync(
            Ticket ticket,
            TicketEvent comment,
            string recipientEmail)
        {
            var subject = $"Talebe Yeni Yorum Eklendi: #{ticket.Id}";
            var body = GetCommentAddedTemplate(ticket, comment);

            await SendEmailAsync(recipientEmail, subject, body);
        }

        public async Task SendSLAViolationWarningAsync(
            Ticket ticket,
            string recipientEmail,
            string violationType)
        {
            var subject = $"⚠️ SLA İhlal Uyarısı: #{ticket.Id}";
            var body = GetSLAViolationTemplate(ticket, violationType);

            await SendEmailAsync(recipientEmail, subject, body);
        }

        // Helper method for SMTP email sending
        private async Task SendEmailAsync(string to, string subject, string htmlBody)
        {
            if (!_smtpEnabled)
            {
                _logger.LogInformation("[MOCK EMAIL] To: {To}, Subject: {Subject}", to, subject);
                return;
            }

            try
            {
                var smtpHost = _configuration["Email:Smtp:Server"];
                var smtpPort = _configuration.GetValue<int>("Email:Smtp:Port", 587);
                var smtpUsername = _configuration["Email:Smtp:Username"];
                var smtpPassword = _configuration["Email:Smtp:Password"];
                var fromEmail = _configuration["Email:Smtp:FromEmail"] ?? "noreply@tickly.local";
                var fromName = _configuration["Email:Smtp:FromName"] ?? "Tickly Destek";

                using var client = new SmtpClient();
                await client.ConnectAsync(smtpHost, smtpPort, MailKit.Security.SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(smtpUsername, smtpPassword);

                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(fromName, fromEmail));
                message.To.Add(MailboxAddress.Parse(to));
                message.Subject = subject;
                message.Body = new TextPart(MimeKit.Text.TextFormat.Html) { Text = htmlBody };

                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                _logger.LogInformation("Email sent successfully to {To}", to);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {To}", to);
            }
        }

        // Email Templates
        private string GetTicketCreatedTemplate(Ticket ticket, User creator)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: #4F46E5; color: white; padding: 20px; text-align: center; }}
        .content {{ background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }}
        .footer {{ text-align: center; color: #777; font-size: 12px; padding: 20px; }}
        .button {{ display: inline-block; background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2>Yeni Destek Talebi Oluşturuldu</h2>
        </div>
        <div class='content'>
            <p><strong>Talep No:</strong> #{ticket.Id}</p>
            <p><strong>Başlık:</strong> {ticket.Title}</p>
            <p><strong>Açıklama:</strong> {ticket.Description}</p>
            <p><strong>Öncelik:</strong> {GetPriorityLabel(ticket.Priority)}</p>
            <p><strong>Oluşturan:</strong> {creator.DisplayName}</p>
            <p><strong>Tarih:</strong> {ticket.CreatedAt:dd.MM.yyyy HH:mm}</p>
            <p style='margin-top: 20px;'>
                <a href='http://localhost:5173/tickets/{ticket.Id}' class='button'>Talebi Görüntüle</a>
            </p>
        </div>
        <div class='footer'>
            <p>Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.</p>
        </div>
    </div>
</body>
</html>";
        }

        private string GetStatusChangedTemplate(Ticket ticket, Models.TicketStatus oldStatus, Models.TicketStatus newStatus)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: #10B981; color: white; padding: 20px; text-align: center; }}
        .content {{ background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }}
        .status-change {{ background: #fff; padding: 15px; border-left: 4px solid #10B981; margin: 10px 0; }}
        .footer {{ text-align: center; color: #777; font-size: 12px; padding: 20px; }}
        .button {{ display: inline-block; background: #10B981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2>Talep Durumu Güncellendi</h2>
        </div>
        <div class='content'>
            <p><strong>Talep No:</strong> #{ticket.Id}</p>
            <p><strong>Başlık:</strong> {ticket.Title}</p>
            <div class='status-change'>
                <p><strong>Önceki Durum:</strong> {GetStatusLabel(oldStatus)}</p>
                <p><strong>Yeni Durum:</strong> {GetStatusLabel(newStatus)}</p>
            </div>
            <p style='margin-top: 20px;'>
                <a href='http://localhost:5173/tickets/{ticket.Id}' class='button'>Talebi Görüntüle</a>
            </p>
        </div>
        <div class='footer'>
            <p>Bu e-posta otomatik olarak gönderilmiştir.</p>
        </div>
    </div>
</body>
</html>";
        }

        private string GetTicketAssignedTemplate(Ticket ticket, User assignee)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: #F59E0B; color: white; padding: 20px; text-align: center; }}
        .content {{ background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }}
        .footer {{ text-align: center; color: #777; font-size: 12px; padding: 20px; }}
        .button {{ display: inline-block; background: #F59E0B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2>Size Yeni Talep Atandı</h2>
        </div>
        <div class='content'>
            <p>Merhaba {assignee.DisplayName},</p>
            <p>Size yeni bir destek talebi atandı:</p>
            <p><strong>Talep No:</strong> #{ticket.Id}</p>
            <p><strong>Başlık:</strong> {ticket.Title}</p>
            <p><strong>Açıklama:</strong> {ticket.Description}</p>
            <p><strong>Öncelik:</strong> {GetPriorityLabel(ticket.Priority)}</p>
            <p style='margin-top: 20px;'>
                <a href='http://localhost:5173/tickets/{ticket.Id}' class='button'>Talebi Görüntüle</a>
            </p>
        </div>
        <div class='footer'>
            <p>Bu e-posta otomatik olarak gönderilmiştir.</p>
        </div>
    </div>
</body>
</html>";
        }

        private string GetCommentAddedTemplate(Ticket ticket, TicketEvent comment)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: #6366F1; color: white; padding: 20px; text-align: center; }}
        .content {{ background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }}
        .comment {{ background: white; padding: 15px; border-left: 4px solid #6366F1; margin: 10px 0; }}
        .footer {{ text-align: center; color: #777; font-size: 12px; padding: 20px; }}
        .button {{ display: inline-block; background: #6366F1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2>Talebe Yeni Yorum Eklendi</h2>
        </div>
        <div class='content'>
            <p><strong>Talep No:</strong> #{ticket.Id}</p>
            <p><strong>Başlık:</strong> {ticket.Title}</p>
            <div class='comment'>
                <p><em>Yorum içeriği burada görüntülenecek</em></p>
            </div>
            <p style='margin-top: 20px;'>
                <a href='http://localhost:5173/tickets/{ticket.Id}' class='button'>Talebi Görüntüle</a>
            </p>
        </div>
        <div class='footer'>
            <p>Bu e-posta otomatik olarak gönderilmiştir.</p>
        </div>
    </div>
</body>
</html>";
        }

        private string GetSLAViolationTemplate(Ticket ticket, string violationType)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: #EF4444; color: white; padding: 20px; text-align: center; }}
        .content {{ background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }}
        .warning {{ background: #FEE2E2; border: 2px solid #EF4444; padding: 15px; margin: 10px 0; border-radius: 5px; }}
        .footer {{ text-align: center; color: #777; font-size: 12px; padding: 20px; }}
        .button {{ display: inline-block; background: #EF4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2>⚠️ SLA İhlal Uyarısı</h2>
        </div>
        <div class='content'>
            <div class='warning'>
                <p><strong>DİKKAT:</strong> Aşağıdaki talep için SLA ihlali tespit edildi!</p>
                <p><strong>İhlal Tipi:</strong> {violationType}</p>
            </div>
            <p><strong>Talep No:</strong> #{ticket.Id}</p>
            <p><strong>Başlık:</strong> {ticket.Title}</p>
            <p><strong>Öncelik:</strong> {GetPriorityLabel(ticket.Priority)}</p>
            <p><strong>Durum:</strong> {GetStatusLabel((Models.TicketStatus)ticket.Status)}</p>
            <p style='margin-top: 20px; color: #EF4444;'>
                <strong>Lütfen bu talebi öncelikli olarak ele alın!</strong>
            </p>
            <p style='margin-top: 20px;'>
                <a href='http://localhost:5173/tickets/{ticket.Id}' class='button'>Talebi Görüntüle</a>
            </p>
        </div>
        <div class='footer'>
            <p>Bu e-posta otomatik olarak gönderilmiştir.</p>
        </div>
    </div>
</body>
</html>";
        }

        // Helper methods for labels
        private string GetPriorityLabel(TicketPriority priority)
        {
            return priority switch
            {
                TicketPriority.Low => "Düşük",
                TicketPriority.Normal => "Normal",
                TicketPriority.High => "Yüksek",
                TicketPriority.Critical => "Kritik",
                _ => "Bilinmiyor"
            };
        }

        private string GetStatusLabel(Models.TicketStatus status)
        {
            return status switch
            {
                Models.TicketStatus.New => "Yeni",
                Models.TicketStatus.Assigned => "Atandı",
                Models.TicketStatus.InProgress => "İşlemde",
                Models.TicketStatus.WaitingForInfo => "Bilgi Bekleniyor",
                Models.TicketStatus.Completed => "Tamamlandı",
                Models.TicketStatus.Closed => "Kapatıldı",
                _ => "Bilinmiyor"
            };
        }
    }
}

