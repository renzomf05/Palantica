namespace Palantica.Api.Features.Marcas;

/// <summary>
/// Representa a un fabricante oficial de palas de pádel en el catálogo de Palantica.
/// </summary>
public sealed class Marca
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string PaisOrigen { get; set; } = string.Empty;
    public string? SitioWeb { get; set; }
    public string? LogoUrl { get; set; }
    public DateTimeOffset FechaCreacion { get; set; } = DateTimeOffset.UtcNow;
}
