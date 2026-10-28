namespace Palantica.Api.Features.Auth;

/// <summary>
/// Contrato para el servicio de envío de correos transaccionales y de seguridad.
/// </summary>
public interface IEmailService
{
    Task SendVerificationCodeAsync(string email, string code, CancellationToken cancellationToken = default);
}

/// <summary>
/// Implementación de servicio de email con soporte para entornos locales/desarrollo y registro en consola.
/// </summary>
public sealed class EmailService : IEmailService
{
    private readonly ILogger<EmailService> logger;

    public EmailService(ILogger<EmailService> logger)
    {
        this.logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public Task SendVerificationCodeAsync(string email, string code, CancellationToken cancellationToken = default)
    {
        // En entorno de desarrollo o prueba imprimimos el código en la consola con un recuadro visible
        var banner = $"""
        
        ╔══════════════════════════════════════════════════════════════════╗
        ║                  PALANTICA SECURITY EMAIL DISPATCH               ║
        ╠══════════════════════════════════════════════════════════════════╣
        ║ Destinatario : {email,-49} ║
        ║ Asunto       : Tu código de verificación Palantica               ║
        ║ Código OTP   : >> {code} <<                                     ║
        ║ Validez      : 15 minutos                                        ║
        ╚══════════════════════════════════════════════════════════════════╝
        """;

        logger.LogInformation("{Banner}", banner);
        Console.WriteLine(banner);

        return Task.CompletedTask;
    }
}
