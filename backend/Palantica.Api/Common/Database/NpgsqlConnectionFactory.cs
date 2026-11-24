using System.Data;
using Microsoft.Extensions.Configuration;
using Npgsql;

namespace Palantica.Api.Common.Database;

/// <summary>
/// Implementación concreta de la fábrica de conexiones para PostgreSQL / Supabase utilizando Npgsql.
/// Soporta tanto formato URI (postgresql://...) como formato estándar ADO.NET (Host=...;Port=...).
/// </summary>
public sealed class NpgsqlConnectionFactory : IDbConnectionFactory
{
    private readonly string connectionString;

    /// <summary>
    /// Inicializa una nueva instancia de <see cref="NpgsqlConnectionFactory"/>.
    /// </summary>
    public NpgsqlConnectionFactory(IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(configuration);

        var rawString = configuration["SUPABASE_CONNECTION_STRING"]
                        ?? configuration.GetConnectionString("Supabase")
                        ?? configuration.GetConnectionString("DefaultConnection")
                        ?? configuration["ConnectionStrings__Supabase"];

        if (string.IsNullOrWhiteSpace(rawString))
        {
            // Fallback con variables individuales
            var host = configuration["SUPABASE_DB_HOST"] ?? "db.detxepmluillmdknfanm.supabase.co";
            var port = configuration["SUPABASE_DB_PORT"] ?? "5432";
            var db = configuration["SUPABASE_DB_NAME"] ?? "postgres";
            var user = configuration["SUPABASE_DB_USER"] ?? "postgres";
            var pass = configuration["SUPABASE_DB_PASSWORD"]
                       ?? throw new InvalidOperationException("Falta la configuración de conexión a la base de datos.");

            rawString = $"Host={host};Port={port};Database={db};Username={user};Password={pass};SSL Mode=Require;Trust Server Certificate=true;";
        }

        connectionString = NormalizeToAdoConnectionString(rawString);
    }

    /// <summary>
    /// Normaliza una URL tipo postgresql://user:pass@host:port/db a formato ADO.NET compatible.
    /// </summary>
    public static string NormalizeToAdoConnectionString(string input)
    {
        if (string.IsNullOrWhiteSpace(input)) return string.Empty;

        input = input.Trim();

        if (input.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase) ||
            input.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase))
        {
            var uri = new Uri(input);
            var userInfo = uri.UserInfo.Split(':');
            var username = userInfo.Length > 0 ? Uri.UnescapeDataString(userInfo[0]) : "postgres";
            var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
            var database = uri.AbsolutePath.TrimStart('/');
            if (string.IsNullOrWhiteSpace(database)) database = "postgres";

            return $"Host={uri.Host};Port={(uri.Port > 0 ? uri.Port : 5432)};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true;";
        }

        // Si ya es formato Host=..., asegurarse de SSL
        if (!input.Contains("SSL Mode", StringComparison.OrdinalIgnoreCase))
        {
            input += ";SSL Mode=Require;Trust Server Certificate=true;";
        }

        return input;
    }

    /// <inheritdoc />
    public async Task<IDbConnection> CreateConnectionAsync(CancellationToken cancellationToken = default)
    {
        var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        return connection;
    }
}
