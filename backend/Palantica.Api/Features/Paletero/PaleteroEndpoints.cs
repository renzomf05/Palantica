using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace Palantica.Api.Features.Paletero;

/// <summary>
/// Endpoints de Minimal API para la gestión del paletero personal del jugador.
/// </summary>
public static class PaleteroEndpoints
{
    /// <summary>
    /// Mapea los endpoints del paletero al pipeline de la aplicación.
    /// </summary>
    public static IEndpointRouteBuilder MapPaleteroEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/paletero")
            .WithTags("6. Mi Paletero")
            .RequireAuthorization();

        group.MapGet("/mi-paletero", consultarMiPaletero)
            .WithName("ConsultarMiPaletero")
            .WithSummary("Consulta el paletero clasificado en 4 compartimentos del usuario autenticado");

        group.MapPost("/items", agregarItem)
            .WithName("AgregarItemPaletero")
            .WithSummary("Agrega o actualiza una pala en el paletero del usuario");

        group.MapDelete("/items/{palaId:int}/{categoria}", eliminarItem)
            .WithName("EliminarItemPaletero")
            .WithSummary("Elimina una pala de una categoría específica del paletero");

        return app;
    }

    private static async Task<IResult> consultarMiPaletero(
        ClaimsPrincipal user,
        [FromServices] PaleteroRepository repository,
        CancellationToken cancellationToken)
    {
        var idClaim = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(idClaim) || !int.TryParse(idClaim, out var userId))
        {
            return Results.Unauthorized();
        }

        var paletero = await repository.GetMiPaleteroAsync(userId, cancellationToken);
        return Results.Ok(paletero);
    }

    private static async Task<IResult> agregarItem(
        [FromBody] PaleteroAddRequest request,
        ClaimsPrincipal user,
        [FromServices] PaleteroRepository repository,
        CancellationToken cancellationToken)
    {
        if (request is null) return Results.BadRequest(new { error = "La solicitud no puede estar vacía." });

        var idClaim = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(idClaim) || !int.TryParse(idClaim, out var userId))
        {
            return Results.Unauthorized();
        }

        var item = await repository.AddItemAsync(userId, request, cancellationToken);
        return Results.Created($"/api/v1/paletero/mi-paletero", item);
    }

    private static async Task<IResult> eliminarItem(
        int palaId,
        string categoria,
        ClaimsPrincipal user,
        [FromServices] PaleteroRepository repository,
        CancellationToken cancellationToken)
    {
        if (palaId <= 0 || string.IsNullOrWhiteSpace(categoria)) return Results.BadRequest();

        var idClaim = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(idClaim) || !int.TryParse(idClaim, out var userId))
        {
            return Results.Unauthorized();
        }

        var removed = await repository.RemoveItemAsync(userId, palaId, Uri.UnescapeDataString(categoria), cancellationToken);
        if (!removed) return Results.NotFound(new { error = "El ítem no fue encontrado en el paletero." });

        return Results.NoContent();
    }
}
