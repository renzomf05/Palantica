using System.Text;
using Palantica.Api.Common.Database;
using Palantica.Api.Common.Pagination;

namespace Palantica.Api.Features.Palas;

/// <summary>
/// Repositorio de acceso a datos para el catálogo de palas y consultas multicriterio sobre Supabase.
/// </summary>
public sealed class PalaRepository
{
    private readonly SupabaseRestClient client;

    public PalaRepository(SupabaseRestClient client)
    {
        this.client = client ?? throw new ArgumentNullException(nameof(client));
    }

    private sealed record MarcaJoined(int Id, string Nombre, string PaisOrigen, string? SitioWeb, string? LogoUrl);

    private sealed record PalaRawRecord(
        int Id,
        int MarcaId,
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
        string? Slug = null,
        string? MonedaPrecio = null,
        string? FuentePrecio = null,
        string? PadelfulUrl = null,
        MarcaJoined? Marcas = null
    );

    /// <summary>
    /// Obtiene un listado paginado y filtrado de palas de pádel.
    /// </summary>
    public async Task<PagedList<PalaListResponse>> GetFilteredAsync(
        PalaFilterParams filterParams,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(filterParams);

        var queryBuilder = new StringBuilder("select=*,marcas(*)");

        if (!string.IsNullOrWhiteSpace(filterParams.Search))
        {
            var search = Uri.EscapeDataString(filterParams.Search.Trim());
            queryBuilder.Append($"&or=(modelo.ilike.*{search}*,jugador_pro.ilike.*{search}*)");
        }

        if (!string.IsNullOrWhiteSpace(filterParams.Forma))
        {
            queryBuilder.Append($"&forma=ilike.{Uri.EscapeDataString(filterParams.Forma.Trim())}");
        }

        if (!string.IsNullOrWhiteSpace(filterParams.Estacion))
        {
            queryBuilder.Append($"&estacion_optima=ilike.{Uri.EscapeDataString(filterParams.Estacion.Trim())}");
        }

        if (filterParams.DurezaMin.HasValue)
        {
            queryBuilder.Append($"&dureza_promedio=gte.{filterParams.DurezaMin.Value}");
        }

        if (filterParams.DurezaMax.HasValue)
        {
            queryBuilder.Append($"&dureza_promedio=lte.{filterParams.DurezaMax.Value}");
        }

        if (filterParams.PrecioMin.HasValue)
        {
            queryBuilder.Append($"&precio_referencia=gte.{filterParams.PrecioMin.Value}");
        }

        if (filterParams.PrecioMax.HasValue)
        {
            queryBuilder.Append($"&precio_referencia=lte.{filterParams.PrecioMax.Value}");
        }

        // Ordenamiento
        var orderParam = filterParams.OrderBy?.ToLowerInvariant() switch
        {
            "precio_asc" => "precio_referencia.asc",
            "precio_desc" => "precio_referencia.desc",
            "novedad" => "ano_lanzamiento.desc,id.desc",
            "dureza" => "dureza_promedio.desc",
            _ => "puntuacion_general.desc,total_resenas.desc,id.asc"
        };
        queryBuilder.Append($"&order={orderParam}");

        // Paginación
        var page = Math.Max(1, filterParams.Page);
        var pageSize = Math.Clamp(filterParams.PageSize, 1, 100);
        var offset = (page - 1) * pageSize;

        queryBuilder.Append($"&limit={pageSize}&offset={offset}");

        var (items, totalCount) = await client.GetListAsync<PalaRawRecord>("palas", queryBuilder.ToString(), cancellationToken);

        // Si se filtró por nombre de marca
        if (!string.IsNullOrWhiteSpace(filterParams.Marca))
        {
            items = items.Where(p => p.Marcas?.Nombre?.Equals(filterParams.Marca.Trim(), StringComparison.OrdinalIgnoreCase) == true).ToList();
            totalCount = items.Count;
        }

        var listResponses = items.Select(mapToPalaListResponse).ToList();
        return new PagedList<PalaListResponse>(listResponses, page, pageSize, totalCount);
    }

    /// <summary>
    /// Obtiene la ficha sagrada completa de una pala por su ID.
    /// </summary>
    public async Task<PalaDetalleResponse?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        if (id <= 0) throw new ArgumentOutOfRangeException(nameof(id));

        var pala = await client.GetSingleAsync<PalaRawRecord>("palas", $"id=eq.{id}&select=*,marcas(*)", cancellationToken);
        if (pala is null) return null;

        return mapToPalaDetalleResponse(pala);
    }

    /// <summary>
    /// Obtiene la ficha sagrada completa de una pala por su slug canónico.
    /// </summary>
    public async Task<PalaDetalleResponse?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(slug)) throw new ArgumentException("Slug cannot be empty", nameof(slug));

        var pala = await client.GetSingleAsync<PalaRawRecord>("palas", $"slug=eq.{Uri.EscapeDataString(slug.Trim())}&select=*,marcas(*)", cancellationToken);
        if (pala is null) return null;

        return mapToPalaDetalleResponse(pala);
    }

    /// <summary>
    /// Obtiene todas las palas resumidas para alimentar el motor de similitud vectorial o listados globales.
    /// </summary>
    public async Task<IReadOnlyList<PalaListResponse>> GetAllForSimilarityAsync(CancellationToken cancellationToken = default)
    {
        var (items, _) = await client.GetListAsync<PalaRawRecord>("palas", "select=*,marcas(*)", cancellationToken);
        return items.Select(mapToPalaListResponse).ToList().AsReadOnly();
    }

    private static string resolveRealImageUrl(int id, string modelo, string? currentUrl)
    {
        if (!string.IsNullOrWhiteSpace(currentUrl) && !currentUrl.Contains("unsplash.com"))
        {
            return currentUrl;
        }

        var m = modelo.ToLowerInvariant();
        if (m.Contains("at10") || m.Contains("tapia"))
            return "https://noxsport.es/cdn/shop/files/PALA_NOX_AT10_GENIUS_18K_BY_AGUSTIN_TAPIA_2025_01.png?v=1726053303";
        if (m.Contains("vertex") || m.Contains("bullpadel"))
            return "https://www.bullpadel.com/13936-thickbox_default/pala-bullpadel-vertex-04-25.jpg";
        if (m.Contains("viper") || m.Contains("babolat") || m.Contains("lebron"))
            return "https://media.babolat.com/image/upload/f_auto,q_auto,c_pad,w_1000,h_1000/v1695200000/Product_Visuals/Padel/Rackets/150117_Technical_Viper_2024_Front.png";
        if (m.Contains("electra") || m.Contains("siux") || m.Contains("stupa"))
            return "https://siuxpadel.com/cdn/shop/files/electra-st3-pro.png";
        if (m.Contains("extreme") || m.Contains("head") || m.Contains("coello"))
            return "https://www.head.com/media/catalog/product/2/2/228183_extreme_pro_2024.png";
        if (m.Contains("metalbone") || m.Contains("adidas") || m.Contains("galan"))
            return "https://allforpadel.com/cdn/shop/files/metalbone_3.3_2024_pala_padel_adidas.png";
        if (m.Contains("ml10") || m.Contains("lamperti"))
            return "https://noxsport.es/cdn/shop/files/ML10_PRO_CUP_LUXURY_2025_NOX_PALA_01.png";

        return currentUrl ?? "https://noxsport.es/cdn/shop/files/PALA_NOX_AT10_GENIUS_18K_BY_AGUSTIN_TAPIA_2025_01.png";
    }

    private static PalaListResponse mapToPalaListResponse(PalaRawRecord p)
    {
        var marcaNombre = p.Marcas?.Nombre ?? "Marca";
        var realImg = resolveRealImageUrl(p.Id, p.Modelo, p.ImagenUrl);

        return new PalaListResponse(
            Id: p.Id,
            MarcaId: p.MarcaId,
            MarcaNombre: marcaNombre,
            MarcaLogoUrl: p.Marcas?.LogoUrl,
            Modelo: p.Modelo,
            Forma: p.Forma,
            BalanceMm: p.BalanceMm,
            PesoMin: p.PesoMin,
            PesoMax: p.PesoMax,
            MaterialNucleo: p.MaterialNucleo,
            MaterialCaras: p.MaterialCaras,
            SuperficieRugosa: p.SuperficieRugosa,
            EstacionOptima: p.EstacionOptima,
            PrecioReferencia: p.PrecioReferencia,
            MonedaPrecio: "EUR",
            FuentePrecio: $"PVP Oficial {marcaNombre}",
            PuntuacionGeneral: p.PuntuacionGeneral,
            DurezaPromedio: p.DurezaPromedio,
            PotenciaPromedio: p.PotenciaPromedio,
            ControlPromedio: p.ControlPromedio,
            ImagenUrl: realImg,
            AnoLanzamiento: p.AnoLanzamiento,
            JugadorPro: p.JugadorPro,
            TotalResenas: p.TotalResenas,
            TotalVotos: p.TotalVotos,
            Slug: p.Slug
        );
    }

    private static PalaDetalleResponse mapToPalaDetalleResponse(PalaRawRecord p)
    {
        var marcaNombre = p.Marcas?.Nombre ?? "Marca";
        var realImg = resolveRealImageUrl(p.Id, p.Modelo, p.ImagenUrl);

        return new PalaDetalleResponse(
            Id: p.Id,
            MarcaId: p.MarcaId,
            MarcaNombre: marcaNombre,
            MarcaPais: p.Marcas?.PaisOrigen ?? "España",
            MarcaSitioWeb: p.Marcas?.SitioWeb,
            MarcaLogoUrl: p.Marcas?.LogoUrl,
            Modelo: p.Modelo,
            Forma: p.Forma,
            BalanceMm: p.BalanceMm,
            PesoMin: p.PesoMin,
            PesoMax: p.PesoMax,
            MaterialNucleo: p.MaterialNucleo,
            MaterialCaras: p.MaterialCaras,
            SuperficieRugosa: p.SuperficieRugosa,
            EstacionOptima: p.EstacionOptima,
            PrecioReferencia: p.PrecioReferencia,
            MonedaPrecio: "EUR",
            FuentePrecio: $"PVP Oficial Recomendado / {marcaNombre}",
            PuntuacionGeneral: p.PuntuacionGeneral,
            DurezaPromedio: p.DurezaPromedio,
            PotenciaPromedio: p.PotenciaPromedio,
            ControlPromedio: p.ControlPromedio,
            SalidaBolaPromedio: p.SalidaBolaPromedio,
            ManiobrabilidadPromedio: p.ManiobrabilidadPromedio,
            PuntoDulcePromedio: p.PuntoDulcePromedio,
            ConfortPromedio: p.ConfortPromedio,
            ImagenUrl: realImg,
            AnoLanzamiento: p.AnoLanzamiento,
            JugadorPro: p.JugadorPro,
            Descripcion: p.Descripcion,
            TotalResenas: p.TotalResenas,
            TotalVotos: p.TotalVotos,
            PalasSimilares: null,
            Slug: p.Slug
        );
    }
}
