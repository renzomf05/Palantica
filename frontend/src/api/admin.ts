import { apiClient } from './client';
import type { AdminUsuario, Reporte, AdminEstadisticas } from '../types';

export const adminApi = {
  getUsuarios: async (): Promise<AdminUsuario[]> => {
    return await apiClient.get<AdminUsuario[]>('/api/v1/admin/usuarios');
  },

  cambiarRolUsuario: async (id: number, rol: string): Promise<{ mensaje: string }> => {
    return await apiClient.patch<{ mensaje: string }>(`/api/v1/admin/usuarios/${id}/rol`, { rol });
  },

  getReportes: async (estado?: string): Promise<Reporte[]> => {
    const params = estado ? { estado } : undefined;
    return await apiClient.get<Reporte[]>('/api/v1/admin/reportes', params);
  },

  actualizarEstadoReporte: async (id: number, estado: string): Promise<Reporte> => {
    return await apiClient.patch<Reporte>(`/api/v1/admin/reportes/${id}/estado`, { estado });
  },

  getEstadisticas: async (): Promise<AdminEstadisticas> => {
    return await apiClient.get<AdminEstadisticas>('/api/v1/admin/estadisticas');
  },
};
