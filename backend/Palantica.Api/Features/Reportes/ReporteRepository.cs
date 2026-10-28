using System.Collections.Concurrent;
using Palantica.Api.Common.Database;

namespace Palantica.Api.Features.Reportes;

/// <summary>
/// Repositorio de acceso a datos para reportes enviados por usuarios a administradores.
/// </summary>
public sealed class ReporteRepository
{
    private readonly SupabaseRestClient client;
    private readonly ILogger<ReporteRepository> logger;

    // Almacén seguro en memoria para alta disponibilidad
    private static readonly ConcurrentDictionary<int, Reporte> _memoryStore = new();
    private static int _nextId = 1;

    public ReporteRepository(SupabaseRestClient client, ILogger<ReporteRepository> logger)
    {
        this.client = client ?? throw new ArgumentNullException(nameof(client));
        this.logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    private sealed record ReporteRawRecord(
        int Id,
        int UsuarioId,
        string UsuarioNombre,
        string UsuarioEmail,
        string Asunto,
        string Mensaje,
        string Estado,
        DateTimeOffset FechaCreacion,
        DateTimeOffset? FechaResolucion
    );

    public async Task<Reporte> CrearReporteAsync(
        int usuarioId,
        string usuarioNombre,
        string usuarioEmail,
        string asunto,
        string mensaje,
        CancellationToken cancellationToken = default)
    {
        var nuevo = new Reporte
        {
            Id = Interlocked.Increment(ref _nextId),
            UsuarioId = usuarioId,
            UsuarioNombre = usuarioNombre,
            UsuarioEmail = usuarioEmail,
            Asunto = asunto.Trim(),
            Mensaje = mensaje.Trim(),
            Estado = "Pendiente",
            FechaCreacion = DateTimeOffset.UtcNow
        };

        try
        {
            var payload = new
            {
                usuario_id = usuarioId,
                usuario_nombre = usuarioNombre,
                usuario_email = usuarioEmail,
                asunto = nuevo.Asunto,
                mensaje = nuevo.Mensaje,
                estado = nuevo.Estado,
                fecha_creacion = nuevo.FechaCreacion
            };

            var dbInserted = await client.InsertAsync<ReporteRawRecord>("reportes", payload, cancellationToken);
            if (dbInserted is not null)
            {
                nuevo.Id = dbInserted.Id;
            }
        }
        catch (Exception ex)
        {
            logger.LogWarning("No se pudo persistir el reporte en Supabase ({Msg}). Guardado en memoria local.", ex.Message);
        }

        _memoryStore[nuevo.Id] = nuevo;
        return nuevo;
    }

    public async Task<IReadOnlyList<Reporte>> GetReportesAsync(
        string? estado = null,
        int page = 1,
        int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var query = "select=*&order=fecha_creacion.desc";
            if (!string.IsNullOrWhiteSpace(estado))
            {
                query += $"&estado=eq.{Uri.EscapeDataString(estado.Trim())}";
            }
            query += $"&limit={pageSize}&offset={(page - 1) * pageSize}";

            var (dbItems, _) = await client.GetListAsync<ReporteRawRecord>("reportes", query, cancellationToken);
            if (dbItems != null && dbItems.Count > 0)
            {
                foreach (var item in dbItems)
                {
                    _memoryStore[item.Id] = new Reporte
                    {
                        Id = item.Id,
                        UsuarioId = item.UsuarioId,
                        UsuarioNombre = item.UsuarioNombre,
                        UsuarioEmail = item.UsuarioEmail,
                        Asunto = item.Asunto,
                        Mensaje = item.Mensaje,
                        Estado = item.Estado,
                        FechaCreacion = item.FechaCreacion,
                        FechaResolucion = item.FechaResolucion
                    };
                }
            }
        }
        catch (Exception ex)
        {
            logger.LogDebug("Consulta remota de reportes falló ({Msg}), usando almacenamiento en memoria.", ex.Message);
        }

        IEnumerable<Reporte> list = _memoryStore.Values.OrderByDescending(r => r.FechaCreacion);
        if (!string.IsNullOrWhiteSpace(estado))
        {
            list = list.Where(r => r.Estado.Equals(estado.Trim(), StringComparison.OrdinalIgnoreCase));
        }

        return list.Skip((page - 1) * pageSize).Take(pageSize).ToList().AsReadOnly();
    }

    public async Task<Reporte?> ActualizarEstadoAsync(int id, string nuevoEstado, CancellationToken cancellationToken = default)
    {
        if (_memoryStore.TryGetValue(id, out var reporte))
        {
            reporte.Estado = nuevoEstado;
            if (nuevoEstado.Equals("Resuelto", StringComparison.OrdinalIgnoreCase))
            {
                reporte.FechaResolucion = DateTimeOffset.UtcNow;
            }
        }

        try
        {
            var payload = new
            {
                estado = nuevoEstado,
                fecha_resolucion = nuevoEstado.Equals("Resuelto", StringComparison.OrdinalIgnoreCase)
                    ? DateTimeOffset.UtcNow
                    : (DateTimeOffset?)null
            };

            await client.UpdateAsync<ReporteRawRecord>("reportes", $"id=eq.{id}", payload, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogWarning("No se pudo actualizar el estado del reporte en Supabase: {Msg}", ex.Message);
        }

        return reporte;
    }
}
