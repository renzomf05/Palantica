using Palantica.Api.Common.Database;
using Palantica.Api.Common.Pagination;

namespace Palantica.Api.Features.Padelgram;

/// <summary>
/// Repositorio de acceso a datos para Padelgram conectado a Supabase.
/// </summary>
public sealed class PadelgramRepository
{
    private readonly SupabaseRestClient client;

    public PadelgramRepository(SupabaseRestClient client)
    {
        this.client = client ?? throw new ArgumentNullException(nameof(client));
    }

    private sealed record UsuarioJoined(string Nombre, string? AvatarUrl);
    private sealed record MarcaJoined(string Nombre);
    private sealed record PalaJoined(string Modelo, MarcaJoined? Marcas = null);

    private sealed record PadelgramRawRecord(
        int Id,
        int UsuarioId,
        int PalaId,
        string ImagenUrl,
        string? Descripcion,
        string? Ubicacion,
        int LikesCount,
        DateTimeOffset FechaPublicacion,
        UsuarioJoined? Usuarios = null,
        PalaJoined? Palas = null
    );

    public async Task<PagedList<PadelgramPostResponse>> GetFeedAsync(
        int page = 1,
        int pageSize = 12,
        int? palaId = null,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);
        var offset = (page - 1) * pageSize;

        var query = "select=*,usuarios(nombre,avatar_url),palas(modelo,marcas(nombre))&order=fecha_publicacion.desc";
        if (palaId.HasValue)
        {
            query += $"&pala_id=eq.{palaId.Value}";
        }
        query += $"&limit={pageSize}&offset={offset}";

        var (rawItems, totalCount) = await client.GetListAsync<PadelgramRawRecord>("padelgram_posts", query, cancellationToken);
        var list = rawItems.Select(mapToResponse).ToList();

        return new PagedList<PadelgramPostResponse>(list, page, pageSize, totalCount);
    }

    public async Task<PadelgramPostResponse> CreatePostAsync(
        int userId,
        PadelgramCreateRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);
        if (userId <= 0) throw new ArgumentOutOfRangeException(nameof(userId));

        var payload = new
        {
            usuario_id = userId,
            pala_id = request.PalaId,
            imagen_url = request.ImagenUrl.Trim(),
            descripcion = request.Descripcion?.Trim(),
            ubicacion = request.Ubicacion?.Trim(),
            likes_count = 0
        };

        var created = await client.InsertAsync<PadelgramRawRecord>("padelgram_posts", payload, cancellationToken);
        var fullRecord = await client.GetSingleAsync<PadelgramRawRecord>("padelgram_posts", $"id=eq.{created.Id}&select=*,usuarios(nombre,avatar_url),palas(modelo,marcas(nombre))", cancellationToken);

        return mapToResponse(fullRecord ?? created);
    }

    public async Task<int> ToggleLikeAsync(int postId, CancellationToken cancellationToken = default)
    {
        if (postId <= 0) throw new ArgumentOutOfRangeException(nameof(postId));

        var current = await client.GetSingleAsync<PadelgramRawRecord>("padelgram_posts", $"id=eq.{postId}&select=likes_count", cancellationToken);
        var newCount = (current?.LikesCount ?? 0) + 1;

        await client.UpdateAsync<dynamic>("padelgram_posts", $"id=eq.{postId}", new { likes_count = newCount }, cancellationToken);
        return newCount;
    }

    private static PadelgramPostResponse mapToResponse(PadelgramRawRecord r) => new(
        Id: r.Id,
        UsuarioId: r.UsuarioId,
        UsuarioNombre: r.Usuarios?.Nombre ?? "Jugador",
        UsuarioAvatarUrl: r.Usuarios?.AvatarUrl,
        PalaId: r.PalaId,
        PalaModelo: r.Palas?.Modelo ?? "Pala",
        PalaMarca: r.Palas?.Marcas?.Nombre ?? "Marca",
        ImagenUrl: r.ImagenUrl,
        Descripcion: r.Descripcion,
        Ubicacion: r.Ubicacion,
        LikesCount: r.LikesCount,
        FechaPublicacion: r.FechaPublicacion
    );
}
