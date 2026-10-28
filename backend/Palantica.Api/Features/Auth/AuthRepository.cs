using System.Collections.Concurrent;
using Palantica.Api.Common.Database;

namespace Palantica.Api.Features.Auth;

/// <summary>
/// Repositorio de acceso a datos para usuarios y autenticación conectado a Supabase con fallback de seguridad en memoria.
/// </summary>
public sealed class AuthRepository
{
    private readonly SupabaseRestClient client;
    private readonly ILogger<AuthRepository> logger;

    // Almacén en memoria de estado de seguridad (OTP y 2FA) para garantizar funcionamiento continuo
    private static readonly ConcurrentDictionary<int, SecurityState> InMemSecurity = new();

    private sealed record SecurityState(
        bool EmailVerificado,
        string? CodigoVerificacion,
        DateTimeOffset? CodigoExpiracion,
        bool TwoFactorEnabled,
        string? TwoFactorSecret
    );

    public AuthRepository(SupabaseRestClient client, ILogger<AuthRepository> logger)
    {
        this.client = client ?? throw new ArgumentNullException(nameof(client));
        this.logger = logger ?? throw new ArgumentNullException(nameof(logger));
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
        DateTimeOffset FechaRegistro,
        bool? EmailVerificado = null,
        string? CodigoVerificacion = null,
        DateTimeOffset? CodigoExpiracion = null,
        bool? TwoFactorEnabled = null,
        string? TwoFactorSecret = null
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

        var usuario = mapToUsuario(raw);

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
            Id: usuario.Id,
            Email: usuario.Email,
            Nombre: usuario.Nombre,
            Rol: usuario.Rol,
            PalaActivaId: usuario.PalaActivaId,
            PalaActivaModelo: palaModelo,
            PalaActivaMarca: palaMarca,
            NivelJuego: usuario.NivelJuego,
            LadoPistaPreferido: usuario.LadoPistaPreferido,
            AvatarUrl: usuario.AvatarUrl,
            FechaRegistro: usuario.FechaRegistro,
            TotalResenas: totalResenas,
            TotalVotos: totalVotos,
            TotalPaletero: totalPaletero,
            TotalPadelgramPosts: totalPosts,
            EmailVerificado: usuario.EmailVerificado,
            TwoFactorEnabled: usuario.TwoFactorEnabled
        );
    }

    public async Task<Usuario> CreateUsuarioAsync(
        string email,
        string passwordHash,
        string nombre,
        string nivelJuego,
        string ladoPistaPreferido,
        string? avatarUrl,
        string codigoVerificacion,
        DateTimeOffset codigoExpiracion,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(email);
        ArgumentException.ThrowIfNullOrWhiteSpace(passwordHash);
        ArgumentException.ThrowIfNullOrWhiteSpace(nombre);

        UsuarioRawRecord created;

        // Intentamos insertar con los nuevos campos
        try
        {
            var fullPayload = new
            {
                email = email.Trim().ToLowerInvariant(),
                password_hash = passwordHash,
                nombre = nombre.Trim(),
                rol = "Usuario",
                nivel_juego = string.IsNullOrWhiteSpace(nivelJuego) ? "Intermedio" : nivelJuego,
                lado_pista_preferido = string.IsNullOrWhiteSpace(ladoPistaPreferido) ? "Reves" : ladoPistaPreferido,
                avatar_url = avatarUrl,
                email_verificado = false,
                codigo_verificacion = codigoVerificacion,
                codigo_expiracion = codigoExpiracion
            };

            created = await client.InsertAsync<UsuarioRawRecord>("usuarios", fullPayload, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogWarning("Inserción con columnas de seguridad falló ({Msg}), reintentando con campos base.", ex.Message);
            var basePayload = new
            {
                email = email.Trim().ToLowerInvariant(),
                password_hash = passwordHash,
                nombre = nombre.Trim(),
                rol = "Usuario",
                nivel_juego = string.IsNullOrWhiteSpace(nivelJuego) ? "Intermedio" : nivelJuego,
                lado_pista_preferido = string.IsNullOrWhiteSpace(ladoPistaPreferido) ? "Reves" : ladoPistaPreferido,
                avatar_url = avatarUrl
            };
            created = await client.InsertAsync<UsuarioRawRecord>("usuarios", basePayload, cancellationToken);
        }

        // Guardamos estado de seguridad en memoria
        InMemSecurity[created.Id] = new SecurityState(
            EmailVerificado: false,
            CodigoVerificacion: codigoVerificacion,
            CodigoExpiracion: codigoExpiracion,
            TwoFactorEnabled: false,
            TwoFactorSecret: null
        );

        return mapToUsuario(created);
    }

    public async Task GuardarCodigoVerificacionAsync(
        int userId,
        string codigo,
        DateTimeOffset expiracion,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await client.UpdateAsync<dynamic>(
                "usuarios",
                $"id=eq.{userId}",
                new
                {
                    codigo_verificacion = codigo,
                    codigo_expiracion = expiracion
                },
                cancellationToken
            );
        }
        catch (Exception ex)
        {
            logger.LogWarning("Error actualizando código de verificación en Supabase: {Msg}", ex.Message);
        }

        InMemSecurity.AddOrUpdate(
            userId,
            _ => new SecurityState(false, codigo, expiracion, false, null),
            (_, prev) => prev with { CodigoVerificacion = codigo, CodigoExpiracion = expiracion }
        );
    }

    public async Task MarcarEmailVerificadoAsync(int userId, CancellationToken cancellationToken = default)
    {
        try
        {
            await client.UpdateAsync<dynamic>(
                "usuarios",
                $"id=eq.{userId}",
                new
                {
                    email_verificado = true,
                    codigo_verificacion = (string?)null,
                    codigo_expiracion = (DateTimeOffset?)null
                },
                cancellationToken
            );
        }
        catch (Exception ex)
        {
            logger.LogWarning("Error marcando email verificado en Supabase: {Msg}", ex.Message);
        }

        InMemSecurity.AddOrUpdate(
            userId,
            _ => new SecurityState(true, null, null, false, null),
            (_, prev) => prev with { EmailVerificado = true, CodigoVerificacion = null, CodigoExpiracion = null }
        );
    }

    public async Task ConfigurarTwoFactorAsync(
        int userId,
        bool enabled,
        string? secret,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await client.UpdateAsync<dynamic>(
                "usuarios",
                $"id=eq.{userId}",
                new
                {
                    two_factor_enabled = enabled,
                    two_factor_secret = secret
                },
                cancellationToken
            );
        }
        catch (Exception ex)
        {
            logger.LogWarning("Error configurando 2FA en Supabase: {Msg}", ex.Message);
        }

        InMemSecurity.AddOrUpdate(
            userId,
            _ => new SecurityState(true, null, null, enabled, secret),
            (_, prev) => prev with { TwoFactorEnabled = enabled, TwoFactorSecret = secret }
        );
    }

    private static Usuario mapToUsuario(UsuarioRawRecord raw)
    {
        var usuario = new Usuario
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
            FechaRegistro = raw.FechaRegistro,
            EmailVerificado = raw.EmailVerificado ?? true,
            CodigoVerificacion = raw.CodigoVerificacion,
            CodigoExpiracion = raw.CodigoExpiracion,
            TwoFactorEnabled = raw.TwoFactorEnabled ?? false,
            TwoFactorSecret = raw.TwoFactorSecret
        };

        // Si existe un estado en memoria para este usuario, sobreescribimos
        if (InMemSecurity.TryGetValue(raw.Id, out var sec))
        {
            usuario.EmailVerificado = sec.EmailVerificado;
            usuario.CodigoVerificacion = sec.CodigoVerificacion ?? usuario.CodigoVerificacion;
            usuario.CodigoExpiracion = sec.CodigoExpiracion ?? usuario.CodigoExpiracion;
            usuario.TwoFactorEnabled = sec.TwoFactorEnabled;
            usuario.TwoFactorSecret = sec.TwoFactorSecret ?? usuario.TwoFactorSecret;
        }

        return usuario;
    }
}
