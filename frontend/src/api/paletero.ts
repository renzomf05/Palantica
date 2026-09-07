import { apiClient } from './client';
import type { MiPaleteroGrouped, PaleteroItem } from '../types';

export const paleteroApi = {
  getMiPaletero: () =>
    apiClient.get<MiPaleteroGrouped>('/api/v1/paletero/mi-paletero'),

  addItem: (data: { palaId: number; categoria: string; notas?: string }) =>
    apiClient.post<PaleteroItem>('/api/v1/paletero/items', data),

  removeItem: (palaId: number, categoria: string) =>
    apiClient.delete(`/api/v1/paletero/items/${palaId}/${encodeURIComponent(categoria)}`),
};
