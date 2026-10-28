namespace Palantica.Api.Features.Admin;

/// <summary>
/// Representación de un usuario registrado en el panel de administración.
/// </summary>
public sealed record AdminUsuarioDto(
    int Id,
    string Nombre,
    string Email,
    string Rol,
    string NivelJuego,
    string LadoPistaPreferido,
    string? AvatarUrl,
    DateTimeOffset FechaRegistro
);

/// <summary>
/// Solicitud para cambiar el rol de un usuario.
/// </summary>
public sealed record CambiarRolRequest(
    string Rol
);

/// <summary>
/// Estadísticas globales para el panel de administración.
/// </summary>
public sealed record AdminEstadisticasDto(
    int TotalUsuarios,
    int TotalReportes,
    int ReportesPendientes,
    int TotalPalas,
    int TotalResenas
);
