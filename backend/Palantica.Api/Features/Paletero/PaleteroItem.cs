namespace Palantica.Api.Features.Paletero;

/// <summary>
/// Representa un ítem registrado en el paletero o bolsa del jugador.
/// </summary>
public sealed class PaleteroItem
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public int PalaId { get; set; }
    public string Categoria { get; set; } = "Usando actualmente"; // 'Usando actualmente', 'En el paletero', 'Palas que tuve', 'Palas que quiero'
    public string? Notas { get; set; }
    public DateTimeOffset FechaRegistro { get; set; } = DateTimeOffset.UtcNow;
}
