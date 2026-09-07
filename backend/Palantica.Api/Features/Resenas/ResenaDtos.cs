using System.ComponentModel.DataAnnotations;

namespace Palantica.Api.Features.Resenas;

/// <summary>
/// Contrato de solicitud para publicar una nueva reseña técnica.
/// </summary>
public sealed record ResenaCreateRequest(
    [Required(ErrorMessage = "La puntuación es obligatoria.")]
    [Range(1, 5, ErrorMessage = "La puntuación debe estar entre 1 y 5.")]
    int Puntuacion,

    [Required(ErrorMessage = "El título de la reseña es obligatorio.")]
    [StringLength(150, MinimumLength = 3, ErrorMessage = "El título debe tener entre 3 y 150 caracteres.")]
    string Titulo,

    [Required(ErrorMessage = "El contenido de la reseña es obligatorio.")]
    [MinLength(10, ErrorMessage = "El contenido debe tener al menos 10 caracteres explicativos.")]
    string Contenido,

    string? LadoPista = "Reves",
    string? TiempoUso = "1 mes"
);

/// <summary>
/// Contrato de respuesta para visualización de una reseña en la ficha de la pala.
/// </summary>
public sealed record ResenaResponse(
    int Id,
    int PalaId,
    int UsuarioId,
    string UsuarioNombre,
    string UsuarioNivelJuego,
    string? UsuarioAvatarUrl,
    int Puntuacion,
    string Titulo,
    string Contenido,
    string LadoPista,
    string TiempoUso,
    DateTimeOffset FechaPublicacion
);
