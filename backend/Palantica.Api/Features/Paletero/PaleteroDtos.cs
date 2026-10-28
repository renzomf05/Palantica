using System.ComponentModel.DataAnnotations;

namespace Palantica.Api.Features.Paletero;

/// <summary>
/// Contrato de solicitud para agregar o cambiar una pala de categoría en el paletero.
/// </summary>
public sealed record PaleteroAddRequest(
    [Required] [Range(1, int.MaxValue, ErrorMessage = "El ID de pala debe ser válido.")]
    int PalaId,

    [Required(ErrorMessage = "La categoría es obligatoria.")]
    string Categoria, // 'Usando actualmente', 'En el paletero', 'Palas que tuve', 'Palas que quiero'

    string? Notas = null
);

/// <summary>
/// Contrato de respuesta para un ítem del paletero con datos expandidos de la pala.
/// </summary>
public sealed record PaleteroItemResponse(
    int Id,
    int UsuarioId,
    int PalaId,
    string PalaModelo,
    string PalaMarca,
    string PalaForma,
    string? PalaImagenUrl,
    float PalaPuntuacionGeneral,
    float PalaDurezaPromedio,
    decimal PalaPrecioReferencia,
    string Categoria,
    string? Notas,
    DateTimeOffset FechaRegistro
);

/// <summary>
/// Contrato de paletero agrupado por sus compartimentos.
/// </summary>
public sealed record MiPaleteroGroupedResponse(
    IReadOnlyList<PaleteroItemResponse> UsandoActualmente,
    IReadOnlyList<PaleteroItemResponse> PalasQueMeGustaron,
    IReadOnlyList<PaleteroItemResponse> PalasQueNoMeGustaron,
    IReadOnlyList<PaleteroItemResponse> PalasQueQuiero,
    IReadOnlyList<PaleteroItemResponse> PalasQueTuve,
    IReadOnlyList<PaleteroItemResponse> EnElPaletero
);
