using Microsoft.AspNetCore.Mvc;

namespace Palantica.Api.Features.Marcas;

/// <summary>
/// Endpoints de Minimal API para la característica de Fabricantes y Marcas.
/// </summary>
public static class MarcaEndpoints
{
    /// <summary>
    /// Mapea los endpoints de marcas al pipeline de la aplicación.
    /// </summary>
    public static IEndpointRouteBuilder MapMarcaEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/marcas")
            .WithTags("2. Marcas");

        group.MapGet("/", listarMarcas)
            .WithName("ListarMarcas")
            .WithSummary("Lista todos los fabricantes oficiales de pádel");

        group.MapGet("/{id:int}", obtenerMarcaPorId)
            .WithName("ObtenerMarcaPorId")
            .WithSummary("Obtiene el detalle de un fabricante por su ID");

        return app;
    }

    private static async Task<IResult> listarMarcas(
        [FromServices] MarcaRepository repository,
        CancellationToken cancellationToken)
    {
        var marcas = await repository.GetAllAsync(cancellationToken);
        return Results.Ok(marcas);
    }

    private static async Task<IResult> obtenerMarcaPorId(
        int id,
        [FromServices] MarcaRepository repository,
        CancellationToken cancellationToken)
    {
        if (id <= 0) return Results.BadRequest(new { error = "El ID debe ser mayor a 0." });

        var marca = await repository.GetByIdAsync(id, cancellationToken);
        if (marca is null) return Results.NotFound(new { error = "Marca no encontrada." });

        return Results.Ok(marca);
    }
}
