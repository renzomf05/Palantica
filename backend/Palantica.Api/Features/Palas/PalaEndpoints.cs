using Microsoft.AspNetCore.Mvc;
using Palantica.Api.Common.Pagination;

namespace Palantica.Api.Features.Palas;

/// <summary>
/// Endpoints de Minimal API para el catálogo, ficha sagrada y motor de similitud vectorial de palas.
/// </summary>
public static class PalaEndpoints
{
    /// <summary>
    /// Mapea los endpoints de palas al pipeline de la aplicación.
    /// </summary>
    public static IEndpointRouteBuilder MapPalaEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/palas")
            .WithTags("3. Catálogo de Palas");

        group.MapGet("/", listarPalas)
            .WithName("ListarPalas")
            .WithSummary("Consulta el catálogo de palas paginado y filtrable");

        group.MapGet("/{id:int}", obtenerFichaPala)
            .WithName("ObtenerFichaPala")
            .WithSummary("Obtiene la Ficha Sagrada completa de una pala de pádel");

        group.MapGet("/{id:int}/similares", calcularPalasSimilares)
            .WithName("CalcularPalasSimilares")
            .WithSummary("Calcula las palas parecidas mediante el motor de similitud vectorial multicriterio");

        return app;
    }

    private static async Task<IResult> listarPalas(
        [AsParameters] PalaFilterParams filterParams,
        [FromServices] PalaRepository repository,
        CancellationToken cancellationToken)
    {
        var pagedList = await repository.GetFilteredAsync(filterParams, cancellationToken);
        return Results.Ok(PagedResponse<PalaListResponse>.FromPagedList(pagedList));
    }

    private static async Task<IResult> obtenerFichaPala(
        int id,
        [FromServices] PalaRepository repository,
        [FromServices] PalaSimilarityEngine similarityEngine,
        CancellationToken cancellationToken)
    {
        if (id <= 0) return Results.BadRequest(new { error = "El ID debe ser mayor a 0." });

        var pala = await repository.GetByIdAsync(id, cancellationToken);
        if (pala is null) return Results.NotFound(new { error = "Pala de pádel no encontrada en el catálogo." });

        // Obtener recomendaciones de similitud vectorial
        var todasLasPalas = await repository.GetAllForSimilarityAsync(cancellationToken);
        var similares = similarityEngine.CalculateSimilarPalas(pala, todasLasPalas, limit: 4);

        var palaCompleta = pala with { PalasSimilares = similares };

        return Results.Ok(palaCompleta);
    }

    private static async Task<IResult> calcularPalasSimilares(
        int id,
        [FromQuery] int? limit,
        [FromServices] PalaRepository repository,
        [FromServices] PalaSimilarityEngine similarityEngine,
        CancellationToken cancellationToken)
    {
        if (id <= 0) return Results.BadRequest(new { error = "El ID debe ser mayor a 0." });
        var finalLimit = (limit.HasValue && limit.Value > 0) ? limit.Value : 4;

        var pala = await repository.GetByIdAsync(id, cancellationToken);
        if (pala is null) return Results.NotFound(new { error = "Pala no encontrada." });

        var todasLasPalas = await repository.GetAllForSimilarityAsync(cancellationToken);
        var similares = similarityEngine.CalculateSimilarPalas(pala, todasLasPalas, finalLimit);

        return Results.Ok(similares);
    }
}
