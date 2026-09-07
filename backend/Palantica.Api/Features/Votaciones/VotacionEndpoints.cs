using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace Palantica.Api.Features.Votaciones;

/// <summary>
/// Endpoints de Minimal API para la emisión y consulta de votos comunitarios de atributos.
/// </summary>
public static class VotacionEndpoints
{
    /// <summary>
    /// Mapea los endpoints de votaciones al pipeline de la aplicación.
    /// </summary>
    public static IEndpointRouteBuilder MapVotacionEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/palas/{palaId:int}/votos")
            .WithTags("5. Votaciones de Atributos y Dureza");

        group.MapGet("/", obtenerResumenVotos)
            .WithName("ObtenerResumenVotos")
            .WithSummary("Obtiene el resumen estadístico de dureza y atributos de una pala");

        group.MapPost("/", emitirVoto)
            .RequireAuthorization()
            .WithName("EmitirVoto")
            .WithSummary("Emite un voto de atributos técnicos (requiere JWT y actualiza la pala atómicamente)");

        return app;
    }

    private static async Task<IResult> obtenerResumenVotos(
        int palaId,
        [FromServices] VotacionRepository repository,
        CancellationToken cancellationToken)
    {
        if (palaId <= 0) return Results.BadRequest(new { error = "El ID de pala debe ser mayor a 0." });

        var resumen = await repository.GetResumenByPalaIdAsync(palaId, cancellationToken);
        return Results.Ok(resumen);
    }

    private static async Task<IResult> emitirVoto(
        int palaId,
        [FromBody] VotoCreateRequest request,
        ClaimsPrincipal user,
        [FromServices] VotacionRepository repository,
        CancellationToken cancellationToken)
    {
        if (palaId <= 0) return Results.BadRequest(new { error = "El ID de pala debe ser mayor a 0." });
        if (request is null) return Results.BadRequest(new { error = "El cuerpo del voto no puede estar vacío." });

        var idClaim = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(idClaim) || !int.TryParse(idClaim, out var userId))
        {
            return Results.Unauthorized();
        }

        var resumenActualizado = await repository.CreateOrUpdateVotoAsync(palaId, userId, request, cancellationToken);
        return Results.Ok(resumenActualizado);
    }
}
