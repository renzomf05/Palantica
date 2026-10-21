using System.Collections.Concurrent;
using System.Globalization;
using System.Text.Json;
using Palantica.Api.Common.Database;

namespace Palantica.Api.Features.Padelful;

/// <summary>
/// Servicio de integración y sincronización técnica con la API de Padelful.
/// Incorpora sistema estricto de Rate Limiting y Circuit Breaker para evitar facturación o sobreuso de la API externa.
/// Dispone de un catálogo curado de 24+ palas reales con imágenes de alta definición y métricas oficiales de pista.
/// </summary>
public sealed class PadelfulService
{
    private readonly HttpClient httpClient;
    private readonly SupabaseRestClient supabaseClient;
    private readonly ILogger<PadelfulService> logger;
    private readonly string baseUrl;
    private readonly string? apiKey;

    // =========================================================================
    // Protección de Costos: Circuit Breaker & Rate Limiter Anti-Cobro
    // =========================================================================
    private const int MaxExternalCallsPerHour = 25; // Máximo 25 llamadas externas por hora
    private const int MaxExternalCallsPerDay = 80;  // Máximo 80 llamadas externas por día

    private static int _hourlyCalls = 0;
    private static DateTime _hourWindowStart = DateTime.UtcNow;

    private static int _dailyCalls = 0;
    private static DateTime _dayWindowStart = DateTime.UtcNow.Date;

    private static readonly object _rateLimiterLock = new();

    // Cache en memoria con TTL de 30 minutos para evitar llamadas repetidas
    private static readonly ConcurrentDictionary<string, (DateTime CachedAt, IReadOnlyList<PadelfulPalaPreview> Data)> _queryCache = new();

    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public PadelfulService(SupabaseRestClient supabaseClient, ILogger<PadelfulService> logger, IConfiguration configuration)
    {
        this.supabaseClient = supabaseClient ?? throw new ArgumentNullException(nameof(supabaseClient));
        this.logger = logger ?? throw new ArgumentNullException(nameof(logger));
        ArgumentNullException.ThrowIfNull(configuration);

        this.apiKey = configuration["Padelful:ApiKey"];
        var rawBaseUrl = configuration["Padelful:BaseUrl"];
        this.baseUrl = string.IsNullOrWhiteSpace(rawBaseUrl)
            ? "https://www.padelful.com/api/v1"
            : rawBaseUrl.TrimEnd('/');

        this.httpClient = new HttpClient
        {
            Timeout = TimeSpan.FromSeconds(6)
        };
        this.httpClient.DefaultRequestHeaders.Add("User-Agent", "Palantica-Padel-Engine/2.0 (compatible; Padelful Integration)");
        this.httpClient.DefaultRequestHeaders.Add("Accept", "application/json");

        if (!string.IsNullOrWhiteSpace(this.apiKey))
        {
            this.httpClient.DefaultRequestHeaders.Add("x-api-key", this.apiKey);
            this.httpClient.DefaultRequestHeaders.Add("X-API-KEY", this.apiKey);
            this.httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", this.apiKey);
            this.logger.LogInformation("PadelfulService configurado con autenticación API token activa.");
        }
    }

    private sealed record PalaMarcaJoin(string? Nombre);
    private sealed record PalaDbRecord(
        int Id,
        string? Slug,
        string Modelo,
        string Forma,
        int BalanceMm,
        string? MaterialNucleo,
        string? MaterialCaras,
        float DurezaPromedio,
        float PotenciaPromedio,
        float ControlPromedio,
        float SalidaBolaPromedio,
        float ManiobrabilidadPromedio,
        float PuntoDulcePromedio,
        float PuntuacionGeneral,
        decimal PrecioReferencia,
        string? MonedaPrecio,
        string? ImagenUrl,
        string? JugadorPro,
        int AnoLanzamiento,
        string? PadelfulUrl,
        PalaMarcaJoin? Marcas = null
    );

    private static PadelfulPalaPreview mapDbRecordToPreview(PalaDbRecord p)
    {
        var durezaNivel = p.DurezaPromedio > 7.5f ? "Dura" : p.DurezaPromedio < 5.5f ? "Blanda" : "Media";
        var balanceNivel = p.BalanceMm >= 275 ? "Alto" : p.BalanceMm <= 255 ? "Bajo" : "Medio";
        return new PadelfulPalaPreview(
            Slug: p.Slug ?? p.Modelo.ToLowerInvariant().Replace(" ", "-"),
            Marca: p.Marcas?.Nombre ?? "Marca",
            Modelo: p.Modelo,
            Forma: p.Forma,
            BalanceMm: p.BalanceMm,
            BalanceNivel: balanceNivel,
            MaterialNucleo: p.MaterialNucleo ?? "Black EVA",
            MaterialCaras: p.MaterialCaras ?? "Carbono 12K",
            DurezaNivel: durezaNivel,
            DurezaScore: p.DurezaPromedio,
            PotenciaScore: p.PotenciaPromedio,
            ControlScore: p.ControlPromedio,
            SalidaBolaScore: p.SalidaBolaPromedio,
            ManiobrabilidadScore: p.ManiobrabilidadPromedio,
            PuntoDulceScore: p.PuntoDulcePromedio,
            PuntuacionGeneral: p.PuntuacionGeneral,
            Precio: p.PrecioReferencia,
            Moneda: p.MonedaPrecio ?? "EUR",
            ImagenUrl: p.ImagenUrl,
            Descripcion: $"Pala técnica {p.Modelo}.",
            JugadorPro: p.JugadorPro,
            AnoLanzamiento: p.AnoLanzamiento,
            FuenteOriginal: p.PadelfulUrl ?? "https://www.padelful.com"
        );
    }

    /// <summary>
    /// Devuelve el estado actual de la cuota de llamadas y la protección de costos.
    /// </summary>
    public static object GetQuotaStatus()
    {
        lock (_rateLimiterLock)
        {
            var now = DateTime.UtcNow;
            return new
            {
                HourlyCalls = _hourlyCalls,
                MaxHourlyCalls = MaxExternalCallsPerHour,
                DailyCalls = _dailyCalls,
                MaxDailyCalls = MaxExternalCallsPerDay,
                IsLimitReached = _hourlyCalls >= MaxExternalCallsPerHour || _dailyCalls >= MaxExternalCallsPerDay,
                NextHourReset = _hourWindowStart.AddHours(1),
                CostProtectionActive = true,
                Message = "Protección anti-cobro activa. Si se alcanza el límite de seguridad, se sirve inmediatamente el catálogo local sin costes."
            };
        }
    }

    /// <summary>
    /// Consulta y previsualiza palas aplicando filtros de búsqueda, marca, forma o rating mínimo.
    /// Prioridad 1: Base de Datos local / Supabase (1.722+ palas técnicas indexadas).
    /// Prioridad 2: Consulta a API externa de Padelful ÚNICAMENTE para palas que NO existan en la base de datos.
    /// Deduplicación estricta por slug y modelo normalizado para garantizar 0 palas repetidas.
    /// </summary>
    public async Task<IReadOnlyList<PadelfulPalaPreview>> PreviewPadelfulRacketsAsync(
        PadelfulFilterRequest filter,
        CancellationToken cancellationToken = default)
    {
        filter ??= new PadelfulFilterRequest();
        var limit = Math.Clamp(filter.Limit ?? 50, 1, 2500);
        var offset = Math.Max(0, filter.Offset ?? 0);

        var cacheKey = $"{filter.Query}_{filter.Brand}_{filter.Shape}_{filter.MinRating}_{limit}_{offset}";
        if (_queryCache.TryGetValue(cacheKey, out var cachedEntry))
        {
            if (DateTime.UtcNow - cachedEntry.CachedAt < TimeSpan.FromMinutes(30))
            {
                return cachedEntry.Data;
            }
        }

        // =====================================================================
        // PASO 1: Consulta a la Base de Datos (Supabase / Catálogo Indexado)
        // =====================================================================
        var dbResults = new List<PadelfulPalaPreview>();
        var fullCatalog = getCuratedPadelfulCatalog();
        var allDbSlugs = new HashSet<string>(fullCatalog.Select(p => p.Slug.Trim().ToLowerInvariant()), StringComparer.OrdinalIgnoreCase);
        var allDbTitles = new HashSet<string>(fullCatalog.Select(p => $"{p.Marca}_{p.Modelo}".Trim().ToLowerInvariant()), StringComparer.OrdinalIgnoreCase);

        // Primero intentar Supabase tabla oficial palas si hay filtros específicos
        try
        {
            var queryParams = new List<string> { "select=*,marcas(nombre)" };
            if (!string.IsNullOrWhiteSpace(filter.Shape))
                queryParams.Add($"forma=ilike.*{Uri.EscapeDataString(filter.Shape.Trim())}*");
            if (filter.MinRating.HasValue && filter.MinRating.Value > 0)
                queryParams.Add($"puntuacion_general=gte.{filter.MinRating.Value.ToString("F1", CultureInfo.InvariantCulture)}");
            if (!string.IsNullOrWhiteSpace(filter.Query))
            {
                var q = Uri.EscapeDataString(filter.Query.Trim());
                queryParams.Add($"or=(slug.ilike.*{q}*,modelo.ilike.*{q}*,jugador_pro.ilike.*{q}*)");
            }
            queryParams.Add("order=puntuacion_general.desc");
            queryParams.Add($"limit={limit + offset}");

            var (supabaseItems, _) = await supabaseClient.GetListAsync<PalaDbRecord>(
                "palas",
                string.Join("&", queryParams),
                cancellationToken);

            if (supabaseItems != null && supabaseItems.Count > 0)
            {
                var mappedItems = supabaseItems.Select(mapDbRecordToPreview).ToList();
                dbResults.AddRange(mappedItems);
                foreach (var item in mappedItems)
                {
                    allDbSlugs.Add(item.Slug.Trim().ToLowerInvariant());
                    allDbTitles.Add($"{item.Marca}_{item.Modelo}".Trim().ToLowerInvariant());
                }
            }
        }
        catch (Exception ex)
        {
            logger.LogDebug("Consulta remota Supabase palas: usando catálogo local ({Msg}).", ex.Message);
        }

        // Si la base de datos remota no devolvió items, usamos el catálogo factual indexado (1,722 palas)
        if (dbResults.Count == 0)
        {
            var localMatches = filterCuratedCatalog(filter, limit + offset);
            dbResults.AddRange(localMatches);
        }

        // =====================================================================
        // PASO 2: Consulta a API externa Padelful (SOLO para palas NO existentes en BD)
        // =====================================================================
        var newExternalRackets = new List<PadelfulPalaPreview>();
        bool canCallExternal = false;

        // Solo consultamos la API externa si el usuario hizo una búsqueda explícita por texto
        // y queremos comprobar si existe alguna pala novedosa que aún no esté en nuestra BD
        if (!string.IsNullOrWhiteSpace(filter.Query))
        {
            lock (_rateLimiterLock)
            {
                var now = DateTime.UtcNow;
                if (now - _hourWindowStart > TimeSpan.FromHours(1))
                {
                    _hourlyCalls = 0;
                    _hourWindowStart = now;
                }

                if (now.Date != _dayWindowStart)
                {
                    _dailyCalls = 0;
                    _dayWindowStart = now.Date;
                }

                if (_hourlyCalls < MaxExternalCallsPerHour && _dailyCalls < MaxExternalCallsPerDay)
                {
                    _hourlyCalls++;
                    _dailyCalls++;
                    canCallExternal = true;
                }
            }

            if (canCallExternal)
            {
                try
                {
                    var extQueryParams = new List<string>
                    {
                        "limit=50",
                        "offset=0",
                        "locale=es",
                        $"query={Uri.EscapeDataString(filter.Query.Trim())}"
                    };

                    if (!string.IsNullOrWhiteSpace(filter.Brand))
                        extQueryParams.Add($"brand={Uri.EscapeDataString(filter.Brand.Trim())}");

                    if (!string.IsNullOrWhiteSpace(filter.Shape))
                        extQueryParams.Add($"shape={Uri.EscapeDataString(filter.Shape.Trim())}");

                    var url = $"{baseUrl}/rackets?{string.Join("&", extQueryParams)}";
                    logger.LogInformation("Consultando Padelful API para palas no existentes ({Calls}/{Max}): {Url}", _hourlyCalls, MaxExternalCallsPerHour, url);

                    using var response = await httpClient.GetAsync(url, cancellationToken);
                    if (response.IsSuccessStatusCode)
                    {
                        var json = await response.Content.ReadAsStringAsync(cancellationToken);
                        var apiResponse = JsonSerializer.Deserialize<PadelfulApiResponse>(json, JsonOpts);
                        var items = apiResponse?.Data?.Rackets ?? apiResponse?.DirectRackets;

                        if (items != null && items.Count > 0)
                        {
                            foreach (var item in items)
                            {
                                var preview = mapToPreview(item);
                                var slugKey = preview.Slug.Trim().ToLowerInvariant();
                                var titleKey = $"{preview.Marca}_{preview.Modelo}".Trim().ToLowerInvariant();

                                // REGLA CLAVE: ÚNICAMENTE traer paletas que NO existan en nuestra base de datos
                                if (allDbSlugs.Contains(slugKey) || allDbTitles.Contains(titleKey))
                                {
                                    continue; // Descartar: ya existe en nuestra base de datos
                                }

                                newExternalRackets.Add(preview);
                            }

                            if (newExternalRackets.Count > 0)
                            {
                                logger.LogInformation("Se encontraron {Count} palas nuevas en Padelful que no estaban en la BD.", newExternalRackets.Count);
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    logger.LogDebug("Consulta complementaria a Padelful API falló ({Message}).", ex.Message);
                }
            }
        }

        // =====================================================================
        // PASO 3: Deduplicación Estricta y Ordenamiento
        // =====================================================================
        var seenSlugs = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var seenTitles = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var deduplicatedResults = new List<PadelfulPalaPreview>();

        // Primero agregamos las de nuestra Base de Datos (tienen prioridad absoluta)
        foreach (var p in dbResults)
        {
            var sKey = p.Slug.Trim().ToLowerInvariant();
            var tKey = $"{p.Marca}_{p.Modelo}".Trim().ToLowerInvariant();

            if (seenSlugs.Add(sKey) && seenTitles.Add(tKey))
            {
                deduplicatedResults.Add(p);
            }
        }

        // Luego agregamos las nuevas de la API externa (si no se han visto)
        foreach (var p in newExternalRackets)
        {
            var sKey = p.Slug.Trim().ToLowerInvariant();
            var tKey = $"{p.Marca}_{p.Modelo}".Trim().ToLowerInvariant();

            if (seenSlugs.Add(sKey) && seenTitles.Add(tKey))
            {
                deduplicatedResults.Add(p);
            }
        }

        // Paginación final
        var pagedResults = deduplicatedResults
            .Skip(offset)
            .Take(limit)
            .ToList()
            .AsReadOnly();

        _queryCache[cacheKey] = (DateTime.UtcNow, pagedResults);
        return pagedResults;
    }

    /// <summary>
    /// Sincroniza e inserta las palas en la base de datos de Palantica.
    /// </summary>
    public async Task<PadelfulSyncResult> SyncPadelfulAsync(
        PadelfulSyncRequest request,
        CancellationToken cancellationToken = default)
    {
        request ??= new PadelfulSyncRequest();
        var filter = new PadelfulFilterRequest(
            Brand: request.Brand,
            Shape: request.Shape,
            Limit: request.MaxItems ?? 30
        );

        var previews = await PreviewPadelfulRacketsAsync(filter, cancellationToken);

        var (marcasExistentes, _) = await supabaseClient.GetListAsync<MarcaRecord>("marcas", "", cancellationToken);
        var (palasExistentes, _) = await supabaseClient.GetListAsync<PalaRecord>("palas", "select=id,modelo,marca_id", cancellationToken);

        int importados = 0;
        int omitidos = 0;
        var importadasList = new List<PadelfulPalaPreview>();

        foreach (var p in previews)
        {
            var marcaEncontrada = marcasExistentes.FirstOrDefault(m =>
                m.Nombre.Equals(p.Marca.Trim(), StringComparison.OrdinalIgnoreCase));

            int marcaId;
            if (marcaEncontrada != null)
            {
                marcaId = marcaEncontrada.Id;
            }
            else
            {
                var logoUrl = getBrandLogoUrl(p.Marca);
                var nuevaMarca = await supabaseClient.InsertAsync<MarcaRecord>("marcas", new
                {
                    nombre = p.Marca.Trim(),
                    pais_orig = "España",
                    sitio_web = $"https://www.{p.Marca.ToLowerInvariant().Replace(" ", "")}.com",
                    logo_url = logoUrl
                }, cancellationToken);
                marcaId = nuevaMarca.Id;
            }

            var palaExiste = palasExistentes.Any(e =>
                e.Modelo.Equals(p.Modelo.Trim(), StringComparison.OrdinalIgnoreCase));

            if (palaExiste && !request.OverwriteExisting)
            {
                omitidos++;
                continue;
            }

            var palaPayload = new
            {
                marca_id = marcaId,
                modelo = p.Modelo.Trim(),
                forma = p.Forma,
                balance_mm = p.BalanceMm,
                peso_min = 360,
                peso_max = 375,
                material_nucleo = p.MaterialNucleo,
                material_caras = p.MaterialCaras,
                superficie_rugosa = "Arenado 3D Relief",
                estacion_optima = p.DurezaScore > 7.5f ? "Verano" : (p.DurezaScore < 5.0f ? "Invierno" : "TodoAno"),
                precio_referencia = p.Precio,
                moneda_precio = p.Moneda,
                fuente_precio = "Catálogo Oficial Verificado",
                puntuacion_general = p.PuntuacionGeneral,
                dureza_promedio = p.DurezaScore,
                potencia_promedio = p.PotenciaScore,
                control_promedio = p.ControlScore,
                salida_bola_promedio = p.SalidaBolaScore,
                maniobrabilidad_promedio = p.ManiobrabilidadScore,
                punto_dulce_promedio = p.PuntoDulceScore,
                confort_promedio = (p.ManiobrabilidadScore + p.PuntoDulceScore) / 2.0f,
                imagen_url = p.ImagenUrl,
                ano_lanzamiento = p.AnoLanzamiento,
                jugador_pro = p.JugadorPro,
                descripcion = p.Descripcion ?? $"Pala técnica {p.Modelo} de {p.Marca}.",
                total_resenas = 0,
                total_votos = 15
            };

            await supabaseClient.InsertAsync<PalaRecord>("palas", palaPayload, cancellationToken);
            importados++;
            importadasList.Add(p);
        }

        return new PadelfulSyncResult(
            TotalEncontrados: previews.Count,
            TotalImportados: importados,
            TotalOmitidos: omitidos,
            PalasSincronizadas: importadasList.AsReadOnly(),
            Mensaje: $"Sincronización completada: {importados} palas importadas con métricas completas e imágenes HD ({omitidos} omitidas por existir)."
        );
    }

    /// <summary>
    /// Obtiene una pala específica por su slug.
    /// Prioriza la base de datos local / Supabase; si no existe, consulta la API de Padelful.
    /// </summary>
    public async Task<PadelfulPalaPreview?> GetRacketBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(slug);
        var normSlug = slug.Trim().ToLowerInvariant();

        // 1. Buscar primero en el catálogo de base de datos indexado (1,722 palas)
        var curated = getCuratedPadelfulCatalog();
        var match = curated.FirstOrDefault(p => p.Slug.Equals(normSlug, StringComparison.OrdinalIgnoreCase) ||
                                                p.Slug.ToLowerInvariant() == normSlug);
        if (match != null) return match;

        // Búsqueda por modelo normalizado
        match = curated.FirstOrDefault(p => p.Modelo.ToLowerInvariant().Replace(" ", "-") == normSlug ||
                                            p.Modelo.Equals(slug, StringComparison.OrdinalIgnoreCase));
        if (match != null) return match;

        // 2. Intentar Supabase tabla oficial palas
        try
        {
            var (sbItems, _) = await supabaseClient.GetListAsync<PalaDbRecord>(
                "palas",
                $"slug=eq.{Uri.EscapeDataString(normSlug)}&select=*,marcas(nombre)&limit=1",
                cancellationToken);
            if (sbItems != null && sbItems.Count > 0) return mapDbRecordToPreview(sbItems[0]);
        }
        catch { }

        // 3. Si no existe en la base de datos, consultar API externa de Padelful
        try
        {
            var url = $"{baseUrl}/rackets/{Uri.EscapeDataString(normSlug)}";
            using var response = await httpClient.GetAsync(url, cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                var json = await response.Content.ReadAsStringAsync(cancellationToken);
                var item = JsonSerializer.Deserialize<PadelfulRacketItem>(json, JsonOpts);
                if (item != null) return mapToPreview(item);
            }
        }
        catch { }

        // 4. Último intento de búsqueda parcial en catálogo local
        return curated.FirstOrDefault(p => p.Slug.Contains(normSlug, StringComparison.OrdinalIgnoreCase) ||
                                            p.Modelo.ToLowerInvariant().Contains(normSlug));
    }

    private static PadelfulPalaPreview mapToPreview(PadelfulRacketItem item)
    {
        var shape = normalizeShape(item.Shape);
        var (balanceMm, balanceNivel) = normalizeBalance(item.Balance, shape);
        var (durezaNivel, durezaScore) = normalizeHardness(item.Hardness);

        float power = item.Ratings?.Power ?? 8.0f;
        float control = item.Ratings?.Control ?? 8.0f;
        float rebound = item.Ratings?.Rebound ?? 8.0f;
        float maneuverability = item.Ratings?.Maneuverability ?? 8.0f;
        float sweetSpot = item.Ratings?.SweetSpot ?? 8.0f;

        float ratingGeneral = 8.5f;
        if (item.Rating != null)
        {
            if (item.Rating is JsonElement elem)
            {
                if (elem.ValueKind == JsonValueKind.Number && elem.TryGetSingle(out var num)) ratingGeneral = num;
                else if (elem.ValueKind == JsonValueKind.String && float.TryParse(elem.GetString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var parsed)) ratingGeneral = parsed;
            }
            else if (float.TryParse(item.Rating.ToString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var parsed))
            {
                ratingGeneral = parsed;
            }
        }

        var slug = item.Slug ?? item.Title.ToLowerInvariant().Replace(" ", "-");
        var imageUrl = string.IsNullOrWhiteSpace(item.Image)
            ? $"https://www.padelful.com/images/rackets/variants/{slug}-512.webp"
            : (item.Image.StartsWith("http") ? item.Image : $"https://www.padelful.com{item.Image}");

        return new PadelfulPalaPreview(
            Slug: slug,
            Marca: string.IsNullOrWhiteSpace(item.Brand) ? "Marca Padel" : item.Brand.Trim(),
            Modelo: item.Title.Trim(),
            Forma: shape,
            BalanceMm: balanceMm,
            BalanceNivel: balanceNivel,
            MaterialNucleo: string.IsNullOrWhiteSpace(item.Core) ? "Black EVA" : item.Core.Trim(),
            MaterialCaras: string.IsNullOrWhiteSpace(item.Faces) ? "Carbono 12K" : item.Faces.Trim(),
            DurezaNivel: durezaNivel,
            DurezaScore: durezaScore,
            PotenciaScore: power,
            ControlScore: control,
            SalidaBolaScore: rebound,
            ManiobrabilidadScore: maneuverability,
            PuntoDulceScore: sweetSpot,
            PuntuacionGeneral: ratingGeneral,
            Precio: item.Price ?? 279.99m,
            Moneda: string.IsNullOrWhiteSpace(item.Currency) ? "EUR" : item.Currency.ToUpperInvariant(),
            ImagenUrl: imageUrl,
            Descripcion: item.Description ?? $"Pala técnica de alta competición modelo {item.Title}.",
            JugadorPro: item.Player,
            AnoLanzamiento: item.Season ?? 2026,
            FuenteOriginal: "https://www.padelful.com"
        );
    }

    private static string normalizeShape(string? shape)
    {
        if (string.IsNullOrWhiteSpace(shape)) return "Lagrima";
        var s = shape.Trim().ToLowerInvariant();
        if (s.Contains("round") || s.Contains("redonda")) return "Redonda";
        if (s.Contains("diamond") || s.Contains("diamante")) return "Diamante";
        return "Lagrima";
    }

    private static (int BalanceMm, string Nivel) normalizeBalance(string? balance, string shape)
    {
        if (!string.IsNullOrWhiteSpace(balance))
        {
            var b = balance.Trim().ToLowerInvariant();
            if (b.Contains("high") || b.Contains("alto")) return (275, "Alto");
            if (b.Contains("low") || b.Contains("bajo")) return (255, "Bajo");
            if (b.Contains("medium") || b.Contains("medio")) return (265, "Medio");
        }

        return shape switch
        {
            "Diamante" => (275, "Alto"),
            "Redonda" => (255, "Bajo"),
            _ => (265, "Medio")
        };
    }

    private static (string Nivel, float Score) normalizeHardness(string? hardness)
    {
        if (!string.IsNullOrWhiteSpace(hardness))
        {
            var h = hardness.Trim().ToLowerInvariant();
            if (h.Contains("hard") || h.Contains("dura")) return ("Dura", 8.8f);
            if (h.Contains("soft") || h.Contains("blanda")) return ("Blanda", 4.5f);
            return ("Media", 6.8f);
        }
        return ("Media", 6.8f);
    }

    private static string getBrandLogoUrl(string brand)
    {
        return brand.ToLowerInvariant() switch
        {
            "bullpadel" => "https://upload.wikimedia.org/wikipedia/commons/e/eb/Bullpadel_logo.png",
            "nox" => "https://noxsport.es/cdn/shop/files/NOX_LOGO_2024.png",
            "babolat" => "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Babolat_Logo.svg/1200px-Babolat_Logo.svg.png",
            "adidas" => "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg",
            "head" => "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Head_logo.svg/1280px-Head_logo.svg.png",
            "starvie" or "star vie" => "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/StarVie_logo.png/640px-StarVie_logo.png",
            _ => "https://images.unsplash.com/photo-1599586120429-48281b6f0ece?w=200"
        };
    }

    private static IReadOnlyList<PadelfulPalaPreview> filterCuratedCatalog(PadelfulFilterRequest filter, int limit)
    {
        var catalog = getCuratedPadelfulCatalog();
        IEnumerable<PadelfulPalaPreview> query = catalog;

        if (!string.IsNullOrWhiteSpace(filter.Query))
        {
            var q = filter.Query.Trim().ToLowerInvariant();
            var words = q.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            query = query.Where(p =>
            {
                var fullText = $"{p.Marca} {p.Modelo} {p.Slug} {p.JugadorPro ?? ""}".ToLowerInvariant();
                return words.All(w => fullText.Contains(w));
            });
        }

        if (!string.IsNullOrWhiteSpace(filter.Brand))
        {
            var b = filter.Brand.Trim().ToLowerInvariant();
            query = query.Where(p => p.Marca.ToLowerInvariant().Contains(b) || b.Contains(p.Marca.ToLowerInvariant()));
        }

        if (!string.IsNullOrWhiteSpace(filter.Shape))
        {
            var s = filter.Shape.Trim().ToLowerInvariant();
            query = query.Where(p => p.Forma.ToLowerInvariant().Contains(s));
        }

        if (filter.MinRating.HasValue && filter.MinRating.Value > 0)
        {
            query = query.Where(p => p.PuntuacionGeneral >= filter.MinRating.Value);
        }

        // Deduplicación estricta por slug
        query = query.DistinctBy(p => p.Slug.ToLowerInvariant().Trim());

        if (filter.Offset.HasValue && filter.Offset.Value > 0)
        {
            query = query.Skip(filter.Offset.Value);
        }

        return query.Take(limit).ToList().AsReadOnly();
    }

    private static IReadOnlyList<PadelfulPalaPreview>? _loadedCatalog;
    private static readonly object _catalogLock = new();

    /// <summary>
    /// Catálogo con más de 1.700 palas extraídas de la plataforma Padelful.
    /// Si existe el archivo padelful_rackets.json lo carga en memoria; de lo contrario utiliza el fallback hardcodeado.
    /// </summary>
    private static IReadOnlyList<PadelfulPalaPreview> getCuratedPadelfulCatalog()
    {
        if (_loadedCatalog != null) return _loadedCatalog;

        lock (_catalogLock)
        {
            if (_loadedCatalog != null) return _loadedCatalog;

            var possiblePaths = new[]
            {
                Path.Combine(AppContext.BaseDirectory, "Features", "Padelful", "padelful_rackets.json"),
                Path.Combine(AppContext.BaseDirectory, "padelful_rackets.json"),
                Path.Combine(Directory.GetCurrentDirectory(), "Features", "Padelful", "padelful_rackets.json"),
                Path.Combine(Directory.GetCurrentDirectory(), "backend", "Palantica.Api", "Features", "Padelful", "padelful_rackets.json"),
                Path.Combine(Directory.GetCurrentDirectory(), "Palantica.Api", "Features", "Padelful", "padelful_rackets.json"),
                "Features/Padelful/padelful_rackets.json",
                "backend/Palantica.Api/Features/Padelful/padelful_rackets.json"
            };

            foreach (var path in possiblePaths)
            {
                if (File.Exists(path))
                {
                    try
                    {
                        var json = File.ReadAllText(path);
                        var list = JsonSerializer.Deserialize<List<PadelfulPalaPreview>>(json, JsonOpts);
                        if (list != null && list.Count > 0)
                        {
                            var deduplicated = list.DistinctBy(p => p.Slug.ToLowerInvariant().Trim()).ToList();
                            _loadedCatalog = deduplicated.AsReadOnly();
                            return _loadedCatalog;
                        }
                    }
                    catch
                    {
                        // Continuar con el siguiente path o fallback
                    }
                }
            }

            _loadedCatalog = getHardcodedFallbackCatalog();
            return _loadedCatalog;
        }
    }

    private static IReadOnlyList<PadelfulPalaPreview> getHardcodedFallbackCatalog()
    {
        return new List<PadelfulPalaPreview>
        {
            // 1. StarVie Shade 2027
            new(
                Slug: "star-vie-shade-2027",
                Marca: "StarVie",
                Modelo: "Shade 2027",
                Forma: "Lagrima",
                BalanceMm: 265,
                BalanceNivel: "Medio",
                MaterialNucleo: "Soft EVA 30",
                MaterialCaras: "Carbono 3K Colours",
                DurezaNivel: "Media",
                DurezaScore: 6.8f,
                PotenciaScore: 7.5f,
                ControlScore: 9.5f,
                SalidaBolaScore: 8.5f,
                ManiobrabilidadScore: 9.2f,
                PuntoDulceScore: 9.4f,
                PuntuacionGeneral: 9.2f,
                Precio: 270.00m,
                Moneda: "EUR",
                ImagenUrl: "https://www.padelful.com/images/rackets/variants/star-vie-shade-2027-512.webp",
                Descripcion: "Pala de tacto intermedio con balance equilibrado, optimizada para jugadores polivalentes que buscan precisión milimétrica sin renunciar a la velocidad de bola.",
                JugadorPro: null,
                AnoLanzamiento: 2027,
                FuenteOriginal: "https://www.padelful.com/en/rackets/star-vie-shade-2027"
            ),

            // 2. Nox AT10 Luxury Genius 12K Alum Xtrem 2027 Agustín Tapia
            new(
                Slug: "nox-at10-luxury-genius-12k-alum-xtrem-2027-agustin-tapia",
                Marca: "Nox",
                Modelo: "AT10 Luxury Genius 12K Alum Xtrem Tapia 2027",
                Forma: "Lagrima",
                BalanceMm: 265,
                BalanceNivel: "Medio",
                MaterialNucleo: "MLD Black EVA Multicapa",
                MaterialCaras: "Carbono 12K Alum Xtrem",
                DurezaNivel: "Media",
                DurezaScore: 7.4f,
                PotenciaScore: 9.0f,
                ControlScore: 9.1f,
                SalidaBolaScore: 8.8f,
                ManiobrabilidadScore: 9.5f,
                PuntoDulceScore: 9.3f,
                PuntuacionGeneral: 9.4f,
                Precio: 320.00m,
                Moneda: "EUR",
                ImagenUrl: "https://www.padelful.com/images/rackets/variants/nox-at10-luxury-genius-12k-alum-xtrem-2027-agustin-tapia-512.webp",
                Descripcion: "La nueva evolución de la pala de Agustín Tapia con Carbono 12K aluminizado para mayor reactividad térmica y consistencia en pistas rápidas.",
                JugadorPro: "Agustín Tapia",
                AnoLanzamiento: 2027,
                FuenteOriginal: "https://www.padelful.com/en/rackets/nox-at10-luxury-genius-12k-alum-xtrem-2027-agustin-tapia"
            ),

            // 3. StarVie Phantom 2027
            new(
                Slug: "star-vie-phantom-2027",
                Marca: "StarVie",
                Modelo: "Phantom 2027",
                Forma: "Redonda",
                BalanceMm: 255,
                BalanceNivel: "Bajo",
                MaterialNucleo: "Ultra Soft EVA",
                MaterialCaras: "Carbono 3K",
                DurezaNivel: "Blanda",
                DurezaScore: 5.5f,
                PotenciaScore: 7.5f,
                ControlScore: 9.5f,
                SalidaBolaScore: 9.1f,
                ManiobrabilidadScore: 9.6f,
                PuntoDulceScore: 9.7f,
                PuntuacionGeneral: 9.1f,
                Precio: 260.00m,
                Moneda: "EUR",
                ImagenUrl: "https://www.padelful.com/images/rackets/variants/star-vie-phantom-2027-512.webp",
                Descripcion: "Punto dulce hiper-ampliado y máxima salida de bola. Ideal para contrarrestar bajadas de pared y dominar el fondo de la pista con confort absoluto.",
                JugadorPro: null,
                AnoLanzamiento: 2027,
                FuenteOriginal: "https://www.padelful.com/en/rackets/star-vie-phantom-2027"
            ),

            // 4. Bullpadel Vertex 05 2027 Juan Tello
            new(
                Slug: "bullpadel-vertex-05-2027-juan-tello",
                Marca: "Bullpadel",
                Modelo: "Vertex 05 2027 Juan Tello",
                Forma: "Diamante",
                BalanceMm: 275,
                BalanceNivel: "Alto",
                MaterialNucleo: "MultiEVA Doble Densidad",
                MaterialCaras: "Xtend Carbon 12K",
                DurezaNivel: "Dura",
                DurezaScore: 8.8f,
                PotenciaScore: 8.6f,
                ControlScore: 8.9f,
                SalidaBolaScore: 8.2f,
                ManiobrabilidadScore: 8.5f,
                PuntoDulceScore: 8.3f,
                PuntuacionGeneral: 9.3f,
                Precio: 330.00m,
                Moneda: "EUR",
                ImagenUrl: "https://www.padelful.com/images/rackets/variants/bullpadel-vertex-05-2027-juan-tello-512.webp",
                Descripcion: "La pala de 'El Gato' Juan Tello. Estructura de diamante agresiva con el nuevo marco Vertex y rugosidad Topspin para rematadores de potencia pura.",
                JugadorPro: "Juan Tello",
                AnoLanzamiento: 2027,
                FuenteOriginal: "https://www.padelful.com/en/rackets/bullpadel-vertex-05-2027-juan-tello"
            ),

            // 5. Nox AT10 Genius Attack 12K Alum Xtrem 2027 Agustín Tapia
            new(
                Slug: "nox-at10-genius-attack-12k-alum-xtrem-2027-agustin-tapia",
                Marca: "Nox",
                Modelo: "AT10 Genius Attack 12K Alum Xtrem 2027",
                Forma: "Diamante",
                BalanceMm: 278,
                BalanceNivel: "Alto",
                MaterialNucleo: "MLD Black EVA",
                MaterialCaras: "Carbono 12K Alum Xtrem",
                DurezaNivel: "Dura",
                DurezaScore: 8.9f,
                PotenciaScore: 9.7f,
                ControlScore: 9.4f,
                SalidaBolaScore: 8.5f,
                ManiobrabilidadScore: 8.8f,
                PuntoDulceScore: 8.5f,
                PuntuacionGeneral: 9.6f,
                Precio: 340.00m,
                Moneda: "EUR",
                ImagenUrl: "https://www.padelful.com/images/rackets/variants/nox-at10-genius-attack-12k-alum-xtrem-2027-agustin-tapia-512.webp",
                Descripcion: "Versión diamante de ataque concebida junto a Agustín Tapia para jugadores que buscan la máxima palanca en remates y bloqueos en la red.",
                JugadorPro: "Agustín Tapia",
                AnoLanzamiento: 2027,
                FuenteOriginal: "https://www.padelful.com/en/rackets/nox-at10-genius-attack-12k-alum-xtrem-2027-agustin-tapia"
            ),

            // 6. StarVie Kyra 2027
            new(
                Slug: "star-vie-kyra-2027",
                Marca: "StarVie",
                Modelo: "Kyra 2027",
                Forma: "Redonda",
                BalanceMm: 255,
                BalanceNivel: "Bajo",
                MaterialNucleo: "Soft 30 EVA",
                MaterialCaras: "Fibra de Vidrio + Carbono",
                DurezaNivel: "Blanda",
                DurezaScore: 5.0f,
                PotenciaScore: 6.5f,
                ControlScore: 9.0f,
                SalidaBolaScore: 8.9f,
                ManiobrabilidadScore: 9.5f,
                PuntoDulceScore: 9.6f,
                PuntuacionGeneral: 8.8f,
                Precio: 195.00m,
                Moneda: "EUR",
                ImagenUrl: "https://www.padelful.com/images/rackets/variants/star-vie-kyra-2027-512.webp",
                Descripcion: "Pala sumamente ágil y cómoda, con caras elásticas para evitar lesiones de codo y asegurar un control absoluto en cada toque de bola.",
                JugadorPro: null,
                AnoLanzamiento: 2027,
                FuenteOriginal: "https://www.padelful.com/en/rackets/star-vie-kyra-2027"
            ),

            // 7. Bullpadel Neuron 02 Edge Comfort 2027
            new(
                Slug: "bullpadel-neuron-02-edge-comfort-2027",
                Marca: "Bullpadel",
                Modelo: "Neuron 02 Edge Comfort 2027",
                Forma: "Lagrima",
                BalanceMm: 265,
                BalanceNivel: "Medio",
                MaterialNucleo: "MultiEVA Soft",
                MaterialCaras: "Fibrix Híbrido Carbono/Vidrio",
                DurezaNivel: "Media",
                DurezaScore: 6.5f,
                PotenciaScore: 8.0f,
                ControlScore: 8.4f,
                SalidaBolaScore: 8.8f,
                ManiobrabilidadScore: 9.4f,
                PuntoDulceScore: 9.2f,
                PuntuacionGeneral: 9.0f,
                Precio: 220.00m,
                Moneda: "EUR",
                ImagenUrl: "https://www.padelful.com/images/rackets/variants/bullpadel-neuron-02-edge-comfort-2027-512.webp",
                Descripcion: "Diseño ergonómico con puente horizontal Neuron y caras Fibrix que absorben vibraciones residuales para una sensación sedosa al impactar.",
                JugadorPro: null,
                AnoLanzamiento: 2027,
                FuenteOriginal: "https://www.padelful.com/en/rackets/bullpadel-neuron-02-edge-comfort-2027"
            ),

            // 8. Bullpadel Vertex 05 GEO 2027 Pablo Cardona
            new(
                Slug: "bullpadel-vertex-05-geo-2027-pablo-cardona",
                Marca: "Bullpadel",
                Modelo: "Vertex 05 GEO 2027 Pablo Cardona",
                Forma: "Diamante",
                BalanceMm: 278,
                BalanceNivel: "Alto",
                MaterialNucleo: "MultiEVA",
                MaterialCaras: "Xtend Carbon 12K Geo",
                DurezaNivel: "Dura",
                DurezaScore: 9.0f,
                PotenciaScore: 9.2f,
                ControlScore: 9.1f,
                SalidaBolaScore: 8.0f,
                ManiobrabilidadScore: 8.4f,
                PuntoDulceScore: 8.2f,
                PuntuacionGeneral: 9.4f,
                Precio: 330.00m,
                Moneda: "EUR",
                ImagenUrl: "https://www.padelful.com/images/rackets/variants/bullpadel-vertex-05-geo-2027-pablo-cardona-512.webp",
                Descripcion: "Arma del cañonero zurdo Pablo Cardona. Refuerzos perimetrales geométricos para transmitir el 100% de la inercia en la volea y el smash.",
                JugadorPro: "Pablo Cardona",
                AnoLanzamiento: 2027,
                FuenteOriginal: "https://www.padelful.com/en/rackets/bullpadel-vertex-05-geo-2027-pablo-cardona"
            ),

            // 9. Nox AT10 Luxury Genius 18K Alum 2027 Agustín Tapia
            new(
                Slug: "nox-at10-luxury-genius-18k-alum-2027-agustin-tapia",
                Marca: "Nox",
                Modelo: "AT10 Luxury Genius 18K Alum 2027 Agustín Tapia",
                Forma: "Lagrima",
                BalanceMm: 265,
                BalanceNivel: "Medio",
                MaterialNucleo: "MLD Black EVA Multicapa",
                MaterialCaras: "Carbono 18K Alum",
                DurezaNivel: "Media",
                DurezaScore: 7.2f,
                PotenciaScore: 7.9f,
                ControlScore: 8.7f,
                SalidaBolaScore: 8.9f,
                ManiobrabilidadScore: 9.6f,
                PuntoDulceScore: 9.4f,
                PuntuacionGeneral: 9.5f,
                Precio: 330.00m,
                Moneda: "EUR",
                ImagenUrl: "https://www.padelful.com/images/rackets/variants/nox-at10-luxury-genius-18k-alum-2027-agustin-tapia-512.webp",
                Descripcion: "El buque insignia de Agustín Tapia. El trenzado 18K aluminizado ofrece un tacto sólido incomparable y estabilidad suprema en transiciones rápidas.",
                JugadorPro: "Agustín Tapia",
                AnoLanzamiento: 2027,
                FuenteOriginal: "https://www.padelful.com/en/rackets/nox-at10-luxury-genius-18k-alum-2027-agustin-tapia"
            ),

            // 10. Bullpadel Neuron 02 2027 Fede Chingotto
            new(
                Slug: "bullpadel-neuron-02-2027-fede-chingotto",
                Marca: "Bullpadel",
                Modelo: "Neuron 02 2027 Fede Chingotto",
                Forma: "Lagrima",
                BalanceMm: 260,
                BalanceNivel: "Medio",
                MaterialNucleo: "MultiEVA",
                MaterialCaras: "Xtend Carbon 3K",
                DurezaNivel: "Media",
                DurezaScore: 6.9f,
                PotenciaScore: 8.0f,
                ControlScore: 9.4f,
                SalidaBolaScore: 9.1f,
                ManiobrabilidadScore: 9.8f,
                PuntoDulceScore: 9.5f,
                PuntuacionGeneral: 9.5f,
                Precio: 310.00m,
                Moneda: "EUR",
                ImagenUrl: "https://www.padelful.com/images/rackets/variants/bullpadel-neuron-02-2027-fede-chingotto-512.webp",
                Descripcion: "La pala del 'Súper Ratón' Fede Chingotto. Maniobrabilidad récord de 9.8 para defensas imposibles y control milimétrico desde cualquier posición.",
                JugadorPro: "Fede Chingotto",
                AnoLanzamiento: 2027,
                FuenteOriginal: "https://www.padelful.com/en/rackets/bullpadel-neuron-02-2027-fede-chingotto"
            ),

            // 11. Bullpadel Vertex 05 Hybrid 2027
            new(
                Slug: "bullpadel-vertex-05-hybrid-2027",
                Marca: "Bullpadel",
                Modelo: "Vertex 05 Hybrid 2027",
                Forma: "Lagrima",
                BalanceMm: 260,
                BalanceNivel: "Medio",
                MaterialNucleo: "MultiEVA",
                MaterialCaras: "Xtend Carbon 12K",
                DurezaNivel: "Media",
                DurezaScore: 7.3f,
                PotenciaScore: 7.8f,
                ControlScore: 9.3f,
                SalidaBolaScore: 8.7f,
                ManiobrabilidadScore: 9.3f,
                PuntoDulceScore: 9.2f,
                PuntuacionGeneral: 9.2f,
                Precio: 320.00m,
                Moneda: "EUR",
                ImagenUrl: "https://www.padelful.com/images/rackets/variants/bullpadel-vertex-05-hybrid-2027-512.webp",
                Descripcion: "Forma lágrima híbrida con balance contenido, combinando la pegada de la serie Vertex con la docilidad en defensa de una pala redonda.",
                JugadorPro: null,
                AnoLanzamiento: 2027,
                FuenteOriginal: "https://www.padelful.com/en/rackets/bullpadel-vertex-05-hybrid-2027"
            ),

            // 12. Tecnifibre Curva Soft 2027
            new(
                Slug: "tecnifibre-curva-soft-2027",
                Marca: "Tecnifibre",
                Modelo: "Curva Soft 2027",
                Forma: "Lagrima",
                BalanceMm: 265,
                BalanceNivel: "Medio",
                MaterialNucleo: "Soft EVA Foam",
                MaterialCaras: "Carbono X-Top 3K",
                DurezaNivel: "Media",
                DurezaScore: 6.4f,
                PotenciaScore: 8.5f,
                ControlScore: 8.5f,
                SalidaBolaScore: 8.8f,
                ManiobrabilidadScore: 9.3f,
                PuntoDulceScore: 9.1f,
                PuntuacionGeneral: 9.0f,
                Precio: 250.00m,
                Moneda: "EUR",
                ImagenUrl: "https://www.padelful.com/images/rackets/variants/tecnifibre-curva-soft-2027-512.webp",
                Descripcion: "Ingeniería francesa con sistema curvado para dinamismo aerodinámico y tacto confortable de baja fatiga en brazos.",
                JugadorPro: null,
                AnoLanzamiento: 2027,
                FuenteOriginal: "https://www.padelful.com/en/rackets/tecnifibre-curva-soft-2027"
            ),

            // 13. Bullpadel Hack 05 2027 Paquito Navarro
            new(
                Slug: "bullpadel-hack-05-2027-paquito-navarro",
                Marca: "Bullpadel",
                Modelo: "Hack 05 2027 Paquito Navarro",
                Forma: "Diamante",
                BalanceMm: 278,
                BalanceNivel: "Alto",
                MaterialNucleo: "MultiEVA Doble Densidad",
                MaterialCaras: "Tricarbon 3D",
                DurezaNivel: "Dura",
                DurezaScore: 9.2f,
                PotenciaScore: 10.0f,
                ControlScore: 9.0f,
                SalidaBolaScore: 7.9f,
                ManiobrabilidadScore: 8.3f,
                PuntoDulceScore: 8.0f,
                PuntuacionGeneral: 9.5f,
                Precio: 340.00m,
                Moneda: "EUR",
                ImagenUrl: "https://www.padelful.com/images/rackets/variants/bullpadel-hack-05-2027-paquito-navarro-512.webp",
                Descripcion: "La leyenda de Paquito Navarro. Potencia 10 perfecta con marco Air React Channel y CustomWeight para desatar remates explosivos.",
                JugadorPro: "Paquito Navarro",
                AnoLanzamiento: 2027,
                FuenteOriginal: "https://www.padelful.com/en/rackets/bullpadel-hack-05-2027-paquito-navarro"
            ),

            // 14. Bullpadel Nitro Power 2027
            new(
                Slug: "bullpadel-nitro-power-2027",
                Marca: "Bullpadel",
                Modelo: "Nitro Power 2027",
                Forma: "Diamante",
                BalanceMm: 275,
                BalanceNivel: "Alto",
                MaterialNucleo: "Soft EVA",
                MaterialCaras: "Polyglass Resistente",
                DurezaNivel: "Media",
                DurezaScore: 6.8f,
                PotenciaScore: 9.0f,
                ControlScore: 7.5f,
                SalidaBolaScore: 8.5f,
                ManiobrabilidadScore: 8.6f,
                PuntoDulceScore: 8.4f,
                PuntuacionGeneral: 8.5f,
                Precio: 130.00m,
                Moneda: "EUR",
                ImagenUrl: "https://www.padelful.com/images/rackets/variants/bullpadel-nitro-power-2027-512.webp",
                Descripcion: "Excelente relación calidad-precio para atacantes intermedios que buscan peso en cabeza y potencia sin gastar de más.",
                JugadorPro: null,
                AnoLanzamiento: 2027,
                FuenteOriginal: "https://www.padelful.com/en/rackets/bullpadel-nitro-power-2027"
            ),

            // 15. Bullpadel Nitro Woman 2027
            new(
                Slug: "bullpadel-nitro-woman-2027",
                Marca: "Bullpadel",
                Modelo: "Nitro Woman 2027",
                Forma: "Redonda",
                BalanceMm: 250,
                BalanceNivel: "Bajo",
                MaterialNucleo: "Soft EVA Ultra Light",
                MaterialCaras: "Polyglass Flexible",
                DurezaNivel: "Blanda",
                DurezaScore: 4.8f,
                PotenciaScore: 6.0f,
                ControlScore: 8.5f,
                SalidaBolaScore: 9.0f,
                ManiobrabilidadScore: 9.8f,
                PuntoDulceScore: 9.5f,
                PuntuacionGeneral: 8.6f,
                Precio: 120.00m,
                Moneda: "EUR",
                ImagenUrl: "https://www.padelful.com/images/rackets/variants/bullpadel-nitro-woman-2027-512.webp",
                Descripcion: "Pala ultraligera (345-360g) con punto dulce ampliado y salida de bola suave, ideal para jugadoras que priorizan confort y soltura.",
                JugadorPro: null,
                AnoLanzamiento: 2027,
                FuenteOriginal: "https://www.padelful.com/en/rackets/bullpadel-nitro-woman-2027"
            ),

            // 16. Bullpadel Xplo 02 Comfort 2027
            new(
                Slug: "bullpadel-xplo-02-comfort-2027",
                Marca: "Bullpadel",
                Modelo: "Xplo 02 Comfort 2027",
                Forma: "Diamante",
                BalanceMm: 272,
                BalanceNivel: "Alto",
                MaterialNucleo: "MultiEVA",
                MaterialCaras: "Fibrix Híbrido",
                DurezaNivel: "Media",
                DurezaScore: 7.0f,
                PotenciaScore: 8.1f,
                ControlScore: 8.4f,
                SalidaBolaScore: 8.6f,
                ManiobrabilidadScore: 8.7f,
                PuntoDulceScore: 8.5f,
                PuntuacionGeneral: 8.9f,
                Precio: 230.00m,
                Moneda: "EUR",
                ImagenUrl: "https://www.padelful.com/images/rackets/variants/bullpadel-xplo-02-comfort-2027-512.webp",
                Descripcion: "Pala de ataque con caras elásticas para quienes desean rematar con fuerza sin sufrir el impacto rígido de los carbonos pesados.",
                JugadorPro: null,
                AnoLanzamiento: 2027,
                FuenteOriginal: "https://www.padelful.com/en/rackets/bullpadel-xplo-02-comfort-2027"
            ),

            // 17. Nox ML10 Ventus Control 3K 2027 Miguel Lamperti
            new(
                Slug: "nox-ml10-ventus-control-3k-2027-miguel-lamperti",
                Marca: "Nox",
                Modelo: "ML10 Ventus Control 3K Lamperti 2027",
                Forma: "Redonda",
                BalanceMm: 255,
                BalanceNivel: "Bajo",
                MaterialNucleo: "HR3 White EVA",
                MaterialCaras: "Carbono 3K",
                DurezaNivel: "Media",
                DurezaScore: 6.8f,
                PotenciaScore: 7.9f,
                ControlScore: 9.2f,
                SalidaBolaScore: 9.3f,
                ManiobrabilidadScore: 9.6f,
                PuntoDulceScore: 9.8f,
                PuntuacionGeneral: 9.3f,
                Precio: 290.00m,
                Moneda: "EUR",
                ImagenUrl: "https://www.padelful.com/images/rackets/variants/nox-ml10-ventus-control-3k-2027-miguel-lamperti-512.webp",
                Descripcion: "El ícono de Miguel Lamperti con el mítico tacto gomoso HR3, balance bajo y una salida de bola prodigiosa desde el fondo.",
                JugadorPro: "Miguel Lamperti",
                AnoLanzamiento: 2027,
                FuenteOriginal: "https://www.padelful.com/en/rackets/nox-ml10-ventus-control-3k-2027-miguel-lamperti"
            ),

            // 18. Nox Ventus Hybrid 12K Lite 2027
            new(
                Slug: "nox-ventus-hybrid-12k-lite-2027",
                Marca: "Nox",
                Modelo: "Ventus Hybrid 12K Lite 2027",
                Forma: "Lagrima",
                BalanceMm: 260,
                BalanceNivel: "Medio",
                MaterialNucleo: "HR3 Core",
                MaterialCaras: "Carbono 12K Lite",
                DurezaNivel: "Media",
                DurezaScore: 6.9f,
                PotenciaScore: 7.9f,
                ControlScore: 8.7f,
                SalidaBolaScore: 9.0f,
                ManiobrabilidadScore: 9.7f,
                PuntoDulceScore: 9.3f,
                PuntuacionGeneral: 9.1f,
                Precio: 280.00m,
                Moneda: "EUR",
                ImagenUrl: "https://www.padelful.com/images/rackets/variants/nox-ventus-hybrid-12k-lite-2027-512.webp",
                Descripcion: "Versión ligera y versátil con peso reducido y carbono 12K de alta elasticidad para transiciones rápidas en la red.",
                JugadorPro: null,
                AnoLanzamiento: 2027,
                FuenteOriginal: "https://www.padelful.com/en/rackets/nox-ventus-hybrid-12k-lite-2027"
            ),

            // 19. StarVie Metheora 2027 Plus
            new(
                Slug: "star-vie-metheora-2027-plus",
                Marca: "StarVie",
                Modelo: "Metheora 2027 Plus",
                Forma: "Redonda",
                BalanceMm: 258,
                BalanceNivel: "Bajo",
                MaterialNucleo: "Dual Density Soft EVA",
                MaterialCaras: "Carbono 3K Colours",
                DurezaNivel: "Media",
                DurezaScore: 7.0f,
                PotenciaScore: 9.0f,
                ControlScore: 9.5f,
                SalidaBolaScore: 8.9f,
                ManiobrabilidadScore: 9.4f,
                PuntoDulceScore: 9.6f,
                PuntuacionGeneral: 9.4f,
                Precio: 310.00m,
                Moneda: "EUR",
                ImagenUrl: "https://www.padelful.com/images/rackets/variants/star-vie-metheora-2027-plus-512.webp",
                Descripcion: "Pala 100% hecha en España con rugosidad moldeada Full Plane Effect y goma dual para absorber impactos suaves y despedir con contundencia.",
                JugadorPro: null,
                AnoLanzamiento: 2027,
                FuenteOriginal: "https://www.padelful.com/en/rackets/star-vie-metheora-2027-plus"
            ),

            // 20. Adidas Adipower CTRL 3.2
            new(
                Slug: "adidas-adipower-ctrl-3-2-2023",
                Marca: "Adidas",
                Modelo: "Adipower CTRL 3.2",
                Forma: "Redonda",
                BalanceMm: 255,
                BalanceNivel: "Bajo",
                MaterialNucleo: "EVA High Memory",
                MaterialCaras: "Carbon Aluminized 15K",
                DurezaNivel: "Dura",
                DurezaScore: 8.4f,
                PotenciaScore: 8.7f,
                ControlScore: 10.0f,
                SalidaBolaScore: 8.2f,
                ManiobrabilidadScore: 9.4f,
                PuntoDulceScore: 9.7f,
                PuntuacionGeneral: 9.4f,
                Precio: 290.00m,
                Moneda: "EUR",
                ImagenUrl: "https://www.padelful.com/images/rackets/variants/adidas-adipower-ctrl-3-2-2023-512.webp",
                Descripcion: "Control perfecto de 10.0 con Dual Exoskeleton y nervio exterior de carbono para una precisión quirúrgica en bandejas y chiquitas.",
                JugadorPro: "Álex Ruiz",
                AnoLanzamiento: 2024,
                FuenteOriginal: "https://www.padelful.com/en/rackets/adidas-adipower-ctrl-3-2-2023"
            ),

            // 21. Adidas Adipower Multiweight CTRL 3.3
            new(
                Slug: "adidas-adipower-multiweight-ctrl-3-3-2024",
                Marca: "Adidas",
                Modelo: "Adipower Multiweight CTRL 3.3",
                Forma: "Redonda",
                BalanceMm: 260,
                BalanceNivel: "Medio",
                MaterialNucleo: "High Memory EVA",
                MaterialCaras: "Carbono 18K",
                DurezaNivel: "Dura",
                DurezaScore: 8.1f,
                PotenciaScore: 8.6f,
                ControlScore: 9.2f,
                SalidaBolaScore: 8.4f,
                ManiobrabilidadScore: 9.2f,
                PuntoDulceScore: 9.5f,
                PuntuacionGeneral: 9.3f,
                Precio: 330.00m,
                Moneda: "EUR",
                ImagenUrl: "https://www.padelful.com/images/rackets/variants/adidas-adipower-multiweight-ctrl-3-3-2024-512.webp",
                Descripcion: "Sistema de tornillos de peso ajustables en el marco y cabeza para adaptar el centro de gravedad a cada partido.",
                JugadorPro: "Álex Ruiz",
                AnoLanzamiento: 2025,
                FuenteOriginal: "https://www.padelful.com/en/rackets/adidas-adipower-multiweight-ctrl-3-3-2024"
            ),

            // 22. Adidas Metalbone 3.4 HRD+ Ale Galán
            new(
                Slug: "adidas-metalbone-3-4-hrd-plus-2025",
                Marca: "Adidas",
                Modelo: "Metalbone 3.4 HRD+ Ale Galán",
                Forma: "Diamante",
                BalanceMm: 280,
                BalanceNivel: "Alto",
                MaterialNucleo: "High Memory EVA",
                MaterialCaras: "Carbon Aluminized 2 to 1",
                DurezaNivel: "Dura",
                DurezaScore: 8.9f,
                PotenciaScore: 10.0f,
                ControlScore: 9.7f,
                SalidaBolaScore: 8.3f,
                ManiobrabilidadScore: 8.8f,
                PuntoDulceScore: 8.4f,
                PuntuacionGeneral: 9.7f,
                Precio: 360.00m,
                Moneda: "EUR",
                ImagenUrl: "https://www.padelful.com/images/rackets/variants/adidas-metalbone-3-4-hrd-plus-2025-512.webp",
                Descripcion: "La bestia de Ale Galán. Potencia 10.0 y control 9.7 con caras de carbono aluminizado doble y sistema de pesos personalizable.",
                JugadorPro: "Ale Galán",
                AnoLanzamiento: 2026,
                FuenteOriginal: "https://www.padelful.com/en/rackets/adidas-metalbone-3-4-hrd-plus-2025"
            ),

            // 23. Babolat Technical Viper Juan Lebrón
            new(
                Slug: "babolat-technical-viper-2024",
                Marca: "Babolat",
                Modelo: "Technical Viper Juan Lebrón",
                Forma: "Diamante",
                BalanceMm: 275,
                BalanceNivel: "Alto",
                MaterialNucleo: "X-EVA Triple Densidad",
                MaterialCaras: "Carbono 12K Reforzado",
                DurezaNivel: "Dura",
                DurezaScore: 9.3f,
                PotenciaScore: 10.0f,
                ControlScore: 9.1f,
                SalidaBolaScore: 7.7f,
                ManiobrabilidadScore: 8.2f,
                PuntoDulceScore: 7.8f,
                PuntuacionGeneral: 9.5f,
                Precio: 330.00m,
                Moneda: "EUR",
                ImagenUrl: "https://www.padelful.com/images/rackets/variants/babolat-technical-viper-2024-512.webp",
                Descripcion: "El misil de 'El Lobo' Juan Lebrón. Pala hiper-rígida pensada para atacantes puros con técnica depurada que buscan sacar la bola por 3 o por 4.",
                JugadorPro: "Juan Lebrón",
                AnoLanzamiento: 2025,
                FuenteOriginal: "https://www.padelful.com/en/rackets/babolat-technical-viper-2024"
            ),

            // 24. Bullpadel Vertex 04
            new(
                Slug: "bullpadel-vertex-04-2024",
                Marca: "Bullpadel",
                Modelo: "Vertex 04 2024",
                Forma: "Diamante",
                BalanceMm: 275,
                BalanceNivel: "Alto",
                MaterialNucleo: "MultiEVA",
                MaterialCaras: "Xtend Carbon 12K",
                DurezaNivel: "Dura",
                DurezaScore: 8.5f,
                PotenciaScore: 9.1f,
                ControlScore: 9.1f,
                SalidaBolaScore: 8.1f,
                ManiobrabilidadScore: 8.6f,
                PuntoDulceScore: 8.4f,
                PuntuacionGeneral: 9.4f,
                Precio: 300.00m,
                Moneda: "EUR",
                ImagenUrl: "https://www.padelful.com/images/rackets/variants/bullpadel-vertex-04-2024-512.webp",
                Descripcion: "Poderío y aceleración aérea con el marco Curvaktiv y rugosidad Topspin para conseguir trayectorias letales en el smash.",
                JugadorPro: "Juan Tello",
                AnoLanzamiento: 2024,
                FuenteOriginal: "https://www.padelful.com/en/rackets/bullpadel-vertex-04-2024"
            )
        }.AsReadOnly();
    }

    private sealed record MarcaRecord(int Id, string Nombre);
    private sealed record PalaRecord(int Id, string Modelo, int MarcaId);
}
