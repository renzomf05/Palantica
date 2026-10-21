using Palantica.Api.Common.Database;

namespace Palantica.Api.Features.Paletero;

/// <summary>
/// Repositorio de acceso a datos para el paletero conectado a Supabase.
/// </summary>
public sealed class PaleteroRepository
{
    private readonly SupabaseRestClient client;

    public PaleteroRepository(SupabaseRestClient client)
    {
        this.client = client ?? throw new ArgumentNullException(nameof(client));
    }

    private sealed record MarcaName(string Nombre);
    private sealed record PalaJoined(
        string Modelo,
        string Forma,
        string? ImagenUrl,
        float PuntuacionGeneral,
        float DurezaPromedio,
        decimal PrecioReferencia,
        MarcaName? Marcas = null
    );

    private sealed record PaleteroRawRecord(
        int Id,
        int UsuarioId,
        int PalaId,
        string Categoria,
        string? Notas,
        DateTimeOffset FechaRegistro,
        PalaJoined? Palas = null
    );

    public async Task<MiPaleteroGroupedResponse> GetMiPaleteroAsync(int userId, CancellationToken cancellationToken = default)
    {
        if (userId <= 0) throw new ArgumentOutOfRangeException(nameof(userId));

        var query = $"usuario_id=eq.{userId}&select=*,palas(*,marcas(nombre))&order=fecha_registro.desc";
        var (rawItems, _) = await client.GetListAsync<PaleteroRawRecord>("paletero_items", query, cancellationToken);

        var allItems = rawItems.Select(mapToResponse).ToList();

        return new MiPaleteroGroupedResponse(
            UsandoActualmente: allItems.Where(i => i.Categoria.Equals("Usando actualmente", StringComparison.OrdinalIgnoreCase)).ToList().AsReadOnly(),
            EnElPaletero: allItems.Where(i => i.Categoria.Equals("En el paletero", StringComparison.OrdinalIgnoreCase)).ToList().AsReadOnly(),
            PalasQueTuve: allItems.Where(i => i.Categoria.Equals("Palas que tuve", StringComparison.OrdinalIgnoreCase)).ToList().AsReadOnly(),
            PalasQueQuiero: allItems.Where(i => i.Categoria.Equals("Palas que quiero", StringComparison.OrdinalIgnoreCase)).ToList().AsReadOnly()
        );
    }

    public async Task<PaleteroItemResponse> AddItemAsync(int userId, PaleteroAddRequest request, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);
        if (userId <= 0) throw new ArgumentOutOfRangeException(nameof(userId));

        var payload = new
        {
            usuario_id = userId,
            pala_id = request.PalaId,
            categoria = request.Categoria.Trim(),
            notas = request.Notas?.Trim()
        };

        var filter = $"usuario_id=eq.{userId}&pala_id=eq.{request.PalaId}&categoria=eq.{Uri.EscapeDataString(request.Categoria.Trim())}";
        var existente = await client.GetSingleAsync<PaleteroRawRecord>("paletero_items", filter, cancellationToken);

        PaleteroRawRecord record;
        if (existente is not null)
        {
            record = (await client.UpdateAsync<PaleteroRawRecord>("paletero_items", filter, new { notas = request.Notas?.Trim() }, cancellationToken))!;
        }
        else
        {
            record = await client.InsertAsync<PaleteroRawRecord>("paletero_items", payload, cancellationToken);
        }

        if (request.Categoria.Equals("Usando actualmente", StringComparison.OrdinalIgnoreCase))
        {
            try
            {
                await client.UpdateAsync<dynamic>("paletero_items", $"usuario_id=eq.{userId}", new { es_activa = false }, cancellationToken);
                await client.UpdateAsync<dynamic>("paletero_items", $"id=eq.{record.Id}", new { es_activa = true }, cancellationToken);
            }
            catch { }

            await client.UpdateAsync<dynamic>("usuarios", $"id=eq.{userId}", new { pala_activa_id = request.PalaId }, cancellationToken);
        }

        var fullRecord = await client.GetSingleAsync<PaleteroRawRecord>("paletero_items", $"id=eq.{record.Id}&select=*,palas(*,marcas(nombre))", cancellationToken);
        return mapToResponse(fullRecord ?? record);
    }

    public async Task<bool> RemoveItemAsync(int userId, int palaId, string categoria, CancellationToken cancellationToken = default)
    {
        if (userId <= 0 || palaId <= 0) return false;

        var filter = $"usuario_id=eq.{userId}&pala_id=eq.{palaId}&categoria=eq.{Uri.EscapeDataString(categoria)}";
        return await client.DeleteAsync("paletero_items", filter, cancellationToken);
    }

    private static PaleteroItemResponse mapToResponse(PaleteroRawRecord r) => new(
        Id: r.Id,
        UsuarioId: r.UsuarioId,
        PalaId: r.PalaId,
        PalaModelo: r.Palas?.Modelo ?? "Modelo",
        PalaMarca: r.Palas?.Marcas?.Nombre ?? "Marca",
        PalaForma: r.Palas?.Forma ?? "Lagrima",
        PalaImagenUrl: r.Palas?.ImagenUrl,
        PalaPuntuacionGeneral: r.Palas?.PuntuacionGeneral ?? 0.0f,
        PalaDurezaPromedio: r.Palas?.DurezaPromedio ?? 5.0f,
        PalaPrecioReferencia: r.Palas?.PrecioReferencia ?? 0.00m,
        Categoria: r.Categoria,
        Notas: r.Notas,
        FechaRegistro: r.FechaRegistro
    );
}
