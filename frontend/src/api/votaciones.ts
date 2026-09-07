import { apiClient } from './client';
import type { VotacionResumen, VotoCreateRequest } from '../types';

export const votacionesApi = {
  getResumen: (palaId: number) =>
    apiClient.get<VotacionResumen>(`/api/v1/palas/${palaId}/votos`),

  emitirVoto: (palaId: number, data: VotoCreateRequest) =>
    apiClient.post<VotacionResumen>(`/api/v1/palas/${palaId}/votos`, data),
};
