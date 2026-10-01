import React, { useState, useEffect, type ReactNode } from 'react';
import { authApi } from '../api/auth';
import type { Usuario, AuthResponse } from '../types';
import { AuthContext } from './authContextInstance';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('palantica_jwt_token'));
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const saved = localStorage.getItem('palantica_usuario');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = React.useCallback(() => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem('palantica_jwt_token');
    localStorage.removeItem('palantica_usuario');
  }, []);

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
  }, [token, logout]);

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
