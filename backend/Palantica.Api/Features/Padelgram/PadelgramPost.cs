namespace Palantica.Api.Features.Padelgram;

/// <summary>
/// Representa una publicación fotográfica en pista en la comunidad Padelgram.
/// </summary>
public sealed class PadelgramPost
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public int PalaId { get; set; }
    public string ImagenUrl { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? Ubicacion { get; set; }
    public int LikesCount { get; set; }
    public DateTimeOffset FechaPublicacion { get; set; } = DateTimeOffset.UtcNow;
}
