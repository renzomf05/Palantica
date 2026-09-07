using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace Palantica.Api.Features.Auth;

/// <summary>
/// Endpoints de Minimal API para la característica de Autenticación y Perfil.
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

        group.MapPost("/registro", registrarUsuario)
            .WithName("RegistrarUsuario")
            .WithSummary("Registra un nuevo usuario en Palantica y retorna su token JWT");

        group.MapPost("/login", iniciarSesion)
            .WithName("IniciarSesion")
            .WithSummary("Autentica credenciales y emite un token JWT");

        group.MapGet("/perfil", obtenerPerfil)
            .RequireAuthorization()
            .WithName("ObtenerPerfil")
            .WithSummary("Obtiene los datos del perfil y estadísticas del usuario autenticado");

        return app;
    }

    private static async Task<IResult> registrarUsuario(
        [FromBody] RegistroRequest request,
        [FromServices] AuthRepository repository,
        [FromServices] TokenService tokenService,
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

        var usuario = await repository.CreateUsuarioAsync(
            request.Email,
            passwordHash,
            request.Nombre,
            request.NivelJuego ?? "Intermedio",
            request.LadoPistaPreferido ?? "Reves",
            request.AvatarUrl,
            cancellationToken
        );

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

        return Results.Created($"/api/v1/auth/perfil", response);
    }

    private static async Task<IResult> iniciarSesion(
        [FromBody] LoginRequest request,
        [FromServices] AuthRepository repository,
        [FromServices] TokenService tokenService,
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
