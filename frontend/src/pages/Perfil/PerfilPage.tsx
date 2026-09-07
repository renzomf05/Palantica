import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { useAuth } from '../../hooks/useAuth';
import type { PerfilUsuario } from '../../types';
import { Skeleton } from '../../components/ui/Skeleton';
import { User, LogOut, Award, Star, Sliders, Briefcase, Camera, LogIn } from 'lucide-react';

export const PerfilPage: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPerfil() {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      try {
        const data = await authApi.getPerfil();
        setPerfil(data);
      } catch (err) {
        console.error('Error cargando perfil:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPerfil();
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated) {
    return (
      <div className="card-skeuomorphic animate-fade-in" style={{ padding: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <User size={48} color="var(--color-primary-sage)" />
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Perfil de Jugador</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', fontSize: '0.92rem', lineHeight: 1.5 }}>
          Accedé a tu perfil para consultar tus estadísticas de comunidad, votos térmicos y palas activas.
        </p>
        <Link to="/login" className="btn-primary" style={{ marginTop: '8px' }}>
          <LogIn size={16} />
          <span>Iniciar Sesión</span>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Skeleton height="160px" borderRadius="var(--radius-lg)" />
        <Skeleton height="200px" borderRadius="var(--radius-md)" />
      </div>
    );
  }

  if (!perfil) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      {/* Tarjeta de Identidad del Jugador */}
      <section
        className="card-skeuomorphic"
        style={{
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          background: 'radial-gradient(ellipse at top left, rgba(82, 183, 136, 0.12) 0%, var(--bg-card) 70%)',
          border: '1px solid var(--border-card-hover)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, var(--color-primary-sage) 0%, var(--color-primary-sage-dim) 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '1.8rem',
              fontFamily: 'Outfit, sans-serif',
              boxShadow: '0 4px 16px var(--color-primary-sage-glow)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            {perfil.nombre.charAt(0).toUpperCase()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900 }}>{perfil.nombre}</h1>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{perfil.email}</span>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <span className="badge badge-sage">{perfil.nivelJuego}</span>
              <span className="badge badge-neutral">Lado {perfil.ladoPistaPreferido}</span>
            </div>
          </div>
        </div>

        {/* Pala Activa Destacada */}
        {perfil.palaActivaId && (
          <div
            style={{
              padding: '14px 18px',
              background: 'var(--bg-input)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-card)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Award size={22} color="var(--color-primary-sage)" />
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Pala Titular de Competición
                </span>
                <p style={{ fontSize: '1rem', fontWeight: 800 }}>
                  {perfil.palaActivaMarca} {perfil.palaActivaModelo}
                </p>
              </div>
            </div>
            <Link
              to={`/palas/${perfil.palaActivaId}`}
              className="btn-secondary"
              style={{ padding: '7px 14px', fontSize: '0.8rem' }}
            >
              Ver Ficha
            </Link>
          </div>
        )}
      </section>

      {/* Grid de Estadísticas Comunitarias */}
      <section>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '14px' }}>
          Actividad en Palantica
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          <div className="card-skeuomorphic" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary-sage)' }}>
              <Star size={16} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Reviews</span>
            </div>
            <span style={{ fontSize: '1.8rem', fontWeight: 900 }}>{perfil.totalResenas}</span>
          </div>

          <div className="card-skeuomorphic" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-accent-steel)' }}>
              <Sliders size={16} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Votos</span>
            </div>
            <span style={{ fontSize: '1.8rem', fontWeight: 900 }}>{perfil.totalVotos}</span>
          </div>

          <div className="card-skeuomorphic" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-accent-amber)' }}>
              <Briefcase size={16} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Paletero</span>
            </div>
            <span style={{ fontSize: '1.8rem', fontWeight: 900 }}>{perfil.totalPaletero}</span>
          </div>

          <div className="card-skeuomorphic" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-accent-terracotta)' }}>
              <Camera size={16} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Padelgram</span>
            </div>
            <span style={{ fontSize: '1.8rem', fontWeight: 900 }}>{perfil.totalPadelgramPosts}</span>
          </div>
        </div>
      </section>

      {/* Botón de Logout */}
      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <button
          onClick={handleLogout}
          className="btn-secondary"
          style={{
            color: 'var(--color-accent-terracotta)',
            borderColor: 'rgba(224, 122, 95, 0.3)',
            marginTop: '12px',
          }}
        >
          <LogOut size={16} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};
