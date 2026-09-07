using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Palantica.Api.Common.Pagination;

namespace Palantica.Api.Features.Resenas;

/// <summary>
/// Endpoints de Minimal API para la gestión de reseñas de palas de pádel.
/// </summary>
public static class ResenaEndpoints
{
    /// <summary>
    /// Mapea los endpoints de reseñas al pipeline de la aplicación.
    /// </summary>
    public static IEndpointRouteBuilder MapResenaEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/palas/{palaId:int}/resenas")
            .WithTags("4. Reseñas");

        group.MapGet("/", listarResenas)
            .WithName("ListarResenasPorPala")
            .WithSummary("Lista las reseñas publicadas para una pala de forma paginada");

        group.MapPost("/", publicarResena)
            .RequireAuthorization()
            .WithName("PublicarResena")
            .WithSummary("Publica una nueva reseña técnica (requiere JWT y actualiza la pala atómicamente)");

        return app;
    }

    private static async Task<IResult> listarResenas(
        int palaId,
        [FromQuery] int? page,
        [FromQuery] int? pageSize,
        [FromServices] ResenaRepository repository,
        CancellationToken cancellationToken)
    {
        if (palaId <= 0) return Results.BadRequest(new { error = "El ID de pala debe ser mayor a 0." });

        var pagedList = await repository.GetByPalaIdAsync(
            palaId,
            (page.HasValue && page.Value > 0) ? page.Value : 1,
            (pageSize.HasValue && pageSize.Value > 0) ? pageSize.Value : 10,
            cancellationToken);
        return Results.Ok(PagedResponse<ResenaResponse>.FromPagedList(pagedList));
    }

    private static async Task<IResult> publicarResena(
        int palaId,
        [FromBody] ResenaCreateRequest request,
        ClaimsPrincipal user,
        [FromServices] ResenaRepository repository,
        CancellationToken cancellationToken)
    {
        if (palaId <= 0) return Results.BadRequest(new { error = "El ID de pala debe ser mayor a 0." });
        if (request is null) return Results.BadRequest(new { error = "El cuerpo de la solicitud no puede estar vacío." });

        var idClaim = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(idClaim) || !int.TryParse(idClaim, out var userId))
        {
            return Results.Unauthorized();
        }

        try
        {
            var resena = await repository.CreateAsync(palaId, userId, request, cancellationToken);
            return Results.Created($"/api/v1/palas/{palaId}/resenas", resena);
        }
        catch (InvalidOperationException ex)
        {
            return Results.Conflict(new { error = ex.Message });
        }
    }
}
