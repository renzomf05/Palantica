import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogIn, Moon, Sun, Home, Compass, Camera, Briefcase, User } from 'lucide-react';

interface HeaderProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
  const { isAuthenticated, usuario } = useAuth();
  const location = useLocation();

  const navItems = [
    { to: '/', label: 'Inicio', icon: Home },
    { to: '/catalogo', label: 'Catálogo', icon: Compass },
    { to: '/padelgram', label: 'Padelgram', icon: Camera },
    { to: '/paletero', label: 'Paletero', icon: Briefcase },
    { to: '/perfil', label: 'Perfil', icon: User },
  ];

  return (
    <header
      style={{
        height: 'var(--header-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-card)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Brand Logo Oficial Palantica */}
      <Link
        to="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          textDecoration: 'none',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--color-primary-sage) 0%, var(--color-primary-sage-dim) 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: '1.3rem',
            fontFamily: 'Outfit, sans-serif',
            boxShadow: '0 3px 10px var(--color-primary-sage-glow), inset 0 1px 0 rgba(255,255,255,0.3)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          P
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 900,
              fontSize: '1.35rem',
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              lineHeight: 1,
            }}
          >
            PALANTICA
          </span>
          <span
            style={{
              fontSize: '0.62rem',
              fontWeight: 700,
              color: 'var(--color-primary-sage)',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              marginTop: '2px',
            }}
          >
            Padel Lab & Encyclopedia
          </span>
        </div>
      </Link>

      {/* Navegación Desktop Horizontal (Visible en Pantallas Medianas y Grandes) */}
      <nav
        className="desktop-nav"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--bg-input)',
          padding: '4px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-card)',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)',
        }}
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
          const Icon = item.icon;

          return (
            <Link
              key={item.to}
              to={item.to}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.84rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                background: isActive
                  ? 'linear-gradient(180deg, var(--color-primary-sage) 0%, var(--color-primary-sage-dim) 100%)'
                  : 'transparent',
                boxShadow: isActive ? 'var(--shadow-btn-primary)' : 'none',
                transition: 'all 0.2s ease',
                textDecoration: 'none',
              }}
            >
              <Icon size={15} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Acciones de Cabecera */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={toggleTheme}
          aria-label="Alternar tema claro y oscuro"
          title={`Cambiar a modo ${theme === 'dark' ? 'claro (crema)' : 'oscuro (slate)'}`}
          className="btn-secondary"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-full)',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {theme === 'dark' ? <Sun size={17} color="var(--color-accent-amber)" /> : <Moon size={17} color="var(--color-accent-steel)" />}
        </button>

        {isAuthenticated && usuario ? (
          <Link
            to="/perfil"
            className="btn-secondary"
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-primary-sage)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.75rem',
              }}
            >
              {usuario.nombre.charAt(0).toUpperCase()}
            </div>
            <span style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {usuario.nombre.split(' ')[0]}
            </span>
          </Link>
        ) : (
          <Link
            to="/login"
            className="btn-primary"
            style={{
              padding: '7px 16px',
              fontSize: '0.82rem',
              borderRadius: 'var(--radius-full)',
            }}
          >
            <LogIn size={14} />
            <span>Ingresar</span>
          </Link>
        )}
      </div>

      <style>{`
        @media (max-width: 767px) {
          .desktop-nav {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};
