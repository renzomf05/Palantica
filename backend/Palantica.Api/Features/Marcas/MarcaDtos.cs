namespace Palantica.Api.Features.Marcas;

/// <summary>
/// Contrato de respuesta para información pública de una marca.
/// </summary>
public sealed record MarcaResponse(
    int Id,
    string Nombre,
    string PaisOrigen,
    string? SitioWeb,
    string? LogoUrl,
    int TotalPalas
);
