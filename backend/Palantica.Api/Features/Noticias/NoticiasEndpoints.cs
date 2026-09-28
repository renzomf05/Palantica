using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Palantica.Api.Features.Noticias;

/// <summary>
/// Endpoints de Minimal API para noticias del pádel integrados con NewsData.io y caché HTTP.
/// </summary>
public static class NoticiasEndpoints
{
    /// <summary>
    /// Mapea los endpoints de noticias.
    /// </summary>
    public static IEndpointRouteBuilder MapNoticiasEndpoints(this IEndpointRouteBuilder app)
    {
        // Endpoint canónico solicitado: /api/news
        app.MapGet("/api/news", ObtenerNoticiasHandler)
            .WithTags("Noticias")
            .WithName("ObtenerNoticiasNews")
            .WithSummary("Obtiene las últimas noticias normalizadas de pádel desde NewsData.io con caché de 30 min");

        // Alias legado: /api/v1/noticias
        app.MapGet("/api/v1/noticias", ObtenerNoticiasHandler)
            .WithTags("Noticias")
            .WithName("ObtenerNoticiasV1")
            .WithSummary("Alias de /api/news para compatibilidad");

        // Telemetría oficial FIP (Rankings y Torneos) desde PadelAPI
        app.MapGet("/api/padel/telemetry", async (
            HttpContext context,
            [FromServices] NoticiasService service,
            CancellationToken cancellationToken) =>
        {
            context.Response.Headers.CacheControl = "public, s-maxage=3600, stale-while-revalidate=600";
            var telemetry = await service.GetPadelTelemetryAsync(cancellationToken);
            return Results.Ok(telemetry);
        })
        .WithTags("Noticias")
        .WithName("ObtenerPadelTelemetry")
        .WithSummary("Retorna el resumen en vivo de rankings oficiales FIP y próximos torneos");

        return app;
    }

    private static async Task<IResult> ObtenerNoticiasHandler(
        HttpContext context,
        [FromServices] NoticiasService service,
        CancellationToken cancellationToken)
    {
        // Cabecera Cache-Control solicitada: s-maxage=1800 y stale-while-revalidate
        context.Response.Headers.CacheControl = "public, s-maxage=1800, stale-while-revalidate=300";

        var noticias = await service.GetNoticiasAsync(cancellationToken);
        return Results.Ok(noticias);
    }
}
