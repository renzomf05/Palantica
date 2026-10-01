import { apiClient } from './client';
import type { Pala, PalaDetalle, PalaSimilar, PalaFilterParams, PagedResponse, Marca } from '../types';

export const palasApi = {
  getPalas: (params?: PalaFilterParams) =>
    apiClient.get<PagedResponse<Pala>>('/api/v1/palas', params as Record<string, string | number | boolean | null | undefined>),

  getPalaDetalle: (id: number) =>
    apiClient.get<PalaDetalle>(`/api/v1/palas/${id}`),

  getPalasSimilares: (id: number, limit = 4) =>
    apiClient.get<PalaSimilar[]>(`/api/v1/palas/${id}/similares`, { limit }),

  getMarcas: () =>
    apiClient.get<Marca[]>('/api/v1/marcas'),
};
