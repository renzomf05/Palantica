import { apiClient } from './client';
import type { AuthResponse, PerfilUsuario } from '../types';

export const authApi = {
  registrar: (data: {
    email: string;
    password: string;
    nombre: string;
    nivelJuego?: string;
    ladoPistaPreferido?: string;
    avatarUrl?: string;
  }) => apiClient.post<AuthResponse>('/api/v1/auth/registro', data),

  login: (data: { email: string; password: string }) =>
    apiClient.post<AuthResponse>('/api/v1/auth/login', data),

  getPerfil: () => apiClient.get<PerfilUsuario>('/api/v1/auth/perfil'),
};
