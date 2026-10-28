using Microsoft.AspNetCore.Mvc;

namespace Palantica.Api.Features.Padelful;

/// <summary>
/// Endpoints de Minimal API para la integración con Padelful.
/// Permite consultar el catálogo técnico de palas y sincronizarlo en Palantica.
/// </summary>
public static class PadelfulEndpoints
{
    public static IEndpointRouteBuilder MapPadelfulEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/padelful")
            .WithTags("Padelful Integrator");

        group.MapGet("/rackets", getPadelfulRackets)
            .WithName("GetPadelfulRackets")
            .WithSummary("Consulta y previsualiza el catálogo de palas desde Padelful con métricas técnicas completas");

        group.MapGet("/rackets/{slug}", getPadelfulRacketBySlug)
            .WithName("GetPadelfulRacketBySlug")
            .WithSummary("Obtiene los detalles técnicos de una pala específica de Padelful por su slug");

        group.MapPost("/sync", syncPadelful)
            .WithName("SyncPadelful")
            .WithSummary("Sincroniza e importa el catálogo técnico de Padelful a la base de datos de Palantica");

        group.MapGet("/jugadores-pro", getJugadoresPro)
            .WithName("GetPadelfulJugadoresPro")
            .WithSummary("Consulta exclusivamente desde la API de Padelful las palas de jugadores profesionales sin tocar la base de datos");

        group.MapGet("/quota", () => Results.Ok(PadelfulService.GetQuotaStatus()))
            .WithName("GetPadelfulQuota")
            .WithSummary("Consulta el estado de la cuota de llamadas y la protección anti-cobro");

        return app;
    }

    private static async Task<IResult> getJugadoresPro(
        [FromServices] PadelfulService service,
        CancellationToken cancellationToken)
    {
        var rackets = await service.GetJugadoresProRacketsAsync(cancellationToken);
        return Results.Ok(rackets);
    }

    private static async Task<IResult> getPadelfulRackets(
        [FromQuery] string? query,
        [FromQuery] string? brand,
        [FromQuery] string? shape,
        [FromQuery] float? minRating,
        [FromQuery] int? limit,
        [FromQuery] int? offset,
        [FromServices] PadelfulService service,
        CancellationToken cancellationToken)
    {
        var filter = new PadelfulFilterRequest(
            Query: query,
            Brand: brand,
            Shape: shape,
            MinRating: minRating,
            Limit: limit ?? 20,
            Offset: offset ?? 0
        );

        var rackets = await service.PreviewPadelfulRacketsAsync(filter, cancellationToken);
        return Results.Ok(rackets);
    }

    private static async Task<IResult> getPadelfulRacketBySlug(
        [FromRoute] string slug,
        [FromServices] PadelfulService service,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(slug))
        {
            return Results.BadRequest(new { error = "El slug de la pala es obligatorio." });
        }

        var racket = await service.GetRacketBySlugAsync(slug, cancellationToken);
        if (racket is null)
        {
            return Results.NotFound(new { error = $"No se encontró la pala con slug '{slug}' en Padelful." });
        }

        return Results.Ok(racket);
    }

    private static async Task<IResult> syncPadelful(
        [FromBody] PadelfulSyncRequest? request,
        [FromServices] PadelfulService service,
        CancellationToken cancellationToken)
    {
        request ??= new PadelfulSyncRequest();
        var result = await service.SyncPadelfulAsync(request, cancellationToken);
        return Results.Ok(result);
    }
}
