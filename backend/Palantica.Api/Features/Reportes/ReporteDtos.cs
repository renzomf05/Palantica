using System.ComponentModel.DataAnnotations;

namespace Palantica.Api.Features.Reportes;

/// <summary>
/// Contrato para creación de reporte por parte del usuario autenticado.
/// </summary>
public sealed record CrearReporteRequest(
    [Required(ErrorMessage = "El asunto es obligatorio.")]
    [StringLength(150, MinimumLength = 3, ErrorMessage = "El asunto debe tener entre 3 y 150 caracteres.")]
    string Asunto,

    [Required(ErrorMessage = "El mensaje es obligatorio.")]
    [StringLength(3000, MinimumLength = 5, ErrorMessage = "El mensaje debe tener entre 5 y 3000 caracteres.")]
    string Mensaje
);

/// <summary>
/// Contrato de actualización de estado de reporte para administradores.
/// </summary>
public sealed record ActualizarEstadoReporteRequest(
    [Required(ErrorMessage = "El nuevo estado es obligatorio.")]
    string Estado
);

/// <summary>
/// Respuesta detallada de reporte para administradores y usuario.
/// </summary>
public sealed record ReporteResponse(
    int Id,
    int UsuarioId,
    string UsuarioNombre,
    string UsuarioEmail,
    string Asunto,
    string Mensaje,
    string Estado,
    DateTimeOffset FechaCreacion,
    DateTimeOffset? FechaResolucion
);
