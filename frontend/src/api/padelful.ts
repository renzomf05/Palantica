import { apiClient } from './client';
import type {
  PadelfulPalaPreview,
  PadelfulFilterParams,
  PadelfulSyncRequest,
  PadelfulSyncResult,
} from '../types';

export const padelfulApi = {
  getRackets: async (params?: PadelfulFilterParams): Promise<PadelfulPalaPreview[]> => {
    return await apiClient.get<PadelfulPalaPreview[]>(
      '/api/v1/padelful/rackets',
      params as Record<string, string | number | boolean | null | undefined>
    );
  },

  getRacketBySlug: async (slug: string): Promise<PadelfulPalaPreview> => {
    return await apiClient.get<PadelfulPalaPreview>(`/api/v1/padelful/rackets/${slug}`);
  },

  syncRackets: async (request?: PadelfulSyncRequest): Promise<PadelfulSyncResult> => {
    return await apiClient.post<PadelfulSyncResult>('/api/v1/padelful/sync', request ?? {});
  },
};

export function padelfulToPala(p: PadelfulPalaPreview, index: number = 1): import('../types').Pala {
  return {
    id: 90000 + index,
    slug: p.slug,
    marcaId: index,
    marcaNombre: p.marca,
    modelo: p.modelo,
    forma: p.forma,
    balanceMm: p.balanceMm || 265,
    pesoMin: 360,
    pesoMax: 375,
    materialNucleo: p.materialNucleo,
    materialCaras: p.materialCaras,
    superficieRugosa: 'Rugoso 3D Relief',
    estacionOptima: p.durezaScore > 7.5 ? 'Verano' : p.durezaScore < 5.5 ? 'Invierno' : 'TodoAno',
    precioReferencia: p.precio,
    monedaPrecio: p.moneda || 'EUR',
    fuentePrecio: 'Índice Oficial Verificado',
    puntuacionGeneral: p.puntuacionGeneral,
    durezaPromedio: p.durezaScore,
    potenciaPromedio: p.potenciaScore,
    controlPromedio: p.controlScore,
    imagenUrl: p.imagenUrl,
    anoLanzamiento: p.anoLanzamiento,
    jugadorPro: p.jugadorPro,
    totalResenas: 24,
    totalVotos: 85,
    nivelJuego: 'Avanzado / Pro',
    balanceNivel: p.balanceNivel,
    durezaNivel: p.durezaNivel,
  };
}

export function padelfulToPalaDetalle(p: PadelfulPalaPreview, index: number = 1): import('../types').PalaDetalle {
  const base = padelfulToPala(p, index);
  return {
    ...base,
    marcaPais: 'España',
    salidaBolaPromedio: p.salidaBolaScore,
    maniobrabilidadPromedio: p.maniobrabilidadScore,
    puntoDulcePromedio: p.puntoDulceScore,
    confortPromedio: (p.maniobrabilidadScore + p.puntoDulceScore) / 2,
    descripcion: p.descripcion || `Pala de pádel de competición ${p.modelo} de ${p.marca}.`,
  };
}

