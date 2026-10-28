import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MobileLayout } from './components/layout/MobileLayout';
import { HomePage } from './pages/Home/HomePage';
import { PaletasPage } from './pages/Paletas/PaletasPage';
import { PalaDetallePage } from './pages/PalaDetalle/PalaDetallePage';
import { FeedPage } from './pages/Feed/FeedPage';
import { ForoPage } from './pages/Foro/ForoPage';
import { AboutPage } from './pages/About/AboutPage';
import { PaleteroPage } from './pages/Paletero/PaleteroPage';
import { PerfilPage } from './pages/Perfil/PerfilPage';
import { LoginPage } from './pages/Auth/LoginPage';
import { RegistroPage } from './pages/Auth/RegistroPage';
import { VerificarEmailPage } from './pages/Auth/VerificarEmailPage';
import { AdminPage } from './pages/Admin/AdminPage';
import { ProtectedAdminRoute } from './components/auth/ProtectedAdminRoute';

const NotFoundPage: React.FC = () => (
  <div className="max-w-md mx-auto my-16 p-8 rounded-3xl bg-[var(--bg-surface)] border border-white/10 shadow-2xl text-center flex flex-col items-center gap-4">
    <span className="text-6xl font-black text-emerald-400 tracking-tighter">404</span>
    <h1 className="text-2xl font-black tracking-tight text-white m-0">Página no encontrada</h1>
    <p className="text-sm text-zinc-400">
      La pista o sección que buscas no existe o fue trasladada al nuevo diseño.
    </p>
    <Link
      to="/"
      className="mt-2 px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-xs transition-colors"
    >
      Volver a Noticias
    </Link>
  </div>
);

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MobileLayout>
          <Routes>
            {/* Rutas principales del rediseño Fragrantica */}
            <Route path="/" element={<HomePage />} />
            <Route path="/paletas" element={<PaletasPage />} />
            <Route path="/paletas/:id" element={<PalaDetallePage />} />
            <Route path="/palas/:id" element={<PalaDetallePage />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/foro" element={<ForoPage />} />
            <Route path="/about" element={<AboutPage />} />

            {/* Redirecciones de rutas auxiliares */}
            <Route path="/catalogo-padelful" element={<Navigate to="/paletas" replace />} />
            <Route path="/catalogo" element={<Navigate to="/paletas" replace />} />
            <Route path="/comparador" element={<Navigate to="/paletas" replace />} />
            <Route path="/padelgram" element={<Navigate to="/feed" replace />} />

            {/* Funcionalidades auxiliares */}
            <Route path="/paletero" element={<PaleteroPage />} />
            <Route path="/perfil" element={<PerfilPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminPage />
                </ProtectedAdminRoute>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegistroPage />} />
            <Route path="/verificar-email" element={<VerificarEmailPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </MobileLayout>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
