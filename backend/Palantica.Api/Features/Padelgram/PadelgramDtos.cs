using System.ComponentModel.DataAnnotations;

namespace Palantica.Api.Features.Padelgram;

/// <summary>
/// Contrato de solicitud para publicar una fotografía en Padelgram.
/// </summary>
public sealed record PadelgramCreateRequest(
    [Required] [Range(1, int.MaxValue, ErrorMessage = "Debe etiquetar una pala válida.")]
    int PalaId,

    [Required(ErrorMessage = "La URL de la imagen es obligatoria.")]
    [Url(ErrorMessage = "La imagen debe ser una URL válida.")]
    string ImagenUrl,

    string? Descripcion = null,
    string? Ubicacion = null
);

/// <summary>
/// Contrato de respuesta para una publicación del feed de Padelgram.
/// </summary>
public sealed record PadelgramPostResponse(
    int Id,
    int UsuarioId,
    string UsuarioNombre,
    string? UsuarioAvatarUrl,
    int PalaId,
    string PalaModelo,
    string PalaMarca,
    string ImagenUrl,
    string? Descripcion,
    string? Ubicacion,
    int LikesCount,
    DateTimeOffset FechaPublicacion
);
