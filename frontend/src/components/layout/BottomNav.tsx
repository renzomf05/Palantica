import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, ArrowLeftRight, Camera, Briefcase, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const navItems = [
    { label: 'Inicio', path: '/', icon: Home },
    { label: 'Catálogo', path: '/catalogo', icon: Compass },
    { label: 'Comparar', path: '/comparador', icon: ArrowLeftRight },
    { label: 'Padelgram', path: '/padelgram', icon: Camera },
    { label: 'Paletero', path: '/paletero', icon: Briefcase },
    { label: 'Perfil', path: '/perfil', icon: User },
  ];

  return (
    <>
      <nav
        className="mobile-bottom-nav"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 'var(--nav-height)',
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--border-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '0 8px',
          zIndex: 100,
          boxShadow: '0 -4px 20px rgba(0,0,0,0.4)',
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                color: isActive ? 'var(--color-primary-sage)' : 'var(--text-secondary)',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                position: 'relative',
                textDecoration: 'none',
                minWidth: '58px',
              })}
            >
              {({ isActive }) => (
                <>
                  <div
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                    {isActive && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '-6px',
                          width: '4px',
                          height: '4px',
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--color-primary-sage)',
                          boxShadow: '0 0 8px var(--color-primary-sage)',
                        }}
                      />
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: isActive ? 700 : 500,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <style>{`
        @media (min-width: 768px) {
          .mobile-bottom-nav {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};
