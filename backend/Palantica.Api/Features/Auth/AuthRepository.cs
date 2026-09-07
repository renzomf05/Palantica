using Palantica.Api.Common.Database;

namespace Palantica.Api.Features.Auth;

/// <summary>
/// Repositorio de acceso a datos para usuarios y autenticación conectado a Supabase.
/// </summary>
public sealed class AuthRepository
{
    private readonly SupabaseRestClient client;

    public AuthRepository(SupabaseRestClient client)
    {
        this.client = client ?? throw new ArgumentNullException(nameof(client));
    }

    private sealed record UsuarioRawRecord(
        int Id,
        string Email,
        string PasswordHash,
        string Nombre,
        string Rol,
        int? PalaActivaId,
        string NivelJuego,
        string LadoPistaPreferido,
        string? AvatarUrl,
        DateTimeOffset FechaRegistro
    );

    private sealed record PalaMarcaJoin(string Modelo, MarcaName? Marcas = null);
    private sealed record MarcaName(string Nombre);

    public async Task<Usuario?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(email);

        var raw = await client.GetSingleAsync<UsuarioRawRecord>(
            "usuarios",
            $"email=eq.{Uri.EscapeDataString(email.Trim().ToLowerInvariant())}",
            cancellationToken
        );

        return raw is null ? null : mapToUsuario(raw);
    }

    public async Task<Usuario?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        if (id <= 0) throw new ArgumentOutOfRangeException(nameof(id));

        var raw = await client.GetSingleAsync<UsuarioRawRecord>("usuarios", $"id=eq.{id}", cancellationToken);
        return raw is null ? null : mapToUsuario(raw);
    }

    public async Task<PerfilResponse?> GetPerfilCompletoAsync(int userId, CancellationToken cancellationToken = default)
    {
        if (userId <= 0) throw new ArgumentOutOfRangeException(nameof(userId));

        var raw = await client.GetSingleAsync<UsuarioRawRecord>("usuarios", $"id=eq.{userId}", cancellationToken);
        if (raw is null) return null;

        string? palaModelo = null;
        string? palaMarca = null;

        if (raw.PalaActivaId.HasValue)
        {
            var palaJoin = await client.GetSingleAsync<PalaMarcaJoin>("palas", $"id=eq.{raw.PalaActivaId.Value}&select=modelo,marcas(nombre)", cancellationToken);
            if (palaJoin is not null)
            {
                palaModelo = palaJoin.Modelo;
                palaMarca = palaJoin.Marcas?.Nombre;
            }
        }

        var (_, totalResenas) = await client.GetListAsync<dynamic>("resenas", $"usuario_id=eq.{userId}&select=id", cancellationToken);
        var (_, totalVotos) = await client.GetListAsync<dynamic>("votos_atributos", $"usuario_id=eq.{userId}&select=id", cancellationToken);
        var (_, totalPaletero) = await client.GetListAsync<dynamic>("paletero_items", $"usuario_id=eq.{userId}&select=id", cancellationToken);
        var (_, totalPosts) = await client.GetListAsync<dynamic>("padelgram_posts", $"usuario_id=eq.{userId}&select=id", cancellationToken);

        return new PerfilResponse(
            Id: raw.Id,
            Email: raw.Email,
            Nombre: raw.Nombre,
            Rol: raw.Rol,
            PalaActivaId: raw.PalaActivaId,
            PalaActivaModelo: palaModelo,
            PalaActivaMarca: palaMarca,
            NivelJuego: raw.NivelJuego,
            LadoPistaPreferido: raw.LadoPistaPreferido,
            AvatarUrl: raw.AvatarUrl,
            FechaRegistro: raw.FechaRegistro,
            TotalResenas: totalResenas,
            TotalVotos: totalVotos,
            TotalPaletero: totalPaletero,
            TotalPadelgramPosts: totalPosts
        );
    }

    public async Task<Usuario> CreateUsuarioAsync(
        string email,
        string passwordHash,
        string nombre,
        string nivelJuego,
        string ladoPistaPreferido,
        string? avatarUrl,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(email);
        ArgumentException.ThrowIfNullOrWhiteSpace(passwordHash);
        ArgumentException.ThrowIfNullOrWhiteSpace(nombre);

        var payload = new
        {
            email = email.Trim().ToLowerInvariant(),
            password_hash = passwordHash,
            nombre = nombre.Trim(),
            rol = "Usuario",
            nivel_juego = string.IsNullOrWhiteSpace(nivelJuego) ? "Intermedio" : nivelJuego,
            lado_pista_preferido = string.IsNullOrWhiteSpace(ladoPistaPreferido) ? "Reves" : ladoPistaPreferido,
            avatar_url = avatarUrl
        };

        var created = await client.InsertAsync<UsuarioRawRecord>("usuarios", payload, cancellationToken);
        return mapToUsuario(created);
    }

    private static Usuario mapToUsuario(UsuarioRawRecord raw) => new()
    {
        Id = raw.Id,
        Email = raw.Email,
        PasswordHash = raw.PasswordHash,
        Nombre = raw.Nombre,
        Rol = raw.Rol,
        PalaActivaId = raw.PalaActivaId,
        NivelJuego = raw.NivelJuego,
        LadoPistaPreferido = raw.LadoPistaPreferido,
        AvatarUrl = raw.AvatarUrl,
        FechaRegistro = raw.FechaRegistro
    };
}
