using Microsoft.AspNetCore.Mvc;
using Palantica.Api.Features.Reportes;

namespace Palantica.Api.Features.Admin;

/// <summary>
/// Endpoints de Minimal API para el panel de administración de Palantica.
/// Todos los endpoints requieren que el usuario posea el rol de 'Admin'.
/// </summary>
public static class AdminEndpoints
{
    public static IEndpointRouteBuilder MapAdminEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/admin")
            .WithTags("Panel de Administración")
            .RequireAuthorization("AdminPolicy");

        group.MapGet("/usuarios", getUsuarios)
            .WithName("GetAdminUsuarios")
            .WithSummary("Lista todos los usuarios registrados reales en la base de datos");

        group.MapPatch("/usuarios/{id:int}/rol", cambiarRol)
            .WithName("CambiarRolUsuario")
            .WithSummary("Permite promover o cambiar el rol de un usuario");

        group.MapGet("/reportes", getReportes)
            .WithName("GetAdminReportes")
            .WithSummary("Lista todos los mensajes y reportes enviados por usuarios");

        group.MapPatch("/reportes/{id:int}/estado", actualizarEstadoReporte)
            .WithName("ActualizarEstadoReporte")
            .WithSummary("Actualiza el estado de un reporte (ej. Pendiente, EnRevision, Resuelto)");

        group.MapGet("/estadisticas", getEstadisticas)
            .WithName("GetAdminEstadisticas")
            .WithSummary("Retorna métricas globales de usuarios, reportes y palas");

        return app;
    }

    private static async Task<IResult> getUsuarios(
        [FromServices] AdminRepository repository,
        CancellationToken cancellationToken)
    {
        var usuarios = await repository.GetUsuariosAsync(cancellationToken);
        return Results.Ok(usuarios);
    }

    private static async Task<IResult> cambiarRol(
        [FromRoute] int id,
        [FromBody] CambiarRolRequest request,
        [FromServices] AdminRepository repository,
        CancellationToken cancellationToken)
    {
        if (request is null || string.IsNullOrWhiteSpace(request.Rol))
        {
            return Results.BadRequest(new { error = "El rol es obligatorio." });
        }

        var ok = await repository.ActualizarRolUsuarioAsync(id, request.Rol.Trim(), cancellationToken);
        if (!ok)
        {
            return Results.BadRequest(new { error = "No se pudo actualizar el rol del usuario." });
        }

        return Results.Ok(new { mensaje = "Rol actualizado correctamente." });
    }

    private static async Task<IResult> getReportes(
        [FromQuery] string? estado,
        [FromQuery] int? page,
        [FromQuery] int? pageSize,
        [FromServices] ReporteRepository repository,
        CancellationToken cancellationToken)
    {
        var reportes = await repository.GetReportesAsync(estado, page ?? 1, pageSize ?? 50, cancellationToken);
        var mapped = reportes.Select(r => new ReporteResponse(
            r.Id,
            r.UsuarioId,
            r.UsuarioNombre,
            r.UsuarioEmail,
            r.Asunto,
            r.Mensaje,
            r.Estado,
            r.FechaCreacion,
            r.FechaResolucion
        )).ToList();

        return Results.Ok(mapped);
    }

    private static async Task<IResult> actualizarEstadoReporte(
        [FromRoute] int id,
        [FromBody] ActualizarEstadoReporteRequest request,
        [FromServices] ReporteRepository repository,
        CancellationToken cancellationToken)
    {
        if (request is null || string.IsNullOrWhiteSpace(request.Estado))
        {
            return Results.BadRequest(new { error = "El nuevo estado es obligatorio." });
        }

        var actualizado = await repository.ActualizarEstadoAsync(id, request.Estado.Trim(), cancellationToken);
        if (actualizado is null)
        {
            return Results.NotFound(new { error = "Reporte no encontrado." });
        }

        return Results.Ok(new ReporteResponse(
            actualizado.Id,
            actualizado.UsuarioId,
            actualizado.UsuarioNombre,
            actualizado.UsuarioEmail,
            actualizado.Asunto,
            actualizado.Mensaje,
            actualizado.Estado,
            actualizado.FechaCreacion,
            actualizado.FechaResolucion
        ));
    }

    private static async Task<IResult> getEstadisticas(
        [FromServices] AdminRepository repository,
        CancellationToken cancellationToken)
    {
        var stats = await repository.GetEstadisticasAsync(cancellationToken);
        return Results.Ok(stats);
    }
}
