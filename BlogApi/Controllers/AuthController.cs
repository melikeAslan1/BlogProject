using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using BlogApi.Dtos;
using BlogApi.Models;

namespace YoboApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private const string AuthCookieName = "auth_token";
    private readonly UserManager<AppUser> _userManager;
    private readonly SignInManager<AppUser> _signInManager;
    private readonly IConfiguration _configuration;
    public AuthController(UserManager<AppUser> userManager, SignInManager<AppUser> signInManager, IConfiguration configuration)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _configuration = configuration;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest model)
    {
        if (model == null || string.IsNullOrWhiteSpace(model.Email) || string.IsNullOrWhiteSpace(model.Password))
            return BadRequest("E-posta ve şifre zorunludur.");

        var email = model.Email.Trim().ToLowerInvariant();
        var exists = await _userManager.FindByEmailAsync(email);
        if (exists != null)
            return Conflict("Bu e-posta zaten kullanılıyor.");

            var user = new AppUser
            {
                UserName = email,
                Email = email,
                FullName = string.IsNullOrWhiteSpace(model.FullName) ? null : model.FullName.Trim()
            };
            var result = await _userManager.CreateAsync(user, model.Password);
            if (!result.Succeeded)
                return BadRequest(new { Errors = result.Errors.Select(e => e.Description) });

            var (token, expiresAt) = GenerateJwtToken(user);
            SetAuthCookie(token, expiresAt);
            return Ok(ToAuthResponse(user, expiresAt));
    }

    private (string token, DateTime expiresAt) GenerateJwtToken(AppUser user)
    {
        var jwt = _configuration.GetSection("JwtSettings");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(JwtRegisteredClaimNames.Email, user.Email ?? ""),
            new Claim(ClaimTypes.Name, user.FullName ?? user.Email ?? ""),
            new(JwtRegisteredClaimNames.Sub, user.Id)
        };
        var expires = DateTime.UtcNow.AddMinutes(double.Parse(jwt["ExpiryMinutes"]!));

        var token = new JwtSecurityToken(
            issuer: jwt["Issuer"],
            audience: jwt["Audience"],
            claims: claims,
            expires: expires,
            signingCredentials: creds
        );

        return (new JwtSecurityTokenHandler().WriteToken(token), expires);
    }

    private static AuthResponse ToAuthResponse(AppUser user, DateTime expiresAt)
    {
        return new AuthResponse
        {
            ExpiresAt = expiresAt,
            Email = user.Email ?? "",
            FullName = user.FullName ?? ""
        };
    }

    private void SetAuthCookie(string token, DateTime expiresAt)
    {
        Response.Cookies.Append(AuthCookieName, token, new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Lax,
            Expires = expiresAt
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest model)
    {
        if (model == null || string.IsNullOrWhiteSpace(model.Email) || string.IsNullOrWhiteSpace(model.Password))
            return BadRequest("E-posta ve şifre zorunludur.");

        var email = model.Email.Trim().ToLowerInvariant();
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
            return Unauthorized("Geçersiz e-posta veya şifre.");

        var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password.Trim(), false);
        if (!result.Succeeded)
            return Unauthorized("Geçersiz e-posta veya şifre.");

        var (token, expiresAt) = GenerateJwtToken(user);
        SetAuthCookie(token, expiresAt);
        return Ok(ToAuthResponse(user, expiresAt));
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<AuthResponse>> Me()
    {
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        if (string.IsNullOrWhiteSpace(id))
            return Unauthorized();

        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return Unauthorized();

        var jwt = _configuration.GetSection("JwtSettings");
        var expiry = DateTime.UtcNow.AddMinutes(double.Parse(jwt["ExpiryMinutes"]!));
        return Ok(ToAuthResponse(user, expiry));
    }

    [HttpPost("logout")]
    [Authorize]
    public IActionResult Logout()
    {
        Response.Cookies.Delete(AuthCookieName, new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Lax
        });
        return NoContent();
    }
}