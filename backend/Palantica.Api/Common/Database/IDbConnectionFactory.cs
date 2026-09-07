using System.Data;

namespace Palantica.Api.Common.Database;

/// <summary>
/// Fábrica de conexiones a la base de datos PostgreSQL de alto rendimiento.
/// </summary>
public interface IDbConnectionFactory
{
    /// <summary>
    /// Crea y abre de forma asíncrona una nueva conexión física a la base de datos PostgreSQL.
    /// </summary>
    /// <param name="cancellationToken">Token de cancelación de la operación.</param>
    /// <returns>Instancia de <see cref="IDbConnection"/> abierta y lista para operaciones con Dapper.</returns>
    Task<IDbConnection> CreateConnectionAsync(CancellationToken cancellationToken = default);
}
