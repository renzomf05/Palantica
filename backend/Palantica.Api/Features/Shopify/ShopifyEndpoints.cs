using Microsoft.AspNetCore.Mvc;

namespace Palantica.Api.Features.Shopify;

/// <summary>
/// Endpoints de Minimal API para el integrador y sincronizador de tiendas Shopify de pádel.
/// </summary>
public static class ShopifyEndpoints
{
    public static IEndpointRouteBuilder MapShopifyEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/shopify")
            .WithTags("Shopify Integrator");

        group.MapGet("/preview", previewShopify)
            .WithName("PreviewShopify")
            .WithSummary("Previsualiza productos de una tienda Shopify de pádel a partir de su URL pública");

        group.MapPost("/sync", syncShopify)
            .WithName("SyncShopify")
            .WithSummary("Sincroniza e importa palas desde una tienda Shopify al catálogo de Palantica");

        return app;
    }

    private static async Task<IResult> previewShopify(
        [FromQuery] string? storeUrl,
        [FromQuery] int? maxItems,
        [FromServices] ShopifyService service,
        CancellationToken cancellationToken)
    {
        var url = string.IsNullOrWhiteSpace(storeUrl) ? "https://tiendapadelpoint.com" : storeUrl.Trim();
        var limit = (maxItems.HasValue && maxItems.Value > 0) ? maxItems.Value : 20;

        var previews = await service.PreviewShopifyStoreAsync(url, limit, cancellationToken);
        return Results.Ok(previews);
    }

    private static async Task<IResult> syncShopify(
        [FromBody] ShopifySyncRequest request,
        [FromServices] ShopifyService service,
        CancellationToken cancellationToken)
    {
        if (request is null || string.IsNullOrWhiteSpace(request.StoreUrl))
        {
            return Results.BadRequest(new { error = "Debe proporcionar una URL válida de tienda Shopify (ej: https://tiendapadelpoint.com)." });
        }

        var result = await service.SyncShopifyStoreAsync(request, cancellationToken);
        return Results.Ok(result);
    }
}
