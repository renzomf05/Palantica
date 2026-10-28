namespace Palantica.Api.Features.Auth;

/// <summary>
/// Representa a un usuario registrado en la plataforma Palantica.
/// </summary>
public sealed class Usuario
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Rol { get; set; } = "Usuario";
    public int? PalaActivaId { get; set; }
    public string NivelJuego { get; set; } = "Intermedio";
    public string LadoPistaPreferido { get; set; } = "Reves";
    public string? AvatarUrl { get; set; }
    public DateTimeOffset FechaRegistro { get; set; } = DateTimeOffset.UtcNow;

    // Épica 2: Verificación de Correo (OTP 6 dígitos)
    public bool EmailVerificado { get; set; } = false;
    public string? CodigoVerificacion { get; set; }
    public DateTimeOffset? CodigoExpiracion { get; set; }

    // Épica 3: Autenticación en 2 Pasos (TOTP)
    public bool TwoFactorEnabled { get; set; } = false;
    public string? TwoFactorSecret { get; set; }
}
