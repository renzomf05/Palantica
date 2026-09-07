namespace Palantica.Api.Common.Pagination;

/// <summary>
/// Estructura inmutable para representar un conjunto paginado de elementos con metadatos calculados.
/// </summary>
/// <typeparam name="T">Tipo de dato de los elementos contenidos.</typeparam>
public sealed class PagedList<T>
{
    /// <summary>
    /// Colección de elementos correspondientes a la página solicitada.
    /// </summary>
    public IReadOnlyList<T> Items { get; }

    /// <summary>
    /// Número de página actual (base 1).
    /// </summary>
    public int Page { get; }

    /// <summary>
    /// Cantidad de elementos por página.
    /// </summary>
    public int PageSize { get; }

    /// <summary>
    /// Cantidad total de registros existentes en la base de datos para la consulta.
    /// </summary>
    public int TotalCount { get; }

    /// <summary>
    /// Cantidad total de páginas disponibles.
    /// </summary>
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);

    /// <summary>
    /// Indica si existe una página posterior disponible.
    /// </summary>
    public bool HasNextPage => Page < TotalPages;

    /// <summary>
    /// Indica si existe una página previa disponible.
    /// </summary>
    public bool HasPreviousPage => Page > 1;

    /// <summary>
    /// Inicializa una nueva instancia de <see cref="PagedList{T}"/>.
    /// </summary>
    /// <param name="items">Colección de elementos.</param>
    /// <param name="page">Número de página actual.</param>
    /// <param name="pageSize">Tamaño de página.</param>
    /// <param name="totalCount">Total general de elementos.</param>
    public PagedList(IEnumerable<T> items, int page, int pageSize, int totalCount)
    {
        ArgumentNullException.ThrowIfNull(items);
        if (page < 1) throw new ArgumentOutOfRangeException(nameof(page), "La página debe ser mayor o igual a 1.");
        if (pageSize < 1) throw new ArgumentOutOfRangeException(nameof(pageSize), "El tamaño de página debe ser mayor a 0.");
        if (totalCount < 0) throw new ArgumentOutOfRangeException(nameof(totalCount), "El total no puede ser negativo.");

        Items = items.ToList().AsReadOnly();
        Page = page;
        PageSize = pageSize;
        TotalCount = totalCount;
    }
}
