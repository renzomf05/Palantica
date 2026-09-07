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
}
