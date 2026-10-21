namespace Palantica.Api.Features.Palas;

/// <summary>
/// Parámetros de consulta y filtrado para el catálogo de palas.
/// </summary>
public sealed record PalaFilterParams(
    string? Search = null,
    string? Marca = null,
    string? Forma = null,
    string? Estacion = null,
    float? DurezaMin = null,
    float? DurezaMax = null,
    decimal? PrecioMin = null,
    decimal? PrecioMax = null,
    string? OrderBy = "puntuacion", // puntuacion, precio_asc, precio_desc, novedad, dureza
    int Page = 1,
    int PageSize = 10
);

/// <summary>
/// Contrato resumido de pala para el listado del catálogo.
/// </summary>
public sealed record PalaListResponse(
    int Id,
    int MarcaId,
    string MarcaNombre,
    string? MarcaLogoUrl,
    string Modelo,
    string Forma,
    int BalanceMm,
    int PesoMin,
    int PesoMax,
    string MaterialNucleo,
    string MaterialCaras,
    string SuperficieRugosa,
    string EstacionOptima,
    decimal PrecioReferencia,
    string MonedaPrecio,
    string FuentePrecio,
    float PuntuacionGeneral,
    float DurezaPromedio,
    float PotenciaPromedio,
    float ControlPromedio,
    string? ImagenUrl,
    int AnoLanzamiento,
    string? JugadorPro,
    int TotalResenas,
    int TotalVotos,
    string? Slug = null
);

/// <summary>
/// Contrato completo de la Ficha Sagrada de la Pala con todos los niveles técnicos.
/// </summary>
public sealed record PalaDetalleResponse(
    int Id,
    int MarcaId,
    string MarcaNombre,
    string MarcaPais,
    string? MarcaSitioWeb,
    string? MarcaLogoUrl,
    string Modelo,
    string Forma,
    int BalanceMm,
    int PesoMin,
    int PesoMax,
    string MaterialNucleo,
    string MaterialCaras,
    string SuperficieRugosa,
    string EstacionOptima,
    decimal PrecioReferencia,
    string MonedaPrecio,
    string FuentePrecio,
    float PuntuacionGeneral,
    float DurezaPromedio,
    float PotenciaPromedio,
    float ControlPromedio,
    float SalidaBolaPromedio,
    float ManiobrabilidadPromedio,
    float PuntoDulcePromedio,
    float ConfortPromedio,
    string? ImagenUrl,
    int AnoLanzamiento,
    string? JugadorPro,
    string? Descripcion,
    int TotalResenas,
    int TotalVotos,
    IReadOnlyList<PalaSimilarResponse>? PalasSimilares = null,
    string? Slug = null
);

/// <summary>
/// Contrato de pala similar calculada mediante similitud vectorial.
/// </summary>
public sealed record PalaSimilarResponse(
    int Id,
    int MarcaId,
    string MarcaNombre,
    string Modelo,
    string Forma,
    string MaterialCaras,
    string MaterialNucleo,
    string? ImagenUrl,
    decimal PrecioReferencia,
    string MonedaPrecio,
    string FuentePrecio,
    float PuntuacionGeneral,
    float DurezaPromedio,
    double SimilitudPorcentaje,
    double DistanciaVectorial
);
