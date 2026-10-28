using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace Palantica.Api.Features.Reportes;

/// <summary>
/// Endpoints de Minimal API para el sistema de reportes de usuarios hacia administradores.
/// </summary>
public static class ReporteEndpoints
{
    public static IEndpointRouteBuilder MapReporteEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/reportes")
            .WithTags("Reportes y Feedback");

        group.MapPost("/", crearReporte)
            .RequireAuthorization()
            .WithName("CrearReporte")
            .WithSummary("Permite a un usuario autenticado enviar un reporte o mensaje al administrador (Asunto y Mensaje)");

        return app;
    }

    private static async Task<IResult> crearReporte(
        [FromBody] CrearReporteRequest request,
        ClaimsPrincipal user,
        [FromServices] ReporteRepository repository,
        CancellationToken cancellationToken)
    {
        if (request is null)
        {
            return Results.BadRequest(new { error = "El reporte no puede estar vacío." });
        }

        var idClaim = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(idClaim) || !int.TryParse(idClaim, out var userId))
        {
            return Results.Unauthorized();
        }

        var nombre = user.FindFirstValue(ClaimTypes.Name) ?? "Usuario";
        var email = user.FindFirstValue(ClaimTypes.Email) ?? "sin-email@palantica.com";

        var reporte = await repository.CrearReporteAsync(
            userId,
            nombre,
            email,
            request.Asunto,
            request.Mensaje,
            cancellationToken
        );

        var response = new ReporteResponse(
            reporte.Id,
            reporte.UsuarioId,
            reporte.UsuarioNombre,
            reporte.UsuarioEmail,
            reporte.Asunto,
            reporte.Mensaje,
            reporte.Estado,
            reporte.FechaCreacion,
            reporte.FechaResolucion
        );

        return Results.Created($"/api/v1/reportes/{reporte.Id}", response);
    }
}
