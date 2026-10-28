namespace Palantica.Api.Features.Reportes;

/// <summary>
/// Representa un reporte o mensaje de feedback/bug enviado por un usuario a los administradores.
/// </summary>
public sealed class Reporte
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public string UsuarioNombre { get; set; } = string.Empty;
    public string UsuarioEmail { get; set; } = string.Empty;
    public string Asunto { get; set; } = string.Empty;
    public string Mensaje { get; set; } = string.Empty;
    public string Estado { get; set; } = "Pendiente"; // "Pendiente", "EnRevision", "Resuelto"
    public DateTimeOffset FechaCreacion { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? FechaResolucion { get; set; }
}
