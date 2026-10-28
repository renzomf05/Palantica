using Palantica.Api.Common.Database;
using Palantica.Api.Features.Reportes;

namespace Palantica.Api.Features.Admin;

/// <summary>
/// Repositorio para gestión de usuarios, roles y métricas de administración.
/// </summary>
public sealed class AdminRepository
{
    private readonly SupabaseRestClient client;
    private readonly ReporteRepository reporteRepository;
    private readonly ILogger<AdminRepository> logger;

    public AdminRepository(
        SupabaseRestClient client,
        ReporteRepository reporteRepository,
        ILogger<AdminRepository> logger)
    {
        this.client = client ?? throw new ArgumentNullException(nameof(client));
        this.reporteRepository = reporteRepository ?? throw new ArgumentNullException(nameof(reporteRepository));
        this.logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    private sealed record UsuarioRawRecord(
        int Id,
        string Email,
        string Nombre,
        string Rol,
        string NivelJuego,
        string LadoPistaPreferido,
        string? AvatarUrl,
        DateTimeOffset FechaRegistro
    );

    public async Task<IReadOnlyList<AdminUsuarioDto>> GetUsuariosAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var (users, _) = await client.GetListAsync<UsuarioRawRecord>(
                "usuarios",
                "select=id,email,nombre,rol,nivel_juego,lado_pista_preferido,avatar_url,fecha_registro&order=fecha_registro.desc",
                cancellationToken
            );

            if (users != null && users.Count > 0)
            {
                return users.Select(u => new AdminUsuarioDto(
                    u.Id,
                    u.Nombre,
                    u.Email,
                    u.Rol,
                    u.NivelJuego,
                    u.LadoPistaPreferido,
                    u.AvatarUrl,
                    u.FechaRegistro
                )).ToList().AsReadOnly();
            }
        }
        catch (Exception ex)
        {
            logger.LogWarning("Consulta de usuarios en Supabase falló ({Msg}).", ex.Message);
        }

        return Array.Empty<AdminUsuarioDto>();
    }

    public async Task<bool> ActualizarRolUsuarioAsync(int userId, string nuevoRol, CancellationToken cancellationToken = default)
    {
        try
        {
            await client.UpdateAsync<dynamic>(
                "usuarios",
                $"id=eq.{userId}",
                new { rol = nuevoRol },
                cancellationToken
            );
            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error actualizando rol del usuario {UserId}", userId);
            return false;
        }
    }

    public async Task<AdminEstadisticasDto> GetEstadisticasAsync(CancellationToken cancellationToken = default)
    {
        var totalUsuarios = 0;
        var totalPalas = 1722;
        var totalResenas = 0;

        try
        {
            var (users, countU) = await client.GetListAsync<dynamic>("usuarios", "select=id", cancellationToken);
            totalUsuarios = countU > 0 ? countU : (users?.Count ?? 0);

            var (_, countP) = await client.GetListAsync<dynamic>("palas", "select=id", cancellationToken);
            if (countP > 0) totalPalas = countP;

            var (_, countR) = await client.GetListAsync<dynamic>("resenas", "select=id", cancellationToken);
            totalResenas = countR;
        }
        catch { }

        var reportes = await reporteRepository.GetReportesAsync(null, 1, 1000, cancellationToken);
        var pendientes = reportes.Count(r => r.Estado.Equals("Pendiente", StringComparison.OrdinalIgnoreCase));

        return new AdminEstadisticasDto(
            TotalUsuarios: totalUsuarios,
            TotalReportes: reportes.Count,
            ReportesPendientes: pendientes,
            TotalPalas: totalPalas,
            TotalResenas: totalResenas
        );
    }
}
