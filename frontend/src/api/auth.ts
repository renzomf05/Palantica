import { apiClient } from './client';
import type {
  AuthResponse,
  PerfilUsuario,
  RegistroPendienteResponse,
  TwoFactorRequeridoResponse,
  TwoFactorSetupResponse
} from '../types';

export const authApi = {
  registrar: (data: {
    email: string;
    password: string;
    nombre: string;
    nivelJuego?: string;
    ladoPistaPreferido?: string;
    avatarUrl?: string;
  }) => apiClient.post<RegistroPendienteResponse>('/api/v1/auth/registro', data),

  login: (data: { email: string; password: string }) =>
    apiClient.post<AuthResponse | TwoFactorRequeridoResponse>('/api/v1/auth/login', data),

  getPerfil: () => apiClient.get<PerfilUsuario>('/api/v1/auth/perfil'),

  // ÉPICA 2: Verificación de Correo (OTP 6 dígitos)
  verificarCodigo: (email: string, codigo: string) =>
    apiClient.post<AuthResponse>('/api/v1/auth/verificar-codigo', { email, codigo }),

  reenviarCodigo: (email: string) =>
    apiClient.post<{ message: string; email: string; devCode?: string }>('/api/v1/auth/reenviar-codigo', { email }),

  // ÉPICA 3: Autenticación en 2 Pasos (TOTP)
  configurar2FA: () =>
    apiClient.post<TwoFactorSetupResponse>('/api/v1/auth/2fa/configurar', {}),

  activar2FA: (secret: string, codigo: string) =>
    apiClient.post<{ message: string }>('/api/v1/auth/2fa/activar', { secret, codigo }),

  desactivar2FA: (password: string) =>
    apiClient.post<{ message: string }>('/api/v1/auth/2fa/desactivar', { password }),

  verificar2FALogin: (tempToken: string, codigo: string) =>
    apiClient.post<AuthResponse>('/api/v1/auth/2fa/verificar-login', { tempToken, codigo }),
};
