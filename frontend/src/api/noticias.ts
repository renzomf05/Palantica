import { apiClient } from './client';
import type { Noticia } from '../types';

export const noticiasApi = {
  getNoticias: (limit = 10) =>
    apiClient.get<Noticia[]>('/api/v1/noticias', { limit }),
};
