using System.Reflection;
using DbUp;

namespace Palantica.Api.Common.Database;

/// <summary>
/// Ejecutor de migraciones automáticas versionadas sobre PostgreSQL utilizando DbUp.
/// </summary>
public static class DatabaseMigrator
{
    /// <summary>
    /// Aplica todos los scripts SQL embebidos pendientes en la base de datos de destino.
    /// </summary>
    /// <param name="connectionString">Cadena de conexión directa a PostgreSQL.</param>
    /// <param name="logger">Instancia de logging para reportar resultados.</param>
    /// <exception cref="InvalidOperationException">Si la ejecución de las migraciones falla.</exception>
    public static void MigrateDatabase(string connectionString, ILogger logger)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(connectionString);
        ArgumentNullException.ThrowIfNull(logger);

        logger.LogInformation("Iniciando verificación y ejecución de migraciones de base de datos con DbUp...");

        var upgrader = DeployChanges.To
            .PostgresqlDatabase(connectionString)
            .WithScriptsEmbeddedInAssembly(Assembly.GetExecutingAssembly())
            .LogToConsole()
            .Build();

        var result = upgrader.PerformUpgrade();

        if (!result.Successful)
        {
            logger.LogCritical(result.Error, "CRITICAL: La ejecución de migraciones de base de datos ha fallado.");
            throw new InvalidOperationException("Fallo en la inicialización del esquema de base de datos.", result.Error);
        }

        logger.LogInformation("Migraciones de base de datos aplicadas y verificadas con éxito.");
    }
}
