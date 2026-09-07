using Microsoft.AspNetCore.Mvc;

namespace Palantica.Api.Features.Noticias;

/// <summary>
/// Endpoints de Minimal API para noticias del pádel.
/// </summary>
public static class NoticiasEndpoints
{
    /// <summary>
    /// Mapea los endpoints de noticias.
    /// </summary>
    public static IEndpointRouteBuilder MapNoticiasEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/noticias")
            .WithTags("Noticias");

        group.MapGet("/", obtenerNoticias)
            .WithName("ObtenerNoticias")
            .WithSummary("Obtiene las últimas noticias, novedades técnicas y actualidad del pádel");

        return app;
    }

    private static async Task<IResult> obtenerNoticias(
        [FromQuery] int? limit,
        [FromServices] NoticiasService service,
        CancellationToken cancellationToken)
    {
        var finalLimit = (limit.HasValue && limit.Value > 0) ? limit.Value : 10;
        var noticias = await service.GetNoticiasAsync(finalLimit, cancellationToken);
        return Results.Ok(noticias);
    }
}
