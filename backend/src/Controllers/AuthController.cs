using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Tickly.Api.Data;
using Tickly.Api.Models;

namespace Tickly.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IConfiguration _config;

        public AuthController(AppDbContext db, IConfiguration config)
        {
            _db = db;
            _config = config;
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
                    roles = roles.Where(r => r.DepartmentId == null).Select(r => r.Role.ToString()).ToArray()
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
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password) 
            };
            
            _db.Users.Add(user);
            _db.SaveChanges();
            
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim("tenant_id", user.TenantId.ToString())
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
                    roles = new string[] { }
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
    }

    public class LoginRequest { public string Username { get; set; } = null!; public string Password { get; set; } = null!; }
    public class RegisterRequest { public string Username { get; set; } = null!; public string Password { get; set; } = null!; public string? Email { get; set; } public string? DisplayName { get; set; } }
}
