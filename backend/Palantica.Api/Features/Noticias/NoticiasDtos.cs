using System.Text.Json;
using System.Text.Json.Serialization;

namespace Palantica.Api.Features.Noticias;

/// <summary>
/// Contrato DTO normalizado para una noticia de pádel (según especificación Palantica / NewsData.io).
/// Formato: { id, titulo, bajada, imagen, link, fuente, fecha, categoria, seccion, destacada }
/// </summary>
public sealed record NoticiaNormalizadaDto(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("titulo")] string Titulo,
    [property: JsonPropertyName("bajada")] string Bajada,
    [property: JsonPropertyName("imagen")] string? Imagen,
    [property: JsonPropertyName("link")] string Link,
    [property: JsonPropertyName("fuente")] string Fuente,
    [property: JsonPropertyName("fecha")] string Fecha,
    [property: JsonPropertyName("categoria")] string Categoria,
    [property: JsonPropertyName("seccion")] string Seccion,
    [property: JsonPropertyName("destacada")] bool Destacada = false
);

/// <summary>
/// Contrato DTO legado para compatibilidad con endpoints anteriores.
/// </summary>
public sealed record NoticiaResponse(
    string Id,
    string Titulo,
    string Resumen,
    string? Contenido,
    string Categoria,
    string Fuente,
    string? UrlFuente,
    string? ImagenUrl,
    DateTimeOffset FechaPublicacion,
    int TiempoLecturaMinutos,
    IReadOnlyList<string> Tags
);

/// <summary>
/// Modelo deserializado de respuesta de NewsData.io
/// </summary>
public sealed class NewsDataApiResponse
{
    [JsonPropertyName("status")]
    public string? Status { get; set; }

    [JsonPropertyName("totalResults")]
    public int? TotalResults { get; set; }

    [JsonPropertyName("results")]
    public JsonElement Results { get; set; }

    [JsonPropertyName("nextPage")]
    public string? NextPage { get; set; }
}

/// <summary>
/// Modelo de artículo devuelto por la API de NewsData.io
/// </summary>
public sealed class NewsDataArticleDto
{
    [JsonPropertyName("article_id")]
    public string? Article_id { get; set; }

    [JsonPropertyName("title")]
    public string? Title { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("image_url")]
    public string? Image_url { get; set; }

    [JsonPropertyName("link")]
    public string? Link { get; set; }

    [JsonPropertyName("source_name")]
    public string? Source_name { get; set; }

    [JsonPropertyName("source_id")]
    public string? Source_id { get; set; }

    [JsonPropertyName("pubDate")]
    public string? PubDate { get; set; }

    [JsonPropertyName("category")]
    public JsonElement Category { get; set; }
}

/// <summary>
/// Contratos DTO para telemetría oficial de rankings y torneos FIP desde PadelAPI (padelapi.org).
/// </summary>
public sealed record PadelTopPlayerDto(
    [property: JsonPropertyName("ranking")] int Ranking,
    [property: JsonPropertyName("name")] string Name,
    [property: JsonPropertyName("country")] string Country,
    [property: JsonPropertyName("points")] int Points
);

public sealed record UpcomingTournamentDto(
    [property: JsonPropertyName("name")] string Name,
    [property: JsonPropertyName("location")] string Location,
    [property: JsonPropertyName("startDate")] string StartDate,
    [property: JsonPropertyName("endDate")] string? EndDate,
    [property: JsonPropertyName("level")] string Level
);

public sealed record PadelRankingsSummaryDto(
    [property: JsonPropertyName("date")] string Date,
    [property: JsonPropertyName("topPlayers")] IReadOnlyList<PadelTopPlayerDto> TopPlayers
);

public sealed record PadelTelemetryDto(
    [property: JsonPropertyName("rankings")] PadelRankingsSummaryDto Rankings,
    [property: JsonPropertyName("nextTournament")] UpcomingTournamentDto? NextTournament,
    [property: JsonPropertyName("totalTournaments")] int TotalTournaments
);

