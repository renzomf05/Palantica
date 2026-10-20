using System.Text.Json.Serialization;

namespace Palantica.Api.Features.Padelful;

/// <summary>
/// Calificaciones y métricas técnicas sensoriales de una pala en Padelful.
/// </summary>
public sealed record PadelfulRatings(
    [property: JsonPropertyName("power")] float? Power,
    [property: JsonPropertyName("control")] float? Control,
    [property: JsonPropertyName("rebound")] float? Rebound, // Salida de bola
    [property: JsonPropertyName("maneuverability")] float? Maneuverability,
    [property: JsonPropertyName("sweetSpot")] float? SweetSpot
);

/// <summary>
/// Contrato de un ítem de pala devuelto por Padelful API o catálogo interno.
/// </summary>
public sealed record PadelfulRacketItem(
    [property: JsonPropertyName("slug")] string Slug,
    [property: JsonPropertyName("title")] string Title,
    [property: JsonPropertyName("brand")] string Brand,
    [property: JsonPropertyName("rating")] object? Rating, // Puede ser float, double o string
    [property: JsonPropertyName("shape")] string? Shape, // Round, Teardrop, Diamond
    [property: JsonPropertyName("season")] int? Season,
    [property: JsonPropertyName("ratings")] PadelfulRatings? Ratings,
    [property: JsonPropertyName("hardness")] string? Hardness, // Soft, Medium, Hard
    [property: JsonPropertyName("balance")] string? Balance, // Low, Medium, High
    [property: JsonPropertyName("weight")] string? Weight,
    [property: JsonPropertyName("core")] string? Core,
    [property: JsonPropertyName("faces")] string? Faces,
    [property: JsonPropertyName("frame")] string? Frame,
    [property: JsonPropertyName("surface")] string? Surface,
    [property: JsonPropertyName("player")] string? Player,
    [property: JsonPropertyName("price")] decimal? Price,
    [property: JsonPropertyName("currency")] string? Currency,
    [property: JsonPropertyName("image")] string? Image,
    [property: JsonPropertyName("description")] string? Description,
    [property: JsonPropertyName("url")] string? Url
);

public sealed record PadelfulPagination(
    [property: JsonPropertyName("total")] int Total,
    [property: JsonPropertyName("limit")] int Limit,
    [property: JsonPropertyName("offset")] int Offset,
    [property: JsonPropertyName("hasMore")] bool HasMore
);

public sealed record PadelfulDataWrapper(
    [property: JsonPropertyName("rackets")] IReadOnlyList<PadelfulRacketItem>? Rackets,
    [property: JsonPropertyName("pagination")] PadelfulPagination? Pagination
);

public sealed record PadelfulApiResponse(
    [property: JsonPropertyName("data")] PadelfulDataWrapper? Data,
    [property: JsonPropertyName("rackets")] IReadOnlyList<PadelfulRacketItem>? DirectRackets
);

/// <summary>
/// Vista previa adaptada y enriquecida para el ecosistema de Palantica.
/// </summary>
public sealed record PadelfulPalaPreview(
    string Slug,
    string Marca,
    string Modelo,
    string Forma,
    int BalanceMm,
    string BalanceNivel,
    string MaterialNucleo,
    string MaterialCaras,
    string DurezaNivel,
    float DurezaScore,
    float PotenciaScore,
    float ControlScore,
    float SalidaBolaScore,
    float ManiobrabilidadScore,
    float PuntoDulceScore,
    float PuntuacionGeneral,
    decimal Precio,
    string Moneda,
    string? ImagenUrl,
    string? Descripcion,
    string? JugadorPro,
    int AnoLanzamiento,
    string FuenteOriginal
);

/// <summary>
/// Parámetros de consulta y filtrado para la API de Padelful.
/// </summary>
public sealed record PadelfulFilterRequest(
    string? Query = null,
    string? Brand = null,
    string? Shape = null,
    float? MinRating = null,
    int? Limit = 20,
    int? Offset = 0
);

/// <summary>
/// Petición de sincronización de catálogo desde Padelful.
/// </summary>
public sealed record PadelfulSyncRequest(
    string? Brand = null,
    string? Shape = null,
    int? MaxItems = 20,
    bool OverwriteExisting = false
);

/// <summary>
/// Resultado de la sincronización de catálogo con Padelful.
/// </summary>
public sealed record PadelfulSyncResult(
    int TotalEncontrados,
    int TotalImportados,
    int TotalOmitidos,
    IReadOnlyList<PadelfulPalaPreview> PalasSincronizadas,
    string Mensaje
);
