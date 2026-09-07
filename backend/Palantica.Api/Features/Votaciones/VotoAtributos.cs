namespace Palantica.Api.Features.Votaciones;

/// <summary>
/// Representa un voto técnico individual de sensaciones y dureza sobre una pala.
/// </summary>
public sealed class VotoAtributos
{
    public int Id { get; set; }
    public int PalaId { get; set; }
    public int UsuarioId { get; set; }
    public int DurezaPercibida { get; set; } // 1 a 10
    public int Potencia { get; set; } // 1 a 10
    public int Control { get; set; } // 1 a 10
    public int SalidaBola { get; set; } // 1 a 10
    public int Maniobrabilidad { get; set; } // 1 a 10
    public int PuntoDulce { get; set; } // 1 a 10
    public int Confort { get; set; } // 1 a 10
    public string EstacionRecomendada { get; set; } = "TodoAno"; // Verano, Invierno, TodoAno
    public DateTimeOffset FechaVoto { get; set; } = DateTimeOffset.UtcNow;
}
