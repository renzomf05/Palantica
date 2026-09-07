using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;

namespace Palantica.Api.Common.Database;

/// <summary>
/// Cliente HTTP de alto rendimiento para el motor PostgREST / Supabase con manejo de Service Role Key.
/// </summary>
public sealed class SupabaseRestClient
{
    private readonly HttpClient httpClient;
    private readonly string supabaseUrl;
    private readonly string apiKey;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
    };

    public SupabaseRestClient(IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(configuration);

        supabaseUrl = configuration["SUPABASE_URL"] ?? "https://detxepmluillmdknfanm.supabase.co";
        apiKey = configuration["SUPABASE_SERVICE_ROLE_KEY"]
                 ?? configuration["SUPABASE_ANON_KEY"]
                 ?? "***REMOVED***";

        httpClient = new HttpClient
        {
            BaseAddress = new Uri(supabaseUrl.TrimEnd('/') + "/rest/v1/")
        };

        httpClient.DefaultRequestHeaders.Add("apikey", apiKey);
        httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
    }

    public async Task<(IReadOnlyList<T> Items, int TotalCount)> GetListAsync<T>(
        string table,
        string queryParams = "",
        CancellationToken cancellationToken = default)
    {
        var requestUri = string.IsNullOrWhiteSpace(queryParams) ? table : $"{table}?{queryParams}";
        var request = new HttpRequestMessage(HttpMethod.Get, requestUri);
        request.Headers.Add("Prefer", "count=exact");

        var response = await httpClient.SendAsync(request, cancellationToken);
        response.EnsureSuccessStatusCode();

        int totalCount = 0;
        if (response.Headers.TryGetValues("Content-Range", out var rangeValues))
        {
            var rangeHeader = rangeValues.FirstOrDefault();
            if (!string.IsNullOrEmpty(rangeHeader) && rangeHeader.Contains('/'))
            {
                var parts = rangeHeader.Split('/');
                if (parts.Length > 1 && int.TryParse(parts[1], out var parsedTotal))
                {
                    totalCount = parsedTotal;
                }
            }
        }

        var json = await response.Content.ReadAsStringAsync(cancellationToken);
        var items = JsonSerializer.Deserialize<List<T>>(json, JsonOptions) ?? new List<T>();

        if (totalCount == 0) totalCount = items.Count;

        return (items.AsReadOnly(), totalCount);
    }

    public async Task<T?> GetSingleAsync<T>(string table, string queryParams, CancellationToken cancellationToken = default)
    {
        var (items, _) = await GetListAsync<T>(table, queryParams, cancellationToken);
        return items.FirstOrDefault();
    }

    public async Task<T> InsertAsync<T>(string table, object payload, CancellationToken cancellationToken = default)
    {
        var jsonPayload = JsonSerializer.Serialize(payload, JsonOptions);
        var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

        var request = new HttpRequestMessage(HttpMethod.Post, table) { Content = content };
        request.Headers.Add("Prefer", "return=representation");

        var response = await httpClient.SendAsync(request, cancellationToken);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync(cancellationToken);
        var items = JsonSerializer.Deserialize<List<T>>(json, JsonOptions);
        return items != null && items.Count > 0 ? items[0] : default!;
    }

    public async Task<T?> UpdateAsync<T>(string table, string filterParams, object payload, CancellationToken cancellationToken = default)
    {
        var jsonPayload = JsonSerializer.Serialize(payload, JsonOptions);
        var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

        var requestUri = $"{table}?{filterParams}";
        var request = new HttpRequestMessage(HttpMethod.Patch, requestUri) { Content = content };
        request.Headers.Add("Prefer", "return=representation");

        var response = await httpClient.SendAsync(request, cancellationToken);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync(cancellationToken);
        var items = JsonSerializer.Deserialize<List<T>>(json, JsonOptions);
        return items != null && items.Count > 0 ? items[0] : default;
    }

    public async Task<bool> DeleteAsync(string table, string filterParams, CancellationToken cancellationToken = default)
    {
        var requestUri = $"{table}?{filterParams}";
        var response = await httpClient.DeleteAsync(requestUri, cancellationToken);
        return response.IsSuccessStatusCode;
    }
}
