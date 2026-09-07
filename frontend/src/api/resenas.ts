import { apiClient } from './client';
import type { Resena, ResenaCreateRequest, PagedResponse } from '../types';

export const resenasApi = {
  getResenasPorPala: (palaId: number, page = 1, pageSize = 10) =>
    apiClient.get<PagedResponse<Resena>>(`/api/v1/palas/${palaId}/resenas`, { page, pageSize }),

  publicarResena: (palaId: number, data: ResenaCreateRequest) =>
    apiClient.post<Resena>(`/api/v1/palas/${palaId}/resenas`, data),
};
