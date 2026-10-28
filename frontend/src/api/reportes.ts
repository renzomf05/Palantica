import { apiClient } from './client';
import type { Reporte } from '../types';

export const reportesApi = {
  crearReporte: async (asunto: string, mensaje: string): Promise<Reporte> => {
    return await apiClient.post<Reporte>('/api/v1/reportes', {
      asunto,
      mensaje,
    });
  },
};
