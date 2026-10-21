using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Palantica.Api.Common.Pagination;

namespace Palantica.Api.Features.Padelgram;

/// <summary>
/// Endpoints de Minimal API para la comunidad y feed de Padelgram.
/// </summary>
public static class PadelgramEndpoints
{
    /// <summary>
    /// Mapea los endpoints de Padelgram al pipeline de la aplicación.
    /// </summary>
    public static IEndpointRouteBuilder MapPadelgramEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/padelgram")
            .WithTags("7. Padelgram");

        group.MapGet("/", obtenerFeed)
            .WithName("ObtenerFeedPadelgram")
            .WithSummary("Consulta el feed fotográfico público de la comunidad de pádel");

        group.MapPost("/", publicarEnPadelgram)
            .RequireAuthorization()
            .WithName("PublicarEnPadelgram")
            .WithSummary("Publica una fotografía en pista etiquetando una pala (requiere JWT)");

        group.MapPost("/{id:int}/like", darLike)
            .RequireAuthorization()
            .WithName("DarLikePadelgram")
            .WithSummary("Registra un like en una publicación de Padelgram");

        return app;
    }

    private static async Task<IResult> obtenerFeed(
        [FromQuery] int? page,
        [FromQuery] int? pageSize,
        [FromQuery] int? palaId,
        [FromServices] PadelgramRepository repository,
        CancellationToken cancellationToken)
    {
        var finalPage = (page.HasValue && page.Value > 0) ? page.Value : 1;
        var finalPageSize = (pageSize.HasValue && pageSize.Value > 0) ? pageSize.Value : 12;

        var pagedList = await repository.GetFeedAsync(finalPage, finalPageSize, palaId, cancellationToken);
        return Results.Ok(PagedResponse<PadelgramPostResponse>.FromPagedList(pagedList));
    }

    private static async Task<IResult> publicarEnPadelgram(
        [FromBody] PadelgramCreateRequest request,
        ClaimsPrincipal user,
        [FromServices] PadelgramRepository repository,
        CancellationToken cancellationToken)
    {
        if (request is null) return Results.BadRequest(new { error = "La solicitud no puede estar vacía." });

        var idClaim = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(idClaim) || !int.TryParse(idClaim, out var userId))
        {
            return Results.Unauthorized();
        }

        var post = await repository.CreatePostAsync(userId, request, cancellationToken);
        return Results.Created($"/api/v1/padelgram", post);
    }

    private static async Task<IResult> darLike(
        int id,
        ClaimsPrincipal user,
        [FromServices] PadelgramRepository repository,
        CancellationToken cancellationToken)
    {
        if (id <= 0) return Results.BadRequest(new { error = "ID inválido." });

        int? userId = null;
        var idClaim = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (int.TryParse(idClaim, out var parsed))
        {
            userId = parsed;
        }

        var likesCount = await repository.ToggleLikeAsync(id, userId, cancellationToken);
        return Results.Ok(new { id, likesCount });
    }
}
