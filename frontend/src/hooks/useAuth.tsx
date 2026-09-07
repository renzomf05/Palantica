import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi } from '../api/auth';
import type { Usuario, AuthResponse } from '../types';

interface AuthContextType {
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('palantica_jwt_token'));
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const saved = localStorage.getItem('palantica_usuario');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function verifySession() {
      if (token) {
        try {
          const perfil = await authApi.getPerfil();
          setUsuario(perfil);
          localStorage.setItem('palantica_usuario', JSON.stringify(perfil));
        } catch {
          // Token inválido o expirado
          logout();
        }
      }
      setIsLoading(false);
    }
    verifySession();
  }, [token]);

  const saveAuthSession = (authData: AuthResponse) => {
    setToken(authData.token);
    const userObj: Usuario = {
      id: authData.id,
      email: authData.email,
      nombre: authData.nombre,
      rol: authData.rol,
      nivelJuego: authData.nivelJuego,
      ladoPistaPreferido: authData.ladoPistaPreferido,
      avatarUrl: authData.avatarUrl,
    };
    setUsuario(userObj);
    localStorage.setItem('palantica_jwt_token', authData.token);
    localStorage.setItem('palantica_usuario', JSON.stringify(userObj));
  };

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    saveAuthSession(response);
  };

  const registrar = async (data: {
    email: string;
    password: string;
    nombre: string;
    nivelJuego?: string;
    ladoPistaPreferido?: string;
  }) => {
    const response = await authApi.registrar(data);
    saveAuthSession(response);
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem('palantica_jwt_token');
    localStorage.removeItem('palantica_usuario');
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        isAuthenticated: !!token && !!usuario,
        isLoading,
        login,
        registrar,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
