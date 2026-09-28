import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { MobileLayout } from './components/layout/MobileLayout';
import { HomePage } from './pages/Home/HomePage';
import { CatalogoPage } from './pages/Catalogo/CatalogoPage';
import { PalaDetallePage } from './pages/PalaDetalle/PalaDetallePage';
import { ComparadorPage } from './pages/Comparador/ComparadorPage';
import { PadelgramPage } from './pages/Padelgram/PadelgramPage';
import { PaleteroPage } from './pages/Paletero/PaleteroPage';
import { PerfilPage } from './pages/Perfil/PerfilPage';
import { LoginPage } from './pages/Auth/LoginPage';
import { RegistroPage } from './pages/Auth/RegistroPage';

const NotFoundPage: React.FC = () => (
  <div
    className="card-skeuomorphic"
    style={{
      padding: '48px 24px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
      marginTop: '40px',
    }}
  >
    <h1 style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--color-primary-sage)' }}>404</h1>
    <h2 style={{ fontSize: '1.4rem' }}>Página no encontrada</h2>
    <p style={{ color: 'var(--text-secondary)', maxWidth: '360px' }}>
      La pista o sección que buscás no existe o fue trasladada.
    </p>
    <Link to="/" className="btn-primary" style={{ marginTop: '8px' }}>
      Volver al Inicio
    </Link>
  </div>
);

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MobileLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalogo" element={<CatalogoPage />} />
            <Route path="/palas/:id" element={<PalaDetallePage />} />
            <Route path="/comparador" element={<ComparadorPage />} />
            <Route path="/padelgram" element={<PadelgramPage />} />
            <Route path="/paletero" element={<PaleteroPage />} />
            <Route path="/perfil" element={<PerfilPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegistroPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </MobileLayout>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
