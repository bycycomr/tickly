using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Tickly.Api.Data;
using Tickly.Api.Models;
using Tickly.Api.Services;

namespace Tickly.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IConfiguration _config;
        private readonly IEmailService _emailService;

        public AuthController(AppDbContext db, IConfiguration config, IEmailService emailService)
        {
            _db = db;
            _config = config;
            _emailService = emailService;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest req)
        {
            var user = _db.Users.FirstOrDefault(u => u.Username == req.Username);
            if (user == null) return Unauthorized(new { error = "Invalid credentials" });
            if (string.IsNullOrEmpty(user.PasswordHash) || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
                return Unauthorized(new { error = "Invalid credentials" });

            // build claims
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim("tenant_id", user.TenantId.ToString())
            };

            var roles = _db.RoleAssignments.Where(r => r.UserId == user.Id).ToList();
            foreach (var ra in roles)
            {
                if (ra.DepartmentId == null)
                {
                    claims.Add(new Claim(ClaimTypes.Role, ra.Role.ToString()));
                }
                else
                {
                    claims.Add(new Claim("dept_role", $"{ra.DepartmentId}:{ra.Role}"));
                }
            }

            var token = GenerateToken(claims);
            
            // Get first department assignment for user info
            var primaryDepartment = roles.FirstOrDefault(r => r.DepartmentId != null);
            
            return Ok(new 
            { 
                token,
                user = new
                {
                    id = user.Id,
                    username = user.Username,
                    email = user.Email,
                    displayName = user.DisplayName,
                    tenantId = user.TenantId,
                    departmentId = primaryDepartment?.DepartmentId,
                    roles = roles.Where(r => r.DepartmentId == null).Select(r => r.Role.ToString()).ToArray(),
                    departmentRoles = roles.Where(r => r.DepartmentId != null).Select(r => new { 
                        departmentId = r.DepartmentId, 
                        role = r.Role.ToString() 
                    }).ToArray()
                }
            });
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterRequest req)
        {
            if (_db.Users.Any(u => u.Username == req.Username)) 
                return BadRequest(new { error = "Username taken" });
            
            var user = new User 
            { 
                Username = req.Username, 
                Email = req.Email, 
                DisplayName = req.DisplayName,
                OrganizationalDepartment = req.OrganizationalDepartment,
                JobTitle = req.JobTitle,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password) 
            };
            
            _db.Users.Add(user);
            _db.SaveChanges();
            
            // Otomatik olarak EndUser rolü ata (herkes ticket oluşturabilmeli)
            var endUserRole = new RoleAssignment
            {
                UserId = user.Id,
                TenantId = user.TenantId,
                DepartmentId = null, // Global rol
                Role = RoleName.EndUser,
                AssignedBy = "system",
                AssignedAt = DateTime.UtcNow
            };
            _db.RoleAssignments.Add(endUserRole);
            _db.SaveChanges();
            
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim("tenant_id", user.TenantId.ToString()),
                new Claim(ClaimTypes.Role, RoleName.EndUser.ToString())
            };
            
            var token = GenerateToken(claims);
            
            return Ok(new 
            { 
                token,
                user = new
                {
                    id = user.Id,
                    username = user.Username,
                    email = user.Email,
                    displayName = user.DisplayName,
                    tenantId = user.TenantId,
                    roles = new string[] { "EndUser" }
                }
            });
        }

        private string GenerateToken(IEnumerable<Claim> claims)
        {
            var key = _config["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key not configured");
            var issuer = _config["Jwt:Issuer"] ?? "tickly.local";
            var audience = _config["Jwt:Audience"] ?? "tickly.local";
            var expireMinutes = int.TryParse(_config["Jwt:ExpireMinutes"], out var m) ? m : 120;

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var creds = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(issuer: issuer, audience: audience, claims: claims, expires: DateTime.UtcNow.AddMinutes(expireMinutes), signingCredentials: creds);
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Email))
                return BadRequest(new { error = "Email is required" });

            var user = _db.Users.FirstOrDefault(u => u.Email == req.Email);
            
            // Security: Don't reveal if user exists
            if (user == null)
                return Ok(new { message = "If the email exists, a reset link has been sent" });

            // Generate reset token
            var resetToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
            user.PasswordResetToken = resetToken;
            user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1); // 1 hour expiry
            
            await _db.SaveChangesAsync();

            // Send email
            try
            {
                var resetLink = $"{_config["App:BaseUrl"]}/reset-password?token={Uri.EscapeDataString(resetToken)}";
                await _emailService.SendPasswordResetEmailAsync(user.Email!, resetLink, user.DisplayName ?? user.Username);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to send reset email: {ex.Message}");
                // Don't fail the request if email fails
            }

            return Ok(new { message = "If the email exists, a reset link has been sent" });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Token) || string.IsNullOrWhiteSpace(req.NewPassword))
                return BadRequest(new { error = "Token and new password are required" });

            var user = _db.Users.FirstOrDefault(u => 
                u.PasswordResetToken == req.Token && 
                u.PasswordResetTokenExpiry != null &&
                u.PasswordResetTokenExpiry > DateTime.UtcNow
            );

            if (user == null)
                return BadRequest(new { error = "Invalid or expired reset token" });

            // Update password
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
            user.PasswordResetToken = null;
            user.PasswordResetTokenExpiry = null;
            
            await _db.SaveChangesAsync();

            return Ok(new { message = "Password successfully reset" });
        }
    }

    public class LoginRequest { public string Username { get; set; } = null!; public string Password { get; set; } = null!; }
    public class RegisterRequest { public string Username { get; set; } = null!; public string Password { get; set; } = null!; public string? Email { get; set; } public string? DisplayName { get; set; } public string? OrganizationalDepartment { get; set; } public string? JobTitle { get; set; } }
    public class ForgotPasswordRequest { public string Email { get; set; } = null!; }
    public class ResetPasswordRequest { public string Token { get; set; } = null!; public string NewPassword { get; set; } = null!; }
}
