using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace Palantica.Api.Features.Auth;

/// <summary>
/// Endpoints de Minimal API para la característica de Autenticación, Verificación de Email y 2FA.
/// </summary>
public static class AuthEndpoints
{
    /// <summary>
    /// Mapea los endpoints de autenticación al pipeline de la aplicación.
    /// </summary>
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/auth")
            .WithTags("1. Autenticación");

        // Rutas Base
        group.MapPost("/registro", registrarUsuario)
            .WithName("RegistrarUsuario")
            .WithSummary("Registra un nuevo usuario en Palantica y envía el código OTP de verificación");

        group.MapPost("/login", iniciarSesion)
            .WithName("IniciarSesion")
            .WithSummary("Autentica credenciales, valida verificación de email y 2FA, y emite token");

        group.MapGet("/perfil", obtenerPerfil)
            .RequireAuthorization()
            .WithName("ObtenerPerfil")
            .WithSummary("Obtiene los datos del perfil y estadísticas del usuario autenticado");

        // ÉPICA 2: Verificación de Email (OTP 6 dígitos)
        group.MapPost("/verificar-codigo", verificarCodigo)
            .WithName("VerificarCodigoEmail")
            .WithSummary("Verifica el código de seguridad de 6 dígitos y emite el token JWT");

        group.MapPost("/reenviar-codigo", reenviarCodigo)
            .WithName("ReenviarCodigoEmail")
            .WithSummary("Genera y reenvía un nuevo código de verificación por correo");

        // ÉPICA 3: Autenticación en 2 Pasos (TOTP)
        group.MapPost("/2fa/configurar", configurar2FA)
            .RequireAuthorization()
            .WithName("Configurar2FA")
            .WithSummary("Genera secreto TOTP y URI de código QR para app autenticadora");

        group.MapPost("/2fa/activar", activar2FA)
            .RequireAuthorization()
            .WithName("Activar2FA")
            .WithSummary("Valida código TOTP y activa 2FA en la cuenta del usuario");

        group.MapPost("/2fa/desactivar", desactivar2FA)
            .RequireAuthorization()
            .WithName("Desactivar2FA")
            .WithSummary("Desactiva 2FA verificando la contraseña del usuario");

        group.MapPost("/2fa/verificar-login", verificar2FALogin)
            .WithName("Verificar2FALogin")
            .WithSummary("Valida código 2FA de inicio de sesión con token temporal y emite el JWT final");

        return app;
    }

    private static async Task<IResult> registrarUsuario(
        [FromBody] RegistroRequest request,
        [FromServices] AuthRepository repository,
        [FromServices] IEmailService emailService,
        CancellationToken cancellationToken)
    {
        if (request is null)
        {
            return Results.BadRequest(new { error = "El cuerpo de la solicitud no puede estar vacío." });
        }

        var existente = await repository.GetByEmailAsync(request.Email, cancellationToken);
        if (existente is not null)
        {
            return Results.Conflict(new { error = "Ya existe una cuenta registrada con ese correo electrónico." });
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, workFactor: 11);

        // Generamos código OTP numérico de 6 dígitos
        var codigo = Random.Shared.Next(100000, 999999).ToString();
        var expiracion = DateTimeOffset.UtcNow.AddMinutes(15);

        var usuario = await repository.CreateUsuarioAsync(
            request.Email,
            passwordHash,
            request.Nombre,
            request.NivelJuego ?? "Intermedio",
            request.LadoPistaPreferido ?? "Reves",
            request.AvatarUrl,
            codigo,
            expiracion,
            cancellationToken
        );

        // Enviamos el correo con el código de seguridad
        await emailService.SendVerificationCodeAsync(usuario.Email, codigo, cancellationToken);

        // Respondemos informando que se requiere verificar el código (sin emitir JWT todavía)
        var response = new RegistroPendienteResponse(
            Message: "Cuenta creada exitosamente. Hemos enviado un código de seguridad de 6 dígitos a tu correo electrónico.",
            Email: usuario.Email,
            RequiresVerification: true,
            DevCode: codigo
        );

        return Results.Created("/api/v1/auth/verificar-codigo", response);
    }

    private static async Task<IResult> iniciarSesion(
        [FromBody] LoginRequest request,
        [FromServices] AuthRepository repository,
        [FromServices] TokenService tokenService,
        [FromServices] IEmailService emailService,
        CancellationToken cancellationToken)
    {
        if (request is null)
        {
            return Results.BadRequest(new { error = "El cuerpo de la solicitud no puede estar vacío." });
        }

        var usuario = await repository.GetByEmailAsync(request.Email, cancellationToken);
        if (usuario is null || !BCrypt.Net.BCrypt.Verify(request.Password, usuario.PasswordHash))
        {
            return Results.Unauthorized();
        }

        // 1. Validar si el email ha sido confirmado
        if (!usuario.EmailVerificado)
        {
            // Regenerar y reenviar código
            var nuevoCodigo = Random.Shared.Next(100000, 999999).ToString();
            var expiracion = DateTimeOffset.UtcNow.AddMinutes(15);
            await repository.GuardarCodigoVerificacionAsync(usuario.Id, nuevoCodigo, expiracion, cancellationToken);
            await emailService.SendVerificationCodeAsync(usuario.Email, nuevoCodigo, cancellationToken);

            return Results.Json(
                new
                {
                    error = "Tu correo electrónico no ha sido verificado. Te enviamos un nuevo código de 6 dígitos a tu correo.",
                    requiresVerification = true,
                    email = usuario.Email,
                    devCode = nuevoCodigo
                },
                statusCode: StatusCodes.Status403Forbidden
            );
        }

        // 2. Validar si el usuario tiene habilitado 2FA
        if (usuario.TwoFactorEnabled)
        {
            var tempToken = tokenService.Generate2FATempToken(usuario);
            return Results.Ok(new TwoFactorRequeridoResponse(
                Requires2FA: true,
                TempToken: tempToken,
                Email: usuario.Email
            ));
        }

        // 3. Flujo normal: generar JWT
        var token = tokenService.GenerateJwtToken(usuario);

        var response = new AuthResponse(
            Token: token,
            Id: usuario.Id,
            Email: usuario.Email,
            Nombre: usuario.Nombre,
            Rol: usuario.Rol,
            NivelJuego: usuario.NivelJuego,
            LadoPistaPreferido: usuario.LadoPistaPreferido,
            AvatarUrl: usuario.AvatarUrl
        );

        return Results.Ok(response);
    }

    private static async Task<IResult> verificarCodigo(
        [FromBody] VerificarCodigoRequest request,
        [FromServices] AuthRepository repository,
        [FromServices] TokenService tokenService,
        CancellationToken cancellationToken)
    {
        if (request is null)
        {
            return Results.BadRequest(new { error = "La solicitud no puede estar vacía." });
        }

        var usuario = await repository.GetByEmailAsync(request.Email, cancellationToken);
        if (usuario is null)
        {
            return Results.BadRequest(new { error = "No se encontró ningún usuario con ese correo electrónico." });
        }

        if (usuario.EmailVerificado)
        {
            var tokenYaVerificado = tokenService.GenerateJwtToken(usuario);
            return Results.Ok(new AuthResponse(
                Token: tokenYaVerificado,
                Id: usuario.Id,
                Email: usuario.Email,
                Nombre: usuario.Nombre,
                Rol: usuario.Rol,
                NivelJuego: usuario.NivelJuego,
                LadoPistaPreferido: usuario.LadoPistaPreferido,
                AvatarUrl: usuario.AvatarUrl
            ));
        }

        if (string.IsNullOrWhiteSpace(usuario.CodigoVerificacion) ||
            !usuario.CodigoVerificacion.Trim().Equals(request.Codigo.Trim(), StringComparison.OrdinalIgnoreCase))
        {
            return Results.BadRequest(new { error = "El código de seguridad ingresado es incorrecto." });
        }

        if (usuario.CodigoExpiracion.HasValue && DateTimeOffset.UtcNow > usuario.CodigoExpiracion.Value)
        {
            return Results.BadRequest(new { error = "El código de seguridad ha expirado. Solicita un nuevo código." });
        }

        // Marcar email como verificado en la BD
        await repository.MarcarEmailVerificadoAsync(usuario.Id, cancellationToken);
        usuario.EmailVerificado = true;

        var token = tokenService.GenerateJwtToken(usuario);

        var response = new AuthResponse(
            Token: token,
            Id: usuario.Id,
            Email: usuario.Email,
            Nombre: usuario.Nombre,
            Rol: usuario.Rol,
            NivelJuego: usuario.NivelJuego,
            LadoPistaPreferido: usuario.LadoPistaPreferido,
            AvatarUrl: usuario.AvatarUrl
        );

        return Results.Ok(response);
    }

    private static async Task<IResult> reenviarCodigo(
        [FromBody] ReenviarCodigoRequest request,
        [FromServices] AuthRepository repository,
        [FromServices] IEmailService emailService,
        CancellationToken cancellationToken)
    {
        if (request is null || string.IsNullOrWhiteSpace(request.Email))
        {
            return Results.BadRequest(new { error = "El correo electrónico es requerido." });
        }

        var usuario = await repository.GetByEmailAsync(request.Email, cancellationToken);
        if (usuario is null)
        {
            return Results.NotFound(new { error = "No existe una cuenta registrada con este correo." });
        }

        var codigo = Random.Shared.Next(100000, 999999).ToString();
        var expiracion = DateTimeOffset.UtcNow.AddMinutes(15);

        await repository.GuardarCodigoVerificacionAsync(usuario.Id, codigo, expiracion, cancellationToken);
        await emailService.SendVerificationCodeAsync(usuario.Email, codigo, cancellationToken);

        return Results.Ok(new
        {
            message = "Se ha reenviado un nuevo código de 6 dígitos a tu correo electrónico.",
            email = usuario.Email,
            devCode = codigo
        });
    }

    private static async Task<IResult> configurar2FA(
        ClaimsPrincipal user,
        [FromServices] AuthRepository repository,
        CancellationToken cancellationToken)
    {
        var idClaim = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(idClaim, out var userId)) return Results.Unauthorized();

        var usuario = await repository.GetByIdAsync(userId, cancellationToken);
        if (usuario is null) return Results.NotFound();

        var secret = TotpHelper.GenerateSecretKey();
        var qrUri = TotpHelper.GenerateQrUri(usuario.Email, secret);

        return Results.Ok(new TwoFactorSetupResponse(Secret: secret, QrUri: qrUri));
    }

    private static async Task<IResult> activar2FA(
        ClaimsPrincipal user,
        [FromBody] ActivarTwoFactorRequest request,
        [FromServices] AuthRepository repository,
        CancellationToken cancellationToken)
    {
        var idClaim = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(idClaim, out var userId)) return Results.Unauthorized();

        if (string.IsNullOrWhiteSpace(request.Secret) || string.IsNullOrWhiteSpace(request.Codigo))
        {
            return Results.BadRequest(new { error = "El secreto y el código de 6 dígitos son obligatorios." });
        }

        var isValid = TotpHelper.ValidateTotp(request.Secret, request.Codigo);
        if (!isValid)
        {
            return Results.BadRequest(new { error = "El código ingresado es incorrecto o ha expirado. Verifica que tu dispositivo tenga la hora correcta." });
        }

        await repository.ConfigurarTwoFactorAsync(userId, enabled: true, secret: request.Secret, cancellationToken);

        return Results.Ok(new { message = "Autenticación en 2 pasos activada con éxito." });
    }

    private static async Task<IResult> desactivar2FA(
        ClaimsPrincipal user,
        [FromBody] DesactivarTwoFactorRequest request,
        [FromServices] AuthRepository repository,
        CancellationToken cancellationToken)
    {
        var idClaim = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(idClaim, out var userId)) return Results.Unauthorized();

        var usuario = await repository.GetByIdAsync(userId, cancellationToken);
        if (usuario is null) return Results.NotFound();

        if (!BCrypt.Net.BCrypt.Verify(request.Password, usuario.PasswordHash))
        {
            return Results.BadRequest(new { error = "Contraseña incorrecta." });
        }

        await repository.ConfigurarTwoFactorAsync(userId, enabled: false, secret: null, cancellationToken);

        return Results.Ok(new { message = "Autenticación en 2 pasos desactivada correctamente." });
    }

    private static async Task<IResult> verificar2FALogin(
        [FromBody] VerificarTwoFactorLoginRequest request,
        [FromServices] AuthRepository repository,
        [FromServices] TokenService tokenService,
        CancellationToken cancellationToken)
    {
        if (request is null) return Results.BadRequest(new { error = "Datos incompletos." });

        var (isValid, userId, _) = tokenService.Validate2FATempToken(request.TempToken);
        if (!isValid || userId <= 0)
        {
            return Results.Unauthorized();
        }

        var usuario = await repository.GetByIdAsync(userId, cancellationToken);
        if (usuario is null || !usuario.TwoFactorEnabled || string.IsNullOrWhiteSpace(usuario.TwoFactorSecret))
        {
            return Results.BadRequest(new { error = "No se pudo validar la configuración de 2FA." });
        }

        var totpValid = TotpHelper.ValidateTotp(usuario.TwoFactorSecret, request.Codigo);
        if (!totpValid)
        {
            return Results.BadRequest(new { error = "El código de 6 dígitos ingresado es incorrecto o ha expirado." });
        }

        var token = tokenService.GenerateJwtToken(usuario);

        var response = new AuthResponse(
            Token: token,
            Id: usuario.Id,
            Email: usuario.Email,
            Nombre: usuario.Nombre,
            Rol: usuario.Rol,
            NivelJuego: usuario.NivelJuego,
            LadoPistaPreferido: usuario.LadoPistaPreferido,
            AvatarUrl: usuario.AvatarUrl
        );

        return Results.Ok(response);
    }

    private static async Task<IResult> obtenerPerfil(
        ClaimsPrincipal user,
        [FromServices] AuthRepository repository,
        CancellationToken cancellationToken)
    {
        var idClaim = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(idClaim) || !int.TryParse(idClaim, out var userId))
        {
            return Results.Unauthorized();
        }

        var perfil = await repository.GetPerfilCompletoAsync(userId, cancellationToken);
        if (perfil is null)
        {
            return Results.NotFound(new { error = "Usuario no encontrado." });
        }

        return Results.Ok(perfil);
    }
}
