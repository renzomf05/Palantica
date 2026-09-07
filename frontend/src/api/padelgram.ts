import { apiClient } from './client';
import type { PadelgramPost, PagedResponse } from '../types';

export const padelgramApi = {
  getFeed: (page = 1, pageSize = 12, palaId?: number) =>
    apiClient.get<PagedResponse<PadelgramPost>>('/api/v1/padelgram', { page, pageSize, palaId }),

  crearPost: (data: { palaId: number; imagenUrl: string; descripcion?: string; ubicacion?: string }) =>
    apiClient.post<PadelgramPost>('/api/v1/padelgram', data),

  darLike: (postId: number) =>
    apiClient.post<{ id: number; likesCount: number }>(`/api/v1/padelgram/${postId}/like`),
};
