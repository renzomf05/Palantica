import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Container } from './Container';
import {
  Search,
  Moon,
  Sun,
  User,
  ArrowRight,
  Menu,
  X
} from 'lucide-react';

interface HeaderProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
  const { isAuthenticated, usuario } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Atajo global de teclado: Ctrl + K o '/' para enfocar el buscador
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && e.key.toLowerCase() === 'k') ||
        (e.metaKey && e.key.toLowerCase() === 'k') ||
        (e.key === '/' && document.activeElement !== searchInputRef.current)
      ) {
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
      navigate(`/paletas?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/paletas');
    }
  };

  const navLinks = [
    { to: '/', label: 'Noticias' },
    { to: '/paletas', label: 'Paletas' },
    { to: '/feed', label: 'Feed' },
    { to: '/foro', label: 'Foro' },
    { to: '/about', label: 'About' },
  ];

  return (
    <header className="w-full bg-[var(--bg-deep)] border-b border-white/10 sticky top-0 z-50">
      {/* 1. NAVBAR SUPERIOR: Centrada, altura mínima 80px */}
      <div className="w-full min-h-[80px] flex justify-center items-center border-b border-white/5">
        <Container className="min-h-[80px] flex items-center justify-between lg:grid lg:grid-cols-[1fr_auto_1fr] gap-6">
          {/* Columna Izquierda: Marca (Logo circular 48px + PALANTICA con margen limpio) */}
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 select-none flex-shrink-0 justify-self-start group pl-1 sm:pl-2"
          >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-zinc-950 font-black text-xl shadow-lg shadow-emerald-500/25 transition-transform duration-200 group-hover:scale-105 flex-shrink-0">
            P
          </div>
          <div className="flex flex-col">
            <span className="font-black text-2xl sm:text-[26px] tracking-tighter text-[var(--text-primary)] leading-none">
              PALANTICA
            </span>
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-[0.2em] leading-tight mt-1">
              Enciclopedia del Pádel
            </span>
          </div>
        </Link>

        {/* Columna Central: Links centrados exactamente en el medio de la pantalla (Desktop) */}
        <nav className="hidden lg:flex items-center justify-center gap-2 justify-self-center">
          {navLinks.map((link) => {
            const isActive =
              link.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(link.to);

            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={`px-4 py-2.5 rounded-full text-base font-semibold tracking-tight transition-all duration-200 ${isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Columna Derecha: Acciones alineadas a la derecha con gap de 12-16px */}
        <div className="flex items-center gap-3 lg:gap-4 justify-self-end">
          {/* Botón rápido para enfocar buscador: ícono 24px en botón 44-48px */}
          <button
            type="button"
            onClick={() => searchInputRef.current?.focus()}
            aria-label="Buscar"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <Search size={24} />
          </button>

          {/* Selector de Tema Claro/Oscuro: ícono 24px en botón 44-48px */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-zinc-400 hover:text-amber-400 hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
          </button>

          {/* Botón Ingresar / Perfil: Altura 44px, px-5, texto 15-16px, ícono 20px */}
          {isAuthenticated && usuario ? (
            <Link
              to="/perfil"
              onClick={() => setIsMobileMenuOpen(false)}
              className="h-11 pl-2.5 pr-4 rounded-full flex items-center gap-2.5 bg-zinc-800/80 border border-white/10 hover:border-emerald-400/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              {usuario.avatarUrl ? (
                <img
                  src={usuario.avatarUrl}
                  alt={usuario.nombre}
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center text-xs font-bold">
                  {usuario.nombre.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm font-bold text-zinc-200 hidden sm:inline max-w-[100px] truncate">
                {usuario.nombre}
              </span>
            </Link>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="h-11 px-5 rounded-full flex items-center gap-2 text-[15px] sm:text-base font-bold bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <User size={20} />
              <span>Ingresar</span>
            </Link>
          )}

          {/* Menú hamburguesa para Mobile y Tablet (< lg) */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú de navegación'}
            className="lg:hidden w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          </div>
        </Container>
      </div>

      {/* Menú desplegable en Mobile y Tablet (< lg) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden w-full bg-[var(--bg-surface)] border-t border-b border-white/10 shadow-2xl animate-fade-in">
          <Container className="py-4 flex flex-col gap-2">
            {navLinks.map((link) => {
              const isActive =
                link.to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(link.to);

              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`h-12 px-4 flex items-center rounded-xl text-base font-semibold tracking-tight transition-all duration-200 ${isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'text-zinc-300 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {link.label}
                </NavLink>
              );
            })}
          </Container>
        </div>
      )}

      {/* 2. BUSCADOR GLOBAL: Centrado dentro de Container */}
      <div className="w-full bg-[var(--bg-surface)] border-t border-b border-white/10 py-3 sm:py-3.5 flex justify-center">
        <Container>
          <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center">
            <Search
              size={24}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar paletas, marcas, jugadores, noticias..."
              className="w-full h-14 pl-14 pr-28 sm:pr-36 rounded-2xl bg-[var(--bg-input)] border border-white/10 text-white placeholder-zinc-400 text-base font-medium tracking-tight outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
            {/* Atajo Ctrl + K con dos teclas separadas */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1.5 pointer-events-none">
              <kbd className="px-2.5 py-1 text-xs font-semibold text-zinc-300 bg-zinc-800 border border-zinc-700 rounded-md shadow-sm">
                Ctrl
              </kbd>
              <span className="text-zinc-500 text-xs font-bold">+</span>
              <kbd className="px-2.5 py-1 text-xs font-semibold text-zinc-300 bg-zinc-800 border border-zinc-700 rounded-md shadow-sm">
                K
              </kbd>
            </div>
          </form>
        </Container>
      </div>

      {/* 3. BARRA DE FEED: Centrado dentro de Container, altura 44px */}
      <div className="w-full bg-zinc-950/90 border-b border-white/5 py-1.5 flex justify-center">
        <Container className="flex items-center justify-between gap-4 text-xs h-11 w-full">
          <div className="flex items-center gap-3 text-zinc-300 truncate">
            <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="truncate font-medium text-xs sm:text-sm text-zinc-300">
              De qué está hablando la comunidad ahora mismo
            </span>
          </div>

          <Link
            to="/feed"
            className="inline-flex items-center gap-2 font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex-shrink-0 text-xs sm:text-sm"
          >
            <span>Abrir el Feed</span>
            <ArrowRight size={18} />
          </Link>
        </Container>
      </div>
    </header>
  );
};
