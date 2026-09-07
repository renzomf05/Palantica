namespace Palantica.Api.Features.Noticias;

/// <summary>
/// Contrato DTO para una noticia del mundo del pádel profesional y equipamiento.
/// </summary>
public sealed record NoticiaResponse(
    string Id,
    string Titulo,
    string Resumen,
    string? Contenido,
    string Categoria,
    string Fuente,
    string? UrlFuente,
    string? ImagenUrl,
    DateTimeOffset FechaPublicacion,
    int TiempoLecturaMinutos,
    IReadOnlyList<string> Tags
);
