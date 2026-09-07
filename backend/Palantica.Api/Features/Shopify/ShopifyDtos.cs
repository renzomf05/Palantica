using System.Text.Json.Serialization;

namespace Palantica.Api.Features.Shopify;

/// <summary>
/// Contrato de respuesta de Shopify Storefront / Products.json.
/// </summary>
public sealed record ShopifyProductsRootResponse(
    [property: JsonPropertyName("products")] IReadOnlyList<ShopifyProductItem> Products
);

public sealed record ShopifyProductItem(
    [property: JsonPropertyName("id")] long Id,
    [property: JsonPropertyName("title")] string Title,
    [property: JsonPropertyName("body_html")] string? BodyHtml,
    [property: JsonPropertyName("vendor")] string Vendor,
    [property: JsonPropertyName("product_type")] string? ProductType,
    [property: JsonPropertyName("handle")] string Handle,
    [property: JsonPropertyName("tags")] object? Tags, // Puede venir como string o array
    [property: JsonPropertyName("variants")] IReadOnlyList<ShopifyVariantItem>? Variants,
    [property: JsonPropertyName("images")] IReadOnlyList<ShopifyImageItem>? Images
);

public sealed record ShopifyVariantItem(
    [property: JsonPropertyName("id")] long Id,
    [property: JsonPropertyName("title")] string Title,
    [property: JsonPropertyName("price")] string Price,
    [property: JsonPropertyName("compare_at_price")] string? CompareAtPrice,
    [property: JsonPropertyName("sku")] string? Sku,
    [property: JsonPropertyName("available")] bool? Available
);

public sealed record ShopifyImageItem(
    [property: JsonPropertyName("id")] long Id,
    [property: JsonPropertyName("src")] string Src,
    [property: JsonPropertyName("width")] int? Width,
    [property: JsonPropertyName("height")] int? Height
);

/// <summary>
/// Respuesta normalizada de producto de pala extraída de Shopify.
/// </summary>
public sealed record ShopifyPalaPreview(
    string Marca,
    string Modelo,
    string Forma,
    int BalanceMm,
    string MaterialNucleo,
    string MaterialCaras,
    decimal Precio,
    string Moneda,
    string? ImagenUrl,
    string? Descripcion,
    string? JugadorPro,
    string FuenteTienda
);

/// <summary>
/// Solicitud de sincronización desde una tienda Shopify de pádel.
/// </summary>
public sealed record ShopifySyncRequest(
    string StoreUrl,
    int? MaxItems = 20,
    bool OverwriteExisting = false
);

/// <summary>
/// Resultado del proceso de sincronización.
/// </summary>
public sealed record ShopifySyncResult(
    string StoreUrl,
    int TotalEncontrados,
    int TotalImportados,
    int TotalOmitidos,
    IReadOnlyList<ShopifyPalaPreview> PalasSincronizadas
);
