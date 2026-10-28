import React, { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ShieldAlert } from 'lucide-react';

interface ProtectedAdminRouteProps {
  children: ReactNode;
}

export const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  const { isAuthenticated, usuario } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (usuario?.rol !== 'Admin') {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-3xl bg-[var(--bg-surface)] border border-red-500/20 shadow-2xl text-center flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
          <ShieldAlert size={36} />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)] m-0">Acceso Denegado</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Esta vista está reservada exclusivamente para administradores autorizados de Palantica.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
