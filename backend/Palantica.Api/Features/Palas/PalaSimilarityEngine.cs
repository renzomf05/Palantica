namespace Palantica.Api.Features.Palas;

/// <summary>
/// Motor algorítmico multicriterio para el cálculo de similitud vectorial entre palas de pádel.
/// Implementa normalización de características técnicas, distancias euclidianas y similitud coseno ponderada.
/// </summary>
public sealed class PalaSimilarityEngine
{
    /// <summary>
    /// Calcula las palas más similares a la pala objetivo a partir del catálogo completo.
    /// </summary>
    /// <param name="palaObjetivo">Pala de referencia para la cual se buscan equivalencias.</param>
    /// <param name="todasLasPalas">Catálogo completo de palas en la base de datos.</param>
    /// <param name="limit">Cantidad máxima de recomendaciones a retornar (por defecto 4).</param>
    /// <returns>Lista de palas similares ordenadas por porcentaje de similitud descendente.</returns>
    public IReadOnlyList<PalaSimilarResponse> CalculateSimilarPalas(
        PalaDetalleResponse palaObjetivo,
        IEnumerable<PalaListResponse> todasLasPalas,
        int limit = 4)
    {
        ArgumentNullException.ThrowIfNull(palaObjetivo);
        ArgumentNullException.ThrowIfNull(todasLasPalas);
        if (limit <= 0) limit = 4;

        var targetVector = extractFeatureVector(palaObjetivo);

        var similarities = new List<PalaSimilarResponse>();

        foreach (var candidate in todasLasPalas)
        {
            // Omitir la misma pala
            if (candidate.Id == palaObjetivo.Id) continue;

            var candidateVector = extractFeatureVectorFromList(candidate);

            var cosineSim = calculateCosineSimilarity(targetVector, candidateVector);
            var euclideanDist = calculateNormalizedEuclideanDistance(targetVector, candidateVector);

            // Puntuación combinada (80% Coseno, 20% Proximidad Euclidiana)
            var combinedScore = (cosineSim * 0.80) + ((1.0 - euclideanDist) * 0.20);
            var percentage = Math.Clamp(Math.Round(combinedScore * 100.0, 1), 0.0, 100.0);

            similarities.Add(new PalaSimilarResponse(
                Id: candidate.Id,
                MarcaId: candidate.MarcaId,
                MarcaNombre: candidate.MarcaNombre,
                Modelo: candidate.Modelo,
                Forma: candidate.Forma,
                ImagenUrl: candidate.ImagenUrl,
                PrecioReferencia: candidate.PrecioReferencia,
                MonedaPrecio: candidate.MonedaPrecio,
                FuentePrecio: candidate.FuentePrecio,
                PuntuacionGeneral: candidate.PuntuacionGeneral,
                DurezaPromedio: candidate.DurezaPromedio,
                SimilitudPorcentaje: percentage,
                DistanciaVectorial: Math.Round(euclideanDist, 4)
            ));
        }

        return similarities
            .OrderByDescending(s => s.SimilitudPorcentaje)
            .ThenBy(s => s.DistanciaVectorial)
            .Take(limit)
            .ToList()
            .AsReadOnly();
    }

    /// <summary>
    /// Extrae un vector numérico normalizado de características en el rango [0, 1].
    /// </summary>
    private static double[] extractFeatureVector(PalaDetalleResponse p)
    {
        return new double[]
        {
            mapFormaToValue(p.Forma),                          // 0: Forma geométrica (0.0 a 1.0)
            normalizeRange(p.BalanceMm, 240.0, 290.0),          // 1: Balance (mm)
            normalizeRange((p.PesoMin + p.PesoMax) / 2.0, 340, 390), // 2: Peso promedio (g)
            mapMaterialCaras(p.MaterialCaras),                 // 3: Dureza del carbono/fibra
            mapMaterialNucleo(p.MaterialNucleo),               // 4: Densidad de la goma
            normalizeRange(p.DurezaPromedio, 1.0, 10.0),        // 5: Dureza comunitaria
            normalizeRange(p.PotenciaPromedio, 1.0, 10.0),      // 6: Potencia
            normalizeRange(p.ControlPromedio, 1.0, 10.0),       // 7: Control
            normalizeRange(p.SalidaBolaPromedio, 1.0, 10.0),    // 8: Salida de bola
            normalizeRange(p.ManiobrabilidadPromedio, 1.0, 10.0), // 9: Maniobrabilidad
            normalizeRange(p.PuntoDulcePromedio, 1.0, 10.0),    // 10: Punto dulce
            normalizeRange(p.ConfortPromedio, 1.0, 10.0)        // 11: Confort de brazo
        };
    }

    private static double[] extractFeatureVectorFromList(PalaListResponse p)
    {
        return new double[]
        {
            mapFormaToValue(p.Forma),
            normalizeRange(p.BalanceMm, 240.0, 290.0),
            normalizeRange((p.PesoMin + p.PesoMax) / 2.0, 340, 390),
            mapMaterialCaras(p.MaterialCaras),
            mapMaterialNucleo(p.MaterialNucleo),
            normalizeRange(p.DurezaPromedio, 1.0, 10.0),
            normalizeRange(p.PotenciaPromedio, 1.0, 10.0),
            normalizeRange(p.ControlPromedio, 1.0, 10.0),
            normalizeRange(5.0, 1.0, 10.0), // Default neutro si no viene en lista
            normalizeRange(5.0, 1.0, 10.0),
            normalizeRange(5.0, 1.0, 10.0),
            normalizeRange(5.0, 1.0, 10.0)
        };
    }

    private static double mapFormaToValue(string forma) => forma.Trim().ToLowerInvariant() switch
    {
        "redonda" => 0.1,
        "hibrida" or "lágrima" or "lagrima" => 0.5,
        "diamante" => 0.9,
        _ => 0.5
    };

    private static double mapMaterialCaras(string caras)
    {
        var c = caras.ToLowerInvariant();
        if (c.Contains("vidrio") || c.Contains("fiber")) return 0.2;
        if (c.Contains("3k")) return 0.4;
        if (c.Contains("12k")) return 0.6;
        if (c.Contains("15k") || c.Contains("18k")) return 0.8;
        if (c.Contains("24k") || c.Contains("alumin")) return 1.0;
        return 0.5;
    }

    private static double mapMaterialNucleo(string nucleo)
    {
        var n = nucleo.ToLowerInvariant();
        if (n.Contains("foam") || n.Contains("soft")) return 0.2;
        if (n.Contains("multieva") || n.Contains("hr3")) return 0.5;
        if (n.Contains("black eva") || n.Contains("hard")) return 0.85;
        return 0.5;
    }

    private static double normalizeRange(double value, double min, double max)
    {
        if (max <= min) return 0.5;
        return Math.Clamp((value - min) / (max - min), 0.0, 1.0);
    }

    private static double calculateCosineSimilarity(double[] vectorA, double[] vectorB)
    {
        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < vectorA.Length; i++)
        {
            dotProduct += vectorA[i] * vectorB[i];
            normA += vectorA[i] * vectorA[i];
            normB += vectorB[i] * vectorB[i];
        }

        if (normA == 0.0 || normB == 0.0) return 0.0;
        return Math.Clamp(dotProduct / (Math.Sqrt(normA) * Math.Sqrt(normB)), 0.0, 1.0);
    }

    private static double calculateNormalizedEuclideanDistance(double[] vectorA, double[] vectorB)
    {
        double sumSquares = 0.0;
        for (int i = 0; i < vectorA.Length; i++)
        {
            var diff = vectorA[i] - vectorB[i];
            sumSquares += diff * diff;
        }

        var maxPossibleDistance = Math.Sqrt(vectorA.Length); // Porque cada dimensión está normalizada en [0,1]
        return Math.Clamp(Math.Sqrt(sumSquares) / maxPossibleDistance, 0.0, 1.0);
    }
}
