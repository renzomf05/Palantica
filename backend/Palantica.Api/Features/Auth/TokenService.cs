using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace Palantica.Api.Features.Auth;

/// <summary>
/// Servicio criptográfico para generación y validación de tokens JWT.
/// </summary>
public sealed class TokenService
{
    private readonly IConfiguration configuration;

    /// <summary>
    /// Inicializa una nueva instancia de <see cref="TokenService"/>.
    /// </summary>
    public TokenService(IConfiguration configuration)
    {
        this.configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
    }

    /// <summary>
    /// Genera un token JWT firmado para el usuario autenticado.
    /// </summary>
    /// <param name="usuario">Entidad de usuario autenticado.</param>
    /// <returns>Cadena de texto con el token JWT válido.</returns>
    public string GenerateJwtToken(Usuario usuario)
    {
        ArgumentNullException.ThrowIfNull(usuario);

        var secretKey = configuration["Jwt:Key"]
                        ?? configuration["JWT_SECRET"]
                        ?? "***REMOVED***";

        var issuer = configuration["Jwt:Issuer"] ?? "Palantica.Api";
        var audience = configuration["Jwt:Audience"] ?? "Palantica.Client";

        var keyBytes = Encoding.UTF8.GetBytes(secretKey);
        var securityKey = new SymmetricSecurityKey(keyBytes);
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new(ClaimTypes.Email, usuario.Email),
            new(ClaimTypes.Name, usuario.Nombre),
            new(ClaimTypes.Role, usuario.Rol),
            new("nivelJuego", usuario.NivelJuego),
            new("ladoPista", usuario.LadoPistaPreferido)
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddDays(30),
            Issuer = issuer,
            Audience = audience,
            SigningCredentials = credentials
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    /// <summary>
    /// Genera un token temporal efímero (5 minutos) para completar el segundo factor de autenticación (2FA).
    /// </summary>
    public string Generate2FATempToken(Usuario usuario)
    {
        ArgumentNullException.ThrowIfNull(usuario);

        var secretKey = configuration["Jwt:Key"]
                        ?? configuration["JWT_SECRET"]
                        ?? "***REMOVED***";

        var issuer = configuration["Jwt:Issuer"] ?? "Palantica.Api";
        var audience = configuration["Jwt:Audience"] ?? "Palantica.Client";

        var keyBytes = Encoding.UTF8.GetBytes(secretKey);
        var securityKey = new SymmetricSecurityKey(keyBytes);
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new(ClaimTypes.Email, usuario.Email),
            new("2fa_temp", "true")
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(5),
            Issuer = issuer,
            Audience = audience,
            SigningCredentials = credentials
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    /// <summary>
    /// Valida un token temporal de 2FA y retorna el ID y correo del usuario.
    /// </summary>
    public (bool IsValid, int UserId, string? Email) Validate2FATempToken(string tempToken)
    {
        if (string.IsNullOrWhiteSpace(tempToken)) return (false, 0, null);

        var secretKey = configuration["Jwt:Key"]
                        ?? configuration["JWT_SECRET"]
                        ?? "***REMOVED***";

        var issuer = configuration["Jwt:Issuer"] ?? "Palantica.Api";
        var audience = configuration["Jwt:Audience"] ?? "Palantica.Client";

        var tokenHandler = new JwtSecurityTokenHandler();
        var validationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
            ValidateIssuer = true,
            ValidIssuer = issuer,
            ValidateAudience = true,
            ValidAudience = audience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30)
        };

        try
        {
            var principal = tokenHandler.ValidateToken(tempToken, validationParameters, out _);
            var isTemp = principal.FindFirst("2fa_temp")?.Value == "true";
            var idClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var emailClaim = principal.FindFirst(ClaimTypes.Email)?.Value;

            if (isTemp && int.TryParse(idClaim, out var userId))
            {
                return (true, userId, emailClaim);
            }
        }
        catch
        {
            // Token inválido o expirado
        }

        return (false, 0, null);
    }
}
