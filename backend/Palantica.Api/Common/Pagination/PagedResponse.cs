namespace Palantica.Api.Common.Pagination;

/// <summary>
/// Contrato DTO serializable para respuestas paginadas consumidas por clientes HTTP.
/// </summary>
/// <typeparam name="T">Tipo de dato de los elementos serializados.</typeparam>
public sealed record PagedResponse<T>(
    IReadOnlyList<T> Items,
    int Page,
    int PageSize,
    int TotalCount,
    int TotalPages,
    bool HasNextPage,
    bool HasPreviousPage
)
{
    /// <summary>
    /// Crea una respuesta <see cref="PagedResponse{T}"/> a partir de una instancia de <see cref="PagedList{T}"/>.
    /// </summary>
    /// <param name="pagedList">Instancia paginada de origen.</param>
    /// <returns>Objeto de respuesta formateado.</returns>
    public static PagedResponse<T> FromPagedList(PagedList<T> pagedList)
    {
        ArgumentNullException.ThrowIfNull(pagedList);
        return new PagedResponse<T>(
            pagedList.Items,
            pagedList.Page,
            pagedList.PageSize,
            pagedList.TotalCount,
            pagedList.TotalPages,
            pagedList.HasNextPage,
            pagedList.HasPreviousPage
        );
    }
}
