using Palantica.Api.Common.Database;

namespace Palantica.Api.Features.Votaciones;

/// <summary>
/// Repositorio de acceso a datos para votaciones comunitarias conectado a Supabase.
/// </summary>
public sealed class VotacionRepository
{
    private readonly SupabaseRestClient client;

    public VotacionRepository(SupabaseRestClient client)
    {
        this.client = client ?? throw new ArgumentNullException(nameof(client));
    }

    private sealed record VotoRawRecord(
        int Id,
        int PalaId,
        int UsuarioId,
        int DurezaPercibida,
        int Potencia,
        int Control,
        int SalidaBola,
        int Maniobrabilidad,
        int PuntoDulce,
        int Confort,
        string EstacionRecomendada
    );

    public async Task<VotacionResumenResponse> GetResumenByPalaIdAsync(int palaId, CancellationToken cancellationToken = default)
    {
        if (palaId <= 0) throw new ArgumentOutOfRangeException(nameof(palaId));

        var (votos, _) = await client.GetListAsync<VotoRawRecord>("votos_atributos", $"pala_id=eq.{palaId}", cancellationToken);

        if (votos.Count == 0)
        {
            return new VotacionResumenResponse(
                PalaId: palaId,
                DurezaPromedio: 5.0f,
                PotenciaPromedio: 5.0f,
                ControlPromedio: 5.0f,
                SalidaBolaPromedio: 5.0f,
                ManiobrabilidadPromedio: 5.0f,
                PuntoDulcePromedio: 5.0f,
                ConfortPromedio: 5.0f,
                TotalVotos: 0,
                VotosVerano: 0,
                VotosInvierno: 0,
                VotosTodoAno: 0,
                EstacionDominante: "TodoAno"
            );
        }

        var votosVerano = votos.Count(v => v.EstacionRecomendada.Equals("Verano", StringComparison.OrdinalIgnoreCase));
        var votosInvierno = votos.Count(v => v.EstacionRecomendada.Equals("Invierno", StringComparison.OrdinalIgnoreCase));
        var votosTodoAno = votos.Count(v => v.EstacionRecomendada.Equals("TodoAno", StringComparison.OrdinalIgnoreCase));

        string dominante = "TodoAno";
        if (votosVerano > votosInvierno && votosVerano > votosTodoAno) dominante = "Verano";
        else if (votosInvierno > votosVerano && votosInvierno > votosTodoAno) dominante = "Invierno";

        return new VotacionResumenResponse(
            PalaId: palaId,
            DurezaPromedio: (float)Math.Round(votos.Average(v => v.DurezaPercibida), 1),
            PotenciaPromedio: (float)Math.Round(votos.Average(v => v.Potencia), 1),
            ControlPromedio: (float)Math.Round(votos.Average(v => v.Control), 1),
            SalidaBolaPromedio: (float)Math.Round(votos.Average(v => v.SalidaBola), 1),
            ManiobrabilidadPromedio: (float)Math.Round(votos.Average(v => v.Maniobrabilidad), 1),
            PuntoDulcePromedio: (float)Math.Round(votos.Average(v => v.PuntoDulce), 1),
            ConfortPromedio: (float)Math.Round(votos.Average(v => v.Confort), 1),
            TotalVotos: votos.Count,
            VotosVerano: votosVerano,
            VotosInvierno: votosInvierno,
            VotosTodoAno: votosTodoAno,
            EstacionDominante: dominante
        );
    }

    public async Task<VotacionResumenResponse> CreateOrUpdateVotoAsync(
        int palaId,
        int userId,
        VotoCreateRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);
        if (palaId <= 0) throw new ArgumentOutOfRangeException(nameof(palaId));
        if (userId <= 0) throw new ArgumentOutOfRangeException(nameof(userId));

        var payload = new
        {
            pala_id = palaId,
            usuario_id = userId,
            dureza_percibida = request.DurezaPercibida,
            potencia = request.Potencia,
            control = request.Control,
            salida_bola = request.SalidaBola,
            maniobrabilidad = request.Maniobrabilidad,
            punto_dulce = request.PuntoDulce,
            confort = request.Confort,
            estacion_recomendada = request.EstacionRecomendada ?? "TodoAno"
        };

        var existente = await client.GetSingleAsync<VotoRawRecord>("votos_atributos", $"pala_id=eq.{palaId}&usuario_id=eq.{userId}", cancellationToken);
        if (existente is not null)
        {
            await client.UpdateAsync<dynamic>("votos_atributos", $"pala_id=eq.{palaId}&usuario_id=eq.{userId}", payload, cancellationToken);
        }
        else
        {
            await client.InsertAsync<dynamic>("votos_atributos", payload, cancellationToken);
        }

        var resumen = await GetResumenByPalaIdAsync(palaId, cancellationToken);

        await client.UpdateAsync<dynamic>("palas", $"id=eq.{palaId}", new
        {
            total_votos = resumen.TotalVotos,
            dureza_promedio = resumen.DurezaPromedio,
            potencia_promedio = resumen.PotenciaPromedio,
            control_promedio = resumen.ControlPromedio,
            salida_bola_promedio = resumen.SalidaBolaPromedio,
            maniobrabilidad_promedio = resumen.ManiobrabilidadPromedio,
            punto_dulce_promedio = resumen.PuntoDulcePromedio,
            confort_promedio = resumen.ConfortPromedio
        }, cancellationToken);

        return resumen;
    }
}
