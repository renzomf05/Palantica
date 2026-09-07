namespace Palantica.Api.Features.Resenas;

/// <summary>
/// Representa una reseña técnica detallada realizada por un jugador sobre una pala.
/// </summary>
public sealed class Resena
{
    public int Id { get; set; }
    public int PalaId { get; set; }
    public int UsuarioId { get; set; }
    public int Puntuacion { get; set; } // 1 a 5 estrellas
    public string Titulo { get; set; } = string.Empty;
    public string Contenido { get; set; } = string.Empty;
    public string LadoPista { get; set; } = "Reves";
    public string TiempoUso { get; set; } = "1 mes";
    public DateTimeOffset FechaPublicacion { get; set; } = DateTimeOffset.UtcNow;
}
