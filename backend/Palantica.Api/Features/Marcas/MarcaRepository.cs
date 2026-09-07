using Palantica.Api.Common.Database;

namespace Palantica.Api.Features.Marcas;

/// <summary>
/// Repositorio de acceso a datos para fabricantes de pádel conectado a Supabase.
/// </summary>
public sealed class MarcaRepository
{
    private readonly SupabaseRestClient client;

    public MarcaRepository(SupabaseRestClient client)
    {
        this.client = client ?? throw new ArgumentNullException(nameof(client));
    }

    private sealed record MarcaRecord(int Id, string Nombre, string PaisOrigen, string? SitioWeb, string? LogoUrl);

    public async Task<IReadOnlyList<MarcaResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var (marcas, _) = await client.GetListAsync<MarcaRecord>("marcas", "order=nombre.asc", cancellationToken);
        var (palas, _) = await client.GetListAsync<PalaMarcaCount>("palas", "select=marca_id", cancellationToken);

        var palasCount = palas.GroupBy(p => p.MarcaId).ToDictionary(g => g.Key, g => g.Count());

        return marcas.Select(m => new MarcaResponse(
            Id: m.Id,
            Nombre: m.Nombre,
            PaisOrigen: m.PaisOrigen,
            SitioWeb: m.SitioWeb,
            LogoUrl: m.LogoUrl,
            TotalPalas: palasCount.TryGetValue(m.Id, out var count) ? count : 0
        )).ToList().AsReadOnly();
    }

    public async Task<MarcaResponse?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        if (id <= 0) throw new ArgumentOutOfRangeException(nameof(id));

        var marca = await client.GetSingleAsync<MarcaRecord>("marcas", $"id=eq.{id}", cancellationToken);
        if (marca is null) return null;

        var (palas, _) = await client.GetListAsync<PalaMarcaCount>("palas", $"marca_id=eq.{id}&select=marca_id", cancellationToken);

        return new MarcaResponse(
            Id: marca.Id,
            Nombre: marca.Nombre,
            PaisOrigen: marca.PaisOrigen,
            SitioWeb: marca.SitioWeb,
            LogoUrl: marca.LogoUrl,
            TotalPalas: palas.Count
        );
    }

    private sealed record PalaMarcaCount(int MarcaId);
}
