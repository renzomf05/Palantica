using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;

namespace Palantica.Api.Features.Noticias;

/// <summary>
/// Servicio de agregación y suministro de noticias reales de pádel desde NewsData.io con caché en memoria y resiliencia.
/// </summary>
public sealed class NoticiasService
{
    private const string CacheKey = "PALANTICA_NEWSDATA_PADEL";
    private static DateTimeOffset? _limiteCreditosAlcanzadoHasta;
    private static IReadOnlyList<NoticiaNormalizadaDto>? _noticiasCongeladas;
    private static readonly object _syncLock = new();
    private static readonly string FrozenNewsFilePath = Path.Combine(AppContext.BaseDirectory, "noticias_congeladas.json");

    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IMemoryCache _memoryCache;
    private readonly IConfiguration _configuration;
    private readonly ILogger<NoticiasService> _logger;

    private static readonly IReadOnlyList<NoticiaNormalizadaDto> FallbackNoticias = new List<NoticiaNormalizadaDto>
    {
        new(
            Id: "mock-1",
            Titulo: "la final se decidió en el tie-break del tercer set.",
            Bajada: "Tapia y Coello sellan una temporada histórica tras salvar tres match points en un Palau Sant Jordi enmudecido ante más de 15.000 espectadores.",
            Imagen: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=1200&auto=format&fit=crop&q=80",
            Link: "https://premierpadel.com",
            Fuente: "Premier Padel",
            Fecha: "2026-09-28T14:30:00Z",
            Categoria: "Circuito Pro",
            Seccion: "Circuito profesional",
            Destacada: true
        ),
        new(
            Id: "mock-2",
            Titulo: "adiós definitivo al carbono 24k en las palas de control.",
            Bajada: "Los laboratorios de ingeniería de materiales revelan por qué la rigidez extrema perjudica la salida de bola en jugadores de nivel intermedio.",
            Imagen: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1200&auto=format&fit=crop&q=80",
            Link: "https://noxsport.es",
            Fuente: "Palantica Lab",
            Fecha: "2026-09-27T18:00:00Z",
            Categoria: "Material y Palas",
            Seccion: "Material y palas",
            Destacada: false
        ),
        new(
            Id: "mock-3",
            Titulo: "el retorno del revés a dos manos en el circuito femenino.",
            Bajada: "Un análisis biomecánico de cómo la nueva generación de jugadoras gana tres décimas de segundo frente a la volea profunda con apoyo abierto.",
            Imagen: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80",
            Link: "https://padelmagazine.fr",
            Fuente: "Padel Magazine",
            Fecha: "2026-09-26T12:00:00Z",
            Categoria: "Jugadores",
            Seccion: "Jugadores",
            Destacada: false
        ),
        new(
            Id: "mock-4",
            Titulo: "doha confirma el major con mayor dotación económica de la historia.",
            Bajada: "La Federación Internacional oficializa el calendario de invierno con una parada millonaria en el Khalifa International Tennis Complex.",
            Imagen: "https://images.unsplash.com/photo-1563299796-17596ed6b017?w=800&auto=format&fit=crop&q=80",
            Link: "https://padelfip.com",
            Fuente: "FIP Oficial",
            Fecha: "2026-09-25T10:15:00Z",
            Categoria: "Torneos y Resultados",
            Seccion: "Torneos y resultados",
            Destacada: false
        ),
        new(
            Id: "mock-5",
            Titulo: "la obsesión por la potencia está arruinando la táctica pura.",
            Bajada: "¿Por qué la reducción del punto dulce ha empobrecido la construcción del punto en favor del pegador puro en pistas ultrarrápidas?",
            Imagen: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=80",
            Link: "https://marca.com/padel",
            Fuente: "Marca Pádel",
            Fecha: "2026-09-24T09:00:00Z",
            Categoria: "Opinión",
            Seccion: "Opinión",
            Destacada: false
        ),
        new(
            Id: "mock-6",
            Titulo: "hablamos con agustín tapia sobre el peso exacto de su pala.",
            Bajada: "El prodigio de Catamarca confiesa cómo tres gramos adicionales en la cabeza cambiaron por completo su aceleración aérea en el smash.",
            Imagen: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80",
            Link: "https://as.com/padel",
            Fuente: "Diario AS Pádel",
            Fecha: "2026-09-23T16:45:00Z",
            Categoria: "Entrevistas",
            Seccion: "Entrevistas",
            Destacada: false
        )
    };

    public NoticiasService(
        IHttpClientFactory httpClientFactory,
        IMemoryCache memoryCache,
        IConfiguration configuration,
        ILogger<NoticiasService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _memoryCache = memoryCache;
        _configuration = configuration;
        _logger = logger;
    }

    /// <summary>
    /// Retorna las noticias normalizadas de pádel desde caché o NewsData.io.
    /// </summary>
    public async Task<IReadOnlyList<NoticiaNormalizadaDto>> GetNoticiasAsync(CancellationToken cancellationToken = default)
    {
        // 1. Revisar caché en memoria
        if (_memoryCache.TryGetValue(CacheKey, out IReadOnlyList<NoticiaNormalizadaDto>? cached) && cached != null)
        {
            _logger.LogInformation("[NoticiasService] Retornando {Count} noticias desde caché en memoria.", cached.Count);
            return cached;
        }

        // 2. DISYUNTOR / PAUSA DE CRÉDITOS ("Sin gastar de más"):
        // Si previamente se detectó límite de créditos agotado, NO realizamos llamadas a la API
        // y servimos directamente las últimas noticias reales congeladas.
        if (_limiteCreditosAlcanzadoHasta.HasValue && DateTimeOffset.UtcNow < _limiteCreditosAlcanzadoHasta.Value)
        {
            _logger.LogWarning("[NoticiasService] Límite de créditos activo hasta {Expira:u}. Devolviendo últimas noticias congeladas sin gastar llamadas adicionales.", _limiteCreditosAlcanzadoHasta.Value);
            var congeladas = ObtenerNoticiasCongeladas();
            var tiempoRestante = _limiteCreditosAlcanzadoHasta.Value - DateTimeOffset.UtcNow;
            _memoryCache.Set(CacheKey, congeladas, tiempoRestante > TimeSpan.FromMinutes(30) ? TimeSpan.FromMinutes(30) : tiempoRestante);
            return congeladas;
        }

        var apiKey = _configuration["NEWSDATA_API_KEY"] 
                     ?? Environment.GetEnvironmentVariable("NEWSDATA_API_KEY");

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            _logger.LogWarning("[NoticiasService] NEWSDATA_API_KEY no configurada. Retornando últimas noticias congeladas o respaldo.");
            return ObtenerNoticiasCongeladas();
        }

        try
        {
            var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(15);

            // Parámetros oficiales requeridos:
            // - apikey
            // - q=padel OR pádel
            // - language=es
            var query = "padel OR pádel";
            var url = $"https://newsdata.io/api/1/latest?apikey={Uri.EscapeDataString(apiKey)}&q={Uri.EscapeDataString(query)}&language=es";

            _logger.LogInformation("[NoticiasService] Consultando API de NewsData.io para pádel en español...");
            var response = await client.GetAsync(url, cancellationToken);

            // Detección de límite de créditos por código HTTP (429 Too Many Requests / 402 Payment Required)
            if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests || (int)response.StatusCode == 429)
            {
                ActivarLimiteCreditos("HTTP 429 Too Many Requests");
                var congeladas = ObtenerNoticiasCongeladas();
                _memoryCache.Set(CacheKey, congeladas, TimeSpan.FromHours(4));
                return congeladas;
            }

            if (!response.IsSuccessStatusCode)
            {
                var statusCode = (int)response.StatusCode;
                _logger.LogWarning("[NoticiasService] NewsData.io respondió con HTTP {Status}. Retornando últimas noticias congeladas.", statusCode);
                return ObtenerNoticiasCongeladas();
            }

            var jsonContent = await response.Content.ReadAsStringAsync(cancellationToken);
            using var doc = JsonDocument.Parse(jsonContent);
            var root = doc.RootElement;

            // Detección de límite de créditos en cuerpo JSON (status: error, UsageLimitExceeded)
            var status = root.TryGetProperty("status", out var statusProp) ? statusProp.GetString() : null;
            if (!string.Equals(status, "success", StringComparison.OrdinalIgnoreCase))
            {
                if (EsErrorDeLimiteCreditos(root))
                {
                    ActivarLimiteCreditos("UsageLimitExceeded detectado en respuesta");
                    var congeladas = ObtenerNoticiasCongeladas();
                    _memoryCache.Set(CacheKey, congeladas, TimeSpan.FromHours(4));
                    return congeladas;
                }

                _logger.LogWarning("[NoticiasService] La respuesta de NewsData.io no tiene status success: {Status}. Retornando últimas noticias congeladas.", status);
                return ObtenerNoticiasCongeladas();
            }

            if (!root.TryGetProperty("results", out var resultsProp) || resultsProp.ValueKind != JsonValueKind.Array)
            {
                _logger.LogWarning("[NoticiasService] La respuesta no contiene un arreglo 'results'. Retornando últimas noticias congeladas.");
                return ObtenerNoticiasCongeladas();
            }

            var resultsList = resultsProp.EnumerateArray().ToList();
            if (resultsList.Count > 0)
            {
                // Inspección en consola del primer artículo real recibido (como solicitado para verificación exacta)
                var primerArticuloRaw = resultsList[0].ToString();
                Console.WriteLine($"[NewsData.io DEBUG] Artículo real recibido:\n{primerArticuloRaw}");
                _logger.LogInformation("[NoticiasService] Total de artículos recibidos: {Count}", resultsList.Count);
            }

            var seenTitles = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var seenLinks = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var normalizedList = new List<NoticiaNormalizadaDto>();

            foreach (var art in resultsList)
            {
                var title = art.TryGetProperty("title", out var tp) ? tp.GetString() : null;
                var link = art.TryGetProperty("link", out var lp) ? lp.GetString() : null;

                // Descartar artículos sin título o sin link
                if (string.IsNullOrWhiteSpace(title) || string.IsNullOrWhiteSpace(link))
                {
                    continue;
                }

                // Normalización de título para deduplicación
                var normalizedTitle = title.Trim().ToLowerInvariant();
                var normalizedLink = link.Trim().ToLowerInvariant();

                if (seenTitles.Contains(normalizedTitle) || seenLinks.Contains(normalizedLink))
                {
                    continue;
                }

                seenTitles.Add(normalizedTitle);
                seenLinks.Add(normalizedLink);

                var id = art.TryGetProperty("article_id", out var idProp) && !string.IsNullOrWhiteSpace(idProp.GetString())
                    ? idProp.GetString()!
                    : Guid.NewGuid().ToString("N");

                var description = art.TryGetProperty("description", out var descProp) ? descProp.GetString() : null;

                // Extraer keywords de la noticia si vienen en la respuesta
                List<string>? keywordsList = null;
                if (art.TryGetProperty("keywords", out var kwProp) && kwProp.ValueKind == JsonValueKind.Array)
                {
                    keywordsList = kwProp.EnumerateArray()
                        .Where(k => k.ValueKind == JsonValueKind.String)
                        .Select(k => k.GetString()!)
                        .ToList();
                }

                // FILTRADO ESTRICTO: Solo noticias 100% de pádel (descartar fútbol, política, inmuebles, etc.)
                if (!EsNoticiaDePadel(title, description, keywordsList))
                {
                    _logger.LogInformation("[NoticiasService] Artículo descartado (no trata exclusivamente de pádel): {Title}", title);
                    continue;
                }

                var bajada = RecortarBajada(description);

                var imageUrl = art.TryGetProperty("image_url", out var imgProp) ? imgProp.GetString() : null;
                if (string.IsNullOrWhiteSpace(imageUrl) || imageUrl.StartsWith("data:", StringComparison.OrdinalIgnoreCase))
                {
                    imageUrl = null;
                }

                var sourceName = art.TryGetProperty("source_name", out var snProp) ? snProp.GetString() : null;
                if (string.IsNullOrWhiteSpace(sourceName) && art.TryGetProperty("source_id", out var sidProp))
                {
                    sourceName = sidProp.GetString();
                }
                var fuente = !string.IsNullOrWhiteSpace(sourceName) ? sourceName : "Medio de Pádel";

                var pubDate = art.TryGetProperty("pubDate", out var pdProp) ? pdProp.GetString() : null;
                var fecha = !string.IsNullOrWhiteSpace(pubDate) ? pubDate : DateTimeOffset.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");

                // Categoría: primer valor de category si es array, o string
                var categoria = "Pádel";
                if (art.TryGetProperty("category", out var catProp))
                {
                    if (catProp.ValueKind == JsonValueKind.Array && catProp.GetArrayLength() > 0)
                    {
                        var firstCat = catProp[0].GetString();
                        if (!string.IsNullOrWhiteSpace(firstCat))
                        {
                            categoria = Capitalizar(firstCat);
                        }
                    }
                    else if (catProp.ValueKind == JsonValueKind.String)
                    {
                        var singleCat = catProp.GetString();
                        if (!string.IsNullOrWhiteSpace(singleCat))
                        {
                            categoria = Capitalizar(singleCat);
                        }
                    }
                }

                // Clasificación de sección por coincidencia de palabras clave
                var seccion = AsignarSeccion(title, description);

                normalizedList.Add(new NoticiaNormalizadaDto(
                    Id: id,
                    Titulo: title.Trim(),
                    Bajada: bajada,
                    Imagen: imageUrl,
                    Link: link.Trim(),
                    Fuente: fuente,
                    Fecha: fecha,
                    Categoria: categoria,
                    Seccion: seccion,
                    Destacada: false
                ));
            }

            // Si tras el filtrado estricto quedan pocas noticias (menos de 6),
            // complementamos con noticias de respaldo garantizadas 100% de pádel para mantener el diseño completo
            if (normalizedList.Count < 6)
            {
                foreach (var fallback in FallbackNoticias)
                {
                    var normFallbackTitle = fallback.Titulo.Trim().ToLowerInvariant();
                    if (!seenTitles.Contains(normFallbackTitle))
                    {
                        seenTitles.Add(normFallbackTitle);
                        normalizedList.Add(fallback);
                        if (normalizedList.Count >= 6)
                        {
                            break;
                        }
                    }
                }
            }

            if (normalizedList.Count == 0)
            {
                _logger.LogWarning("[NoticiasService] Ningún artículo válido tras filtrado. Retornando últimas noticias congeladas.");
                return ObtenerNoticiasCongeladas();
            }

            // Marcar como destacada la nota más reciente que tenga imagen
            var primerConImagenIndex = normalizedList.FindIndex(n => !string.IsNullOrWhiteSpace(n.Imagen));
            if (primerConImagenIndex >= 0)
            {
                var destacada = normalizedList[primerConImagenIndex] with { Destacada = true };
                normalizedList[primerConImagenIndex] = destacada;
            }
            else
            {
                // Si ninguna tiene imagen, marcar la primera
                normalizedList[0] = normalizedList[0] with { Destacada = true };
            }

            // Guardar noticias exitosas congeladas para resistir futuras caídas o límite de cuota
            GuardarNoticiasCongeladas(normalizedList);
            _limiteCreditosAlcanzadoHasta = null;

            // Guardar en caché ~30 minutos
            _memoryCache.Set(CacheKey, normalizedList, TimeSpan.FromMinutes(30));
            _logger.LogInformation("[NoticiasService] {Count} noticias congeladas y cacheadas exitosamente por 30 minutos.", normalizedList.Count);

            return normalizedList;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[NoticiasService] Error inesperado al consultar NewsData.io. Retornando últimas noticias congeladas.");
            return ObtenerNoticiasCongeladas();
        }
    }

    private static void ActivarLimiteCreditos(string motivo)
    {
        // Los créditos de NewsData.io se restablecen a las 00:00 UTC de cada día
        var proximoReinicioUtc = DateTimeOffset.UtcNow.Date.AddDays(1);
        _limiteCreditosAlcanzadoHasta = proximoReinicioUtc;
        Console.WriteLine($"[NoticiasService] AVISO: {motivo}. Modo congelado activado hasta {proximoReinicioUtc:u} para evitar consumo adicional de créditos.");
    }

    private static bool EsErrorDeLimiteCreditos(JsonElement root)
    {
        if (root.TryGetProperty("results", out var resultsProp) && resultsProp.ValueKind == JsonValueKind.Object)
        {
            var msg = resultsProp.TryGetProperty("message", out var m) ? m.GetString() : string.Empty;
            var code = resultsProp.TryGetProperty("code", out var c) ? c.GetString() : string.Empty;
            var combined = $"{code} {msg}".ToLowerInvariant();

            return combined.Contains("usagelimit") || 
                   combined.Contains("limit") || 
                   combined.Contains("credit") || 
                   combined.Contains("quota") ||
                   combined.Contains("exceeded");
        }
        return false;
    }

    private static IReadOnlyList<NoticiaNormalizadaDto> ObtenerNoticiasCongeladas()
    {
        lock (_syncLock)
        {
            if (_noticiasCongeladas != null && _noticiasCongeladas.Count > 0)
            {
                return _noticiasCongeladas;
            }

            try
            {
                if (File.Exists(FrozenNewsFilePath))
                {
                    var json = File.ReadAllText(FrozenNewsFilePath);
                    var deserialized = JsonSerializer.Deserialize<List<NoticiaNormalizadaDto>>(json);
                    if (deserialized != null && deserialized.Count > 0)
                    {
                        _noticiasCongeladas = deserialized;
                        return _noticiasCongeladas;
                    }
                }
            }
            catch
            {
                // Silencioso, pasa a fallback
            }

            return FallbackNoticias;
        }
    }

    private static void GuardarNoticiasCongeladas(IReadOnlyList<NoticiaNormalizadaDto> noticias)
    {
        lock (_syncLock)
        {
            _noticiasCongeladas = noticias;
            try
            {
                var json = JsonSerializer.Serialize(noticias, new JsonSerializerOptions { WriteIndented = true });
                File.WriteAllText(FrozenNewsFilePath, json);
            }
            catch
            {
                // No crítico si el disco falla
            }
        }
    }

    private static string RecortarBajada(string? texto, int maxChars = 160)
    {
        if (string.IsNullOrWhiteSpace(texto))
        {
            return "Crónica y actualidad del pádel profesional, equipamiento y competición internacional.";
        }

        var limpio = texto.Trim().Replace("\r\n", " ").Replace("\n", " ");
        if (limpio.Length <= maxChars)
        {
            return limpio;
        }

        var corte = limpio[..maxChars];
        var ultimoEspacio = corte.LastIndexOf(' ');
        if (ultimoEspacio > maxChars - 30)
        {
            corte = corte[..ultimoEspacio];
        }

        return corte.TrimEnd('.', ',', ';', ':') + "...";
    }

    private static string AsignarSeccion(string titulo, string? bajada)
    {
        var corpus = $"{titulo} {bajada}".ToLowerInvariant();

        if (ContieneAlguna(corpus, "circuito", "world padel tour", "wpt", "premier padel", "fip", "federacion", "federación", "ranking", "asociacion", "asociación"))
        {
            return "Circuito profesional";
        }

        if (ContieneAlguna(corpus, "torneo", "torneos", "resultado", "resultados", "final", "semifinal", "cuadro", "master", "open", "major", "campeonato", "p1", "p2", "pista central"))
        {
            return "Torneos y resultados";
        }

        if (ContieneAlguna(corpus, "tapia", "coello", "galan", "galán", "lebron", "lebrón", "chingotto", "stupa", "stupaczuk", "di nenno", "paquito", "navarro", "ari sanchez", "ari sánchez", "paula josemaria", "paula josemaría", "bea gonzalez", "bea gonzález", "triay", "delfi brea", "jugador", "jugadora", "pareja"))
        {
            return "Jugadores";
        }

        if (ContieneAlguna(corpus, "pala", "palas", "carbono", "goma", "eva", "nucleo", "núcleo", "zapatilla", "zapatillas", "overgrip", "pelota", "tubular", "balance", "dureza", "material", "test"))
        {
            return "Material y palas";
        }

        if (ContieneAlguna(corpus, "entrevista", "entrevistas", "mano a mano", "declaro", "declaró", "confiesa", "afirma", "hablamos con", "declaraciones", "charla"))
        {
            return "Entrevistas";
        }

        if (ContieneAlguna(corpus, "opinion", "opinión", "columna", "analisis", "análisis", "editorial", "debate", "tactica", "táctica", "tactico", "táctico"))
        {
            return "Opinión";
        }

        return "General";
    }

    /// <summary>
    /// Filtra estrictamente artículos para asegurar que traten sobre pádel (deporte, jugadores, palas, circuito).
    /// Descarta falsos positivos de NewsData como fútbol, fútbol playa, surf de pala, política o inmuebles.
    /// </summary>
    private static bool EsNoticiaDePadel(string title, string? description, List<string>? keywords)
    {
        if (string.IsNullOrWhiteSpace(title))
        {
            return false;
        }

        var lowerTitle = title.ToLowerInvariant();
        var lowerDesc = (description ?? string.Empty).ToLowerInvariant();
        var kwText = keywords != null ? string.Join(" ", keywords).ToLowerInvariant() : string.Empty;
        var fullText = $"{lowerTitle} {lowerDesc} {kwText}";

        // 1. Descartar falsos positivos evidentes (otros deportes, futbol, política o inmuebles)
        if (ContieneAlguna(fullText, "fútbol playa", "futbol playa", "beach soccer", "paddle surf", "padel surf", "stand up paddle", "stand-up paddle"))
        {
            return false;
        }

        if (ContieneAlguna(lowerTitle, "a la venta", "chalet", "finca de caza", "piscina y pista", "inmobiliaria", "promoción de viviendas", "promocion de viviendas"))
        {
            return false;
        }

        if (ContieneAlguna(lowerTitle, "hobbies contra el estrés", "hobbies contra el estres", "estudié una fp", "estudie una fp", "futbolista", "dictador mubarak", "alcalde", "alcaldesa", "ayuntamiento") 
            && !ContieneAlguna(lowerTitle, "pádel", "padel"))
        {
            return false;
        }

        if (lowerTitle.StartsWith("el pickleball") && !ContieneAlguna(lowerTitle, "pádel", "padel"))
        {
            return false;
        }

        // 2. Indicadores positivos fuertes en título o keywords
        string[] terminosPadel = 
        {
            "pádel", "padel", "premier padel", "world padel tour", "wpt", "padelfip",
            "rotterdam p2", "madrid p1", "paris major", "qatar major", "milano p1", "hexagone cup", "pro padel league",
            "pala de pádel", "pala de padel", "palas de pádel", "palas de padel", "pista de pádel", "pista de padel",
            "tapia", "coello", "galán", "galan", "lebrón", "lebron", "chingotto", "stupaczuk", "stupa", "di nenno",
            "paquito navarro", "belasteguín", "belasteguin", "sanyo", "javi leal", "fran guerrero", "mike yanguas",
            "coki nieto", "jon sanz", "gemma triay", "paula josemaría", "paula josemaria", "ari sánchez", "ari sanchez",
            "delfi brea", "claudia fernández", "claudia fernandez", "marta ortega", "bea gonzález", "bea gonzalez"
        };

        if (ContieneAlguna(lowerTitle, terminosPadel))
        {
            return true;
        }

        if (ContieneAlguna(kwText, terminosPadel))
        {
            return true;
        }

        // 3. Si el término de pádel está en la descripción, validar contexto deportivo en el titular
        if (ContieneAlguna(lowerDesc, terminosPadel))
        {
            if (ContieneAlguna(lowerTitle, "cuadro", "final", "semifinal", "partido", "victoria", "campeón", "campeon", "circuito", "jugador", "jugadora", "pareja", "set", "tie-break", "torneo"))
            {
                return true;
            }
        }

        return false;
    }

    private static bool ContieneAlguna(string corpus, params string[] keywords)
    {
        foreach (var kw in keywords)
        {
            if (corpus.Contains(kw, StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }
        }
        return false;
    }

    private static string Capitalizar(string texto)
    {
        if (string.IsNullOrWhiteSpace(texto)) return "Pádel";
        return char.ToUpperInvariant(texto[0]) + texto[1..].ToLowerInvariant();
    }

    private const string PadelTelemetryCacheKey = "PALANTICA_PADEL_TELEMETRY";

    /// <summary>
    /// Obtiene telemetría oficial de rankings y torneos FIP desde PadelAPI (padelapi.org) con caché de 1 hora.
    /// </summary>
    public async Task<PadelTelemetryDto> GetPadelTelemetryAsync(CancellationToken cancellationToken = default)
    {
        if (_memoryCache.TryGetValue(PadelTelemetryCacheKey, out PadelTelemetryDto? cached) && cached != null)
        {
            return cached;
        }

        var fallback = new PadelTelemetryDto(
            Rankings: new PadelRankingsSummaryDto(
                Date: "2026-09-28",
                TopPlayers: new List<PadelTopPlayerDto>
                {
                    new(1, "Agustín Tapia", "AR", 20383),
                    new(1, "Arturo Coello", "ES", 20383),
                    new(3, "Alejandro Galán", "ES", 18006),
                    new(3, "Federico Chingotto", "AR", 18006),
                }
            ),
            NextTournament: new UpcomingTournamentDto(
                Name: "Kuwait P1 2026",
                Location: "Kuwait City",
                StartDate: "2026-10-26",
                EndDate: "2026-11-01",
                Level: "P1"
            ),
            TotalTournaments: 15
        );

        var token = _configuration["PADEL_API"] ?? Environment.GetEnvironmentVariable("PADEL_API");
        if (string.IsNullOrWhiteSpace(token))
        {
            return fallback;
        }

        try
        {
            var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(10);
            client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
            client.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));

            var rankingsTask = client.GetAsync("https://padelapi.org/api/rankings", cancellationToken);
            var tournamentsTask = client.GetAsync("https://padelapi.org/api/tournaments", cancellationToken);

            await Task.WhenAll(rankingsTask, tournamentsTask);

            var rankingsResp = await rankingsTask;
            var tournamentsResp = await tournamentsTask;

            if (!rankingsResp.IsSuccessStatusCode || !tournamentsResp.IsSuccessStatusCode)
            {
                return fallback;
            }

            var rankingsJson = await rankingsResp.Content.ReadAsStringAsync(cancellationToken);
            var tournamentsJson = await tournamentsResp.Content.ReadAsStringAsync(cancellationToken);

            using var docR = JsonDocument.Parse(rankingsJson);
            using var docT = JsonDocument.Parse(tournamentsJson);

            var playersList = new List<PadelTopPlayerDto>();
            string rankingDate = DateTimeOffset.UtcNow.ToString("yyyy-MM-dd");

            if (docR.RootElement.TryGetProperty("data", out var rData) && rData.ValueKind == JsonValueKind.Array)
            {
                foreach (var p in rData.EnumerateArray().Take(6))
                {
                    var r = p.TryGetProperty("ranking", out var rProp) ? rProp.GetInt32() : 1;
                    var name = p.TryGetProperty("name", out var nProp) ? nProp.GetString() ?? "" : "";
                    var country = p.TryGetProperty("nationality", out var cProp) ? cProp.GetString() ?? "ES" : "ES";
                    var pts = p.TryGetProperty("points", out var ptProp) ? ptProp.GetInt32() : 0;
                    if (p.TryGetProperty("date", out var dProp))
                    {
                        rankingDate = dProp.GetString() ?? rankingDate;
                    }
                    playersList.Add(new PadelTopPlayerDto(r, name, country, pts));
                }
            }

            UpcomingTournamentDto? nextTournament = null;
            int totalTourneys = 0;

            if (docT.RootElement.TryGetProperty("data", out var tData) && tData.ValueKind == JsonValueKind.Array)
            {
                var today = DateTimeOffset.UtcNow.ToString("yyyy-MM-dd");
                var list = tData.EnumerateArray().ToList();
                totalTourneys = list.Count;

                var upcoming = list
                    .Where(t => t.TryGetProperty("start_date", out var sdp) && string.Compare(sdp.GetString(), today, StringComparison.Ordinal) >= 0)
                    .OrderBy(t => t.GetProperty("start_date").GetString())
                    .FirstOrDefault();

                if (upcoming.ValueKind == JsonValueKind.Undefined && list.Count > 0)
                {
                    upcoming = list[0];
                }

                if (upcoming.ValueKind != JsonValueKind.Undefined)
                {
                    var tName = upcoming.TryGetProperty("name", out var np) ? np.GetString() ?? "" : "";
                    var tLoc = upcoming.TryGetProperty("location", out var lp) ? lp.GetString() ?? "" : "";
                    var tStart = upcoming.TryGetProperty("start_date", out var stp) ? stp.GetString() ?? "" : "";
                    var tEnd = upcoming.TryGetProperty("end_date", out var etp) ? etp.GetString() : null;
                    var tLevel = upcoming.TryGetProperty("level", out var lvp) ? lvp.GetString()?.ToUpperInvariant() ?? "OFICIAL" : "OFICIAL";

                    nextTournament = new UpcomingTournamentDto(tName, tLoc, tStart, tEnd, tLevel);
                }
            }

            var result = new PadelTelemetryDto(
                Rankings: new PadelRankingsSummaryDto(rankingDate, playersList.Count > 0 ? playersList : fallback.Rankings.TopPlayers),
                NextTournament: nextTournament ?? fallback.NextTournament,
                TotalTournaments: totalTourneys > 0 ? totalTourneys : fallback.TotalTournaments
            );

            _memoryCache.Set(PadelTelemetryCacheKey, result, TimeSpan.FromHours(1));
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[NoticiasService] Error al consultar PadelAPI. Retornando fallback.");
            return fallback;
        }
    }
}

