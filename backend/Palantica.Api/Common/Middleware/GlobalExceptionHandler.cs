using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace Palantica.Api.Common.Middleware;

/// <summary>
/// Manejador global de excepciones no controladas conforme a la especificación RFC 7807 (Problem Details).
/// </summary>
public sealed class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> logger;

    /// <summary>
    /// Inicializa una nueva instancia de <see cref="GlobalExceptionHandler"/>.
    /// </summary>
    /// <param name="logger">Servicio de registro de eventos y errores.</param>
    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        this.logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <inheritdoc />
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(httpContext);
        ArgumentNullException.ThrowIfNull(exception);

        logger.LogError(exception, "Excepción no controlada capturada en pipeline HTTP: {Message}", exception.Message);

        var (statusCode, title, detail) = mapExceptionToProblemDetails(exception);

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail,
            Instance = httpContext.Request.Path
        };

        problemDetails.Extensions["traceId"] = Activity.Current?.Id ?? httpContext.TraceIdentifier;
        problemDetails.Extensions["timestamp"] = DateTimeOffset.UtcNow;

        httpContext.Response.StatusCode = statusCode;
        httpContext.Response.ContentType = "application/problem+json";

        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);
        return true;
    }

    private static (int StatusCode, string Title, string Detail) mapExceptionToProblemDetails(Exception exception)
    {
        return exception switch
        {
            ValidationException validationEx => (
                StatusCodes.Status400BadRequest,
                "Error de Validación de Datos",
                validationEx.Message
            ),
            ArgumentException argumentEx => (
                StatusCodes.Status400BadRequest,
                "Parámetro Inválido",
                argumentEx.Message
            ),
            UnauthorizedAccessException unauthorizedEx => (
                StatusCodes.Status401Unauthorized,
                "Acceso No Autorizado",
                unauthorizedEx.Message
            ),
            KeyNotFoundException notFoundEx => (
                StatusCodes.Status404NotFound,
                "Recurso No Encontrado",
                notFoundEx.Message
            ),
            InvalidOperationException invalidOpEx when invalidOpEx.Message.Contains("duplicado", StringComparison.OrdinalIgnoreCase) ||
                                                      invalidOpEx.Message.Contains("conflict", StringComparison.OrdinalIgnoreCase) => (
                StatusCodes.Status409Conflict,
                "Conflicto de Estado",
                invalidOpEx.Message
            ),
            _ => (
                StatusCodes.Status500InternalServerError,
                "Error Interno del Servidor",
                "Ha ocurrido un error inesperado al procesar la solicitud en el motor de Palantica."
            )
        };
    }
}
