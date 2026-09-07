namespace Palantica.Api.Features.Palas;

/// <summary>
/// Representa a un modelo de pala de pádel en la base de datos de Palantica.
/// </summary>
public sealed class Pala
{
    public int Id { get; set; }
    public int MarcaId { get; set; }
    public string Modelo { get; set; } = string.Empty;
    public string Forma { get; set; } = string.Empty; // Redonda, Lagrima, Diamante
    public int BalanceMm { get; set; } // 250 a 280 mm
    public int PesoMin { get; set; } = 355;
    public int PesoMax { get; set; } = 375;
    public string MaterialNucleo { get; set; } = string.Empty;
    public string MaterialCaras { get; set; } = string.Empty;
    public string SuperficieRugosa { get; set; } = "Arenado";
    public string EstacionOptima { get; set; } = "TodoAno";
    public decimal PrecioReferencia { get; set; }
    public string MonedaPrecio { get; set; } = "EUR";
    public string FuentePrecio { get; set; } = "PVP Oficial Recomendado";
    public float PuntuacionGeneral { get; set; } = 0.0f;
    public float DurezaPromedio { get; set; } = 5.0f;
    public float PotenciaPromedio { get; set; } = 5.0f;
    public float ControlPromedio { get; set; } = 5.0f;
    public float SalidaBolaPromedio { get; set; } = 5.0f;
    public float ManiobrabilidadPromedio { get; set; } = 5.0f;
    public float PuntoDulcePromedio { get; set; } = 5.0f;
    public float ConfortPromedio { get; set; } = 5.0f;
    public string? ImagenUrl { get; set; }
    public int AnoLanzamiento { get; set; } = 2025;
    public string? JugadorPro { get; set; }
    public string? Descripcion { get; set; }
    public int TotalResenas { get; set; }
    public int TotalVotos { get; set; }
    public DateTimeOffset FechaCreacion { get; set; } = DateTimeOffset.UtcNow;
}
