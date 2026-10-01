import { createContext } from 'react';
import type { Usuario } from '../types';

export interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  registrar: (data: {
    email: string;
    password: string;
    nombre: string;
    nivelJuego?: string;
    ladoPistaPreferido?: string;
  }) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
