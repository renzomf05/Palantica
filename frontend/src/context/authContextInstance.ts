import { createContext } from 'react';
import type { Usuario, AuthResponse, RegistroPendienteResponse } from '../types';

export interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ requires2FA?: boolean; tempToken?: string; email?: string } | void>;
  registrar: (data: {
    email: string;
    password: string;
    nombre: string;
    nivelJuego?: string;
    ladoPistaPreferido?: string;
  }) => Promise<RegistroPendienteResponse>;
  saveAuthSession: (authData: AuthResponse) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
