namespace Palantica.Api.Features.Noticias;

/// <summary>
/// Servicio de agregación y suministro de noticias del circuito profesional y tecnología de palas de pádel.
/// </summary>
public sealed class NoticiasService
{
    private static readonly IReadOnlyList<NoticiaResponse> NoticiasCuradas = new List<NoticiaResponse>
    {
        new(
            Id: "noticia-1",
            Titulo: "Agustín Tapia estrena la nueva evolución del carbono aluminizado en su AT10 18K",
            Resumen: "El revés argentino analizó el rendimiento del nuevo balance y la densidad del núcleo MLD Black EVA para la temporada 2026.",
            Contenido: "En declaraciones recientes en el circuito internacional, Agustín Tapia destacó la respuesta en pista de la última iteración de su pala insignia. La combinación de carbono 18K aluminizado junto con el núcleo MLD de doble densidad permite una transición instantánea entre defensa con toque y remates a máxima potencia.",
            Categoria: "Material y Análisis",
            Fuente: "Palantica Tech Lab",
            UrlFuente: "https://noxsport.es",
            ImagenUrl: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80",
            FechaPublicacion: DateTimeOffset.UtcNow.AddHours(-3),
            TiempoLecturaMinutos: 4,
            Tags: new[] { "Nox", "Agustín Tapia", "AT10", "Carbono 18K" }
        ),
        new(
            Id: "noticia-2",
            Titulo: "La guerra de durezas: ¿Por qué los profesionales prefieren tacto seco en verano?",
            Resumen: "El comportamiento térmico de la goma EVA y cómo la temperatura exterior modifica el punto dulce y la salida de bola.",
            Contenido: "Con temperaturas superiores a 28°C, las gomas blandas colapsan prematuramente absorbiendo la energía del impacto. Un núcleo de alta densidad (EVA Hard / Black EVA) mantiene la rigidez estructural y devuelve la precisión milimétrica en bandejas y víboras.",
            Categoria: "Física y Rendimiento",
            Fuente: "Padel Intelligence",
            UrlFuente: "https://padelmagazine.fr",
            ImagenUrl: "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800&auto=format&fit=crop&q=80",
            FechaPublicacion: DateTimeOffset.UtcNow.AddHours(-12),
            TiempoLecturaMinutos: 6,
            Tags: new[] { "Dureza", "Verano", "Termodinámica", "EVA Hard" }
        ),
        new(
            Id: "noticia-3",
            Titulo: "Premier Padel: Resumen de finales y estadísticas de impacto en pista rápida",
            Resumen: "Análisis de velocidad de bola y porcentaje de winners desde el fondo con palas de formato diamante vs lágrima.",
            Contenido: "Las estadísticas del último Master confirman una tendencia hacia balances medios-altos en jugadores de derecha con perfil constructor, reduciendo el error no forzado en un 14% respecto a temporadas anteriores.",
            Categoria: "Competición",
            Fuente: "Circuito Mundial",
            UrlFuente: "https://premierpadel.com",
            ImagenUrl: "https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?w=800&auto=format&fit=crop&q=80",
            FechaPublicacion: DateTimeOffset.UtcNow.AddDays(-1),
            TiempoLecturaMinutos: 5,
            Tags: new[] { "Premier Padel", "Estadísticas", "Diamante", "Balance" }
        ),
        new(
            Id: "noticia-4",
            Titulo: "Innovación en rugosidades: Relieve 3D moldeado vs Arenado de sílice",
            Resumen: "Estudio de durabilidad del efecto en la bola tras más de 40 horas de juego intensivo en pista de cristal.",
            Contenido: "Mientras que los acabados arenados aportan un agarre supremo durante los primeros 2 meses, los relieves integrados en el molde del carbono ofrecen una vida útil permanente sin pérdida de tracción en golpes cortados.",
            Categoria: "Tecnología",
            Fuente: "Palantica Lab",
            UrlFuente: "https://bullpadel.com",
            ImagenUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80",
            FechaPublicacion: DateTimeOffset.UtcNow.AddDays(-2),
            TiempoLecturaMinutos: 4,
            Tags: new[] { "Rugoso 3D", "Arenado", "Efecto", "Durabilidad" }
        )
    };

    /// <summary>
    /// Retorna las noticias más recientes del mundo del pádel.
    /// </summary>
    public Task<IReadOnlyList<NoticiaResponse>> GetNoticiasAsync(int limit = 10, CancellationToken cancellationToken = default)
    {
        var result = NoticiasCuradas.Take(limit).ToList().AsReadOnly();
        return Task.FromResult<IReadOnlyList<NoticiaResponse>>(result);
    }
}
