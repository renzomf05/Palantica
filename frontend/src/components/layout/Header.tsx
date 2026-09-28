import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogIn, Moon, Sun, Home, Compass, ArrowLeftRight, Camera, Briefcase, User, Search, X } from 'lucide-react';

interface HeaderProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
  const { isAuthenticated, usuario } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Atajo de teclado global: Presionar '/' para enfocar el buscador rápido
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/catalogo?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/catalogo');
    }
  };

  const navItems = [
    { to: '/', label: 'Inicio', icon: Home },
    { to: '/catalogo', label: 'Catálogo', icon: Compass },
    { to: '/comparador', label: 'Comparador', icon: ArrowLeftRight },
    { to: '/padelgram', label: 'Padelgram', icon: Camera },
    { to: '/paletero', label: 'Paletero', icon: Briefcase },
    { to: '/perfil', label: 'Perfil', icon: User },
  ];

  return (
    <header
      style={{
        width: '100%',
        height: 'var(--header-height)',
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(18px)',
        borderBottom: '1px solid var(--border-card)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1720px',
          margin: '0 auto',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          gap: '20px',
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
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '0px',
              background: 'linear-gradient(135deg, var(--padel-court-blue-vibrant) 0%, var(--padel-court-blue) 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '1.45rem',
              fontFamily: 'var(--font-serif)',
              boxShadow: '0 4px 12px var(--padel-court-blue-glow), inset 0 1px 0 rgba(255,255,255,0.4)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            P
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontWeight: 800,
                fontSize: '1.45rem',
                letterSpacing: '-0.02em',
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
                color: 'var(--padel-turf-green)',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                marginTop: '3px',
              }}
            >
              Padel Lab & Encyclopedia
            </span>
          </div>
        </Link>

        {/* Buscador Rápido Desktop de Palantica (Visible en pantallas medianas y grandes) */}
        <form
          onSubmit={handleSearchSubmit}
          className="desktop-search-form"
          style={{
            flex: 1,
            maxWidth: '460px',
            position: 'relative',
          }}
        >
          <Search
            size={16}
            color="var(--text-muted)"
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
            }}
          />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar pala, marca, carbono o jugador pro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
            style={{
              paddingLeft: '38px',
              paddingRight: '62px',
              fontSize: '0.84rem',
              height: '38px',
              borderRadius: 'var(--radius-full)',
            }}
          />
          {searchTerm ? (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '34px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            >
              <X size={14} />
            </button>
          ) : (
            <kbd
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '0.68rem',
                padding: '2px 6px',
                borderRadius: '0px',
                background: 'var(--border-subtle)',
                color: 'var(--text-muted)',
                fontWeight: 700,
                border: '1px solid var(--border-card)',
                pointerEvents: 'none',
              }}
            >
              /
            </kbd>
          )}
        </form>

        {/* Navegación Desktop Horizontal */}
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
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.15)',
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
                    ? 'linear-gradient(180deg, var(--padel-court-blue-vibrant) 0%, var(--padel-court-blue) 100%)'
                    : 'transparent',
                  boxShadow: isActive ? '0 3px 10px var(--padel-court-blue-glow)' : 'none',
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

        {/* Acciones de Cabecera (Tema + Auth) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <button
            onClick={toggleTheme}
            aria-label="Alternar tema claro y oscuro"
            title={`Cambiar a modo ${theme === 'dark' ? 'claro (crema)' : 'oscuro (estadio azul nocturno)'}`}
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
            {theme === 'dark' ? (
              <Sun size={17} color="var(--padel-ball-yellow-vibrant)" />
            ) : (
              <Moon size={17} color="var(--padel-court-blue-vibrant)" />
            )}
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
                  background: 'var(--padel-court-blue-vibrant)',
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
      </div>

      <style>{`
        @media (max-width: 900px) {
          .desktop-search-form {
            display: none !important;
          }
        }
        @media (max-width: 767px) {
          .desktop-nav {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};
