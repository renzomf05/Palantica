using Palantica.Api.Common.Database;
using Palantica.Api.Common.Pagination;

namespace Palantica.Api.Features.Resenas;

/// <summary>
/// Repositorio de acceso a datos para reseñas con actualización de métricas en Supabase.
/// </summary>
public sealed class ResenaRepository
{
    private readonly SupabaseRestClient client;

    public ResenaRepository(SupabaseRestClient client)
    {
        this.client = client ?? throw new ArgumentNullException(nameof(client));
    }

    private sealed record UsuarioJoined(string Nombre, string NivelJuego, string? AvatarUrl);
    private sealed record ResenaRawRecord(
        int Id,
        int PalaId,
        int UsuarioId,
        int Puntuacion,
        string Titulo,
        string Contenido,
        string LadoPista,
        string TiempoUso,
        DateTimeOffset FechaPublicacion,
        UsuarioJoined? Usuarios = null
    );

    public async Task<PagedList<ResenaResponse>> GetByPalaIdAsync(
        int palaId,
        int page = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        if (palaId <= 0) throw new ArgumentOutOfRangeException(nameof(palaId));

        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);
        var offset = (page - 1) * pageSize;

        var query = $"pala_id=eq.{palaId}&select=*,usuarios(nombre,nivel_juego,avatar_url)&order=fecha_publicacion.desc&limit={pageSize}&offset={offset}";
        var (items, totalCount) = await client.GetListAsync<ResenaRawRecord>("resenas", query, cancellationToken);

        var list = items.Select(r => new ResenaResponse(
            Id: r.Id,
            PalaId: r.PalaId,
            UsuarioId: r.UsuarioId,
            UsuarioNombre: r.Usuarios?.Nombre ?? "Jugador",
            UsuarioNivelJuego: r.Usuarios?.NivelJuego ?? "Intermedio",
            UsuarioAvatarUrl: r.Usuarios?.AvatarUrl,
            Puntuacion: r.Puntuacion,
            Titulo: r.Titulo,
            Contenido: r.Contenido,
            LadoPista: r.LadoPista,
            TiempoUso: r.TiempoUso,
            FechaPublicacion: r.FechaPublicacion
        )).ToList();

        return new PagedList<ResenaResponse>(list, page, pageSize, totalCount);
    }

    public async Task<ResenaResponse> CreateAsync(
        int palaId,
        int userId,
        ResenaCreateRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);
        if (palaId <= 0) throw new ArgumentOutOfRangeException(nameof(palaId));
        if (userId <= 0) throw new ArgumentOutOfRangeException(nameof(userId));

        // 1. Verificar duplicado
        var existente = await client.GetSingleAsync<ResenaRawRecord>("resenas", $"pala_id=eq.{palaId}&usuario_id=eq.{userId}", cancellationToken);
        if (existente is not null)
        {
            throw new InvalidOperationException("El usuario ya ha publicado una reseña para este modelo de pala.");
        }

        // 2. Insertar reseña
        var payload = new
        {
            pala_id = palaId,
            usuario_id = userId,
            puntuacion = request.Puntuacion,
            titulo = request.Titulo.Trim(),
            contenido = request.Contenido.Trim(),
            lado_pista = request.LadoPista ?? "Reves",
            tiempo_uso = request.TiempoUso ?? "1 mes"
        };

        var inserted = await client.InsertAsync<ResenaRawRecord>("resenas", payload, cancellationToken);

        // 3. Regla Multientidad: Recalcular PuntuacionGeneral y TotalResenas en palas
        var (allResenas, _) = await client.GetListAsync<ResenaRawRecord>("resenas", $"pala_id=eq.{palaId}&select=puntuacion", cancellationToken);
        var totalCount = allResenas.Count;
        var avgPuntuacion = totalCount > 0 ? (float)Math.Round(allResenas.Average(r => r.Puntuacion), 1) : 0.0f;

        await client.UpdateAsync<dynamic>("palas", $"id=eq.{palaId}", new
        {
            total_resenas = totalCount,
            puntuacion_general = avgPuntuacion
        }, cancellationToken);

        var usuario = await client.GetSingleAsync<UsuarioJoined>("usuarios", $"id=eq.{userId}&select=nombre,nivel_juego,avatar_url", cancellationToken);

        return new ResenaResponse(
            Id: inserted.Id,
            PalaId: palaId,
            UsuarioId: userId,
            UsuarioNombre: usuario?.Nombre ?? "Jugador",
            UsuarioNivelJuego: usuario?.NivelJuego ?? "Intermedio",
            UsuarioAvatarUrl: usuario?.AvatarUrl,
            Puntuacion: request.Puntuacion,
            Titulo: request.Titulo.Trim(),
            Contenido: request.Contenido.Trim(),
            LadoPista: request.LadoPista ?? "Reves",
            TiempoUso: request.TiempoUso ?? "1 mes",
            FechaPublicacion: inserted.FechaPublicacion
        );
    }
}
