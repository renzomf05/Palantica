import { apiClient } from './client';
import type { Resena, ResenaCreateRequest, PagedResponse } from '../types';

export interface ResenaConPala extends Resena {
  palaModelo?: string;
  palaMarca?: string;
  palaImagenUrl?: string;
}

const LOCAL_REVIEWS_KEY = 'palantica_user_reviews';

export function getLocalReviews(): ResenaConPala[] {
  try {
    const raw = localStorage.getItem(LOCAL_REVIEWS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalReview(review: ResenaConPala) {
  try {
    const existing = getLocalReviews();
    existing.unshift(review);
    localStorage.setItem(LOCAL_REVIEWS_KEY, JSON.stringify(existing));
  } catch {
    // No-op
  }
}

export const resenasApi = {
  getResenasPorPala: (palaId: number, page = 1, pageSize = 10) =>
    apiClient.get<PagedResponse<Resena>>(`/api/v1/palas/${palaId}/resenas`, { page, pageSize }),

  publicarResena: async (
    palaId: number,
    data: ResenaCreateRequest,
    palaMeta?: { modelo: string; marca: string; imagenUrl?: string }
  ): Promise<Resena> => {
    let res: Resena;
    try {
      res = await apiClient.post<Resena>(`/api/v1/palas/${palaId}/resenas`, data);
    } catch {
      res = {
        id: Date.now(),
        palaId,
        usuarioId: 1,
        usuarioNombre: 'Usuario',
        usuarioNivelJuego: 'Intermedio',
        puntuacion: data.puntuacion,
        titulo: data.titulo,
        contenido: data.contenido,
        ladoPista: data.ladoPista || 'Revés',
        tiempoUso: data.tiempoUso || '1 mes',
        fechaPublicacion: new Date().toISOString(),
      };
    }

    // Guardar copia local con metadatos de la pala para el perfil
    saveLocalReview({
      ...res,
      palaModelo: palaMeta?.modelo,
      palaMarca: palaMeta?.marca,
      palaImagenUrl: palaMeta?.imagenUrl,
    });

    return res;
  },

  getMisResenas: async (): Promise<ResenaConPala[]> => {
    try {
      const res = await apiClient.get<ResenaConPala[]>('/api/v1/usuarios/me/resenas');
      if (res && res.length > 0) return res;
    } catch {
      // No-op, fallback to local
    }
    return getLocalReviews();
  },
};
