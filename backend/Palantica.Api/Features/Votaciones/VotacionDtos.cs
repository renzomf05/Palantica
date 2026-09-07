using System.ComponentModel.DataAnnotations;

namespace Palantica.Api.Features.Votaciones;

/// <summary>
/// Contrato de solicitud para emitir un voto de atributos técnicos.
/// </summary>
public sealed record VotoCreateRequest(
    [Required] [Range(1, 10, ErrorMessage = "La dureza percibida debe estar entre 1 (Muy blanda) y 10 (Tabla).")]
    int DurezaPercibida,

    [Required] [Range(1, 10, ErrorMessage = "La potencia debe estar entre 1 y 10.")]
    int Potencia,

    [Required] [Range(1, 10, ErrorMessage = "El control debe estar entre 1 y 10.")]
    int Control,

    [Required] [Range(1, 10, ErrorMessage = "La salida de bola debe estar entre 1 y 10.")]
    int SalidaBola,

    [Required] [Range(1, 10, ErrorMessage = "La maniobrabilidad debe estar entre 1 y 10.")]
    int Maniobrabilidad,

    [Required] [Range(1, 10, ErrorMessage = "El punto dulce debe estar entre 1 y 10.")]
    int PuntoDulce,

    [Required] [Range(1, 10, ErrorMessage = "El confort debe estar entre 1 y 10.")]
    int Confort,

    string? EstacionRecomendada = "TodoAno" // Verano, Invierno, TodoAno
);

/// <summary>
/// Resumen estadístico de las votaciones comunitarias de una pala.
/// </summary>
public sealed record VotacionResumenResponse(
    int PalaId,
    float DurezaPromedio,
    float PotenciaPromedio,
    float ControlPromedio,
    float SalidaBolaPromedio,
    float ManiobrabilidadPromedio,
    float PuntoDulcePromedio,
    float ConfortPromedio,
    int TotalVotos,
    int VotosVerano,
    int VotosInvierno,
    int VotosTodoAno,
    string EstacionDominante
);
