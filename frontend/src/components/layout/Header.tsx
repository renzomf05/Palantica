import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Container } from './Container';
import { padelfulApi } from '../../api/padelful';
import type { PadelfulPalaPreview } from '../../types';
import {
  Search,
  Moon,
  Sun,
  User,
  Menu,
  X,
  ChevronRight,
  Layers
} from 'lucide-react';

interface HeaderProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
  const { isAuthenticated, usuario } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState('');
  const [quickResults, setQuickResults] = useState<PadelfulPalaPreview[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Sincronizar el input si ya venimos con un parámetro ?search= en /paletas
  useEffect(() => {
    if (location.pathname === '/paletas') {
      const q = searchParams.get('search') || '';
      setSearchTerm(q);
    }
  }, [location.pathname, searchParams]);

  // Cerrar dropdown si se hace click afuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Búsqueda en tiempo real letra a letra con debounce de 180ms
  useEffect(() => {
    const trimmed = searchTerm.trim();

    // 1. Si estamos en /paletas, actualizar la URL en tiempo real para que la grilla filtre letra por letra
    if (location.pathname === '/paletas') {
      const currentParam = searchParams.get('search') || '';
      if (trimmed !== currentParam) {
        const timer = setTimeout(() => {
          const next = new URLSearchParams(searchParams);
          if (trimmed) {
            next.set('search', trimmed);
          } else {
            next.delete('search');
          }
          navigate(`/paletas?${next.toString()}`, { replace: true });
        }, 180);
        return () => clearTimeout(timer);
      }
    }

    // 2. Cargar sugerencias rápidas para el dropdown flotante si tiene 2+ letras
    if (trimmed.length >= 2) {
      const timer = setTimeout(async () => {
        try {
          const results = await padelfulApi.getRackets({ query: trimmed, limit: 5 });
          setQuickResults(results || []);
          setShowDropdown(true);
        } catch {
          setQuickResults([]);
        }
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setQuickResults([]);
      setShowDropdown(false);
    }
  }, [searchTerm, location.pathname, searchParams, navigate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    if (searchTerm.trim()) {
      navigate(`/paletas?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/paletas');
    }
  };

  const handleSelectQuickResult = (slug: string) => {
    setShowDropdown(false);
    navigate(`/palas/${slug}`);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setShowDropdown(false);
    if (location.pathname === '/paletas') {
      const next = new URLSearchParams(searchParams);
      next.delete('search');
      navigate(`/paletas?${next.toString()}`, { replace: true });
    }
    searchInputRef.current?.focus();
  };

  const navLinks = [
    { to: '/', label: 'Noticias' },
    { to: '/paletas', label: 'Paletas' },
    { to: '/feed', label: 'Padelgram' },
    ...(usuario?.rol === 'Admin' ? [{ to: '/admin', label: 'Admin' }] : []),
    { to: '/foro', label: 'Foro' },
    { to: '/about', label: 'About' },
  ];


  return (
    <header className="w-full bg-[var(--bg-deep)] border-b border-zinc-200 dark:border-white/10 sticky top-0 z-50 transition-colors">
      {/* 1. NAVBAR SUPERIOR: Centrada, altura mínima 80px */}
      <div className="w-full min-h-[80px] flex justify-center items-center border-b border-zinc-200/80 dark:border-white/5">
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
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] leading-tight mt-1">
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
                  className={`px-4 py-2.5 rounded-full text-base font-semibold tracking-tight transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Columna Derecha: Acciones alineadas a la derecha con gap de 12-16px */}
          <div className="flex items-center gap-3 lg:gap-4 justify-self-end">
            {/* Botón rápido para enfocar buscador */}
            <button
              type="button"
              onClick={() => {
                searchInputRef.current?.focus();
                if (searchTerm.trim().length >= 2) setShowDropdown(true);
              }}
              aria-label="Buscar"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <Search size={24} />
            </button>

            {/* Selector de Tema Claro/Oscuro */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-amber-500 hover:bg-black/5 dark:hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
            </button>

            {/* Botón Ingresar / Perfil */}
            {isAuthenticated && usuario ? (
              <Link
                to="/perfil"
                onClick={() => setIsMobileMenuOpen(false)}
                className="h-11 pl-2.5 pr-4 rounded-full flex items-center gap-2.5 bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-white/10 hover:border-emerald-400/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
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
                <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 hidden sm:inline max-w-[100px] truncate">
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
              className="lg:hidden w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </Container>
      </div>

      {/* Menú desplegable en Mobile y Tablet (< lg) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden w-full bg-[var(--bg-surface)] border-t border-b border-zinc-200 dark:border-white/10 shadow-2xl animate-fade-in">
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
                  className={`h-12 px-4 flex items-center rounded-xl text-base font-semibold tracking-tight transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                      : 'text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </NavLink>
              );
            })}
          </Container>
        </div>
      )}

      {/* 2. BUSCADOR GLOBAL CON BÚSQUEDA EN TIEMPO REAL LETRA A LETRA */}
      <div className="w-full bg-[var(--bg-surface)] border-t border-b border-zinc-200 dark:border-white/10 py-3 sm:py-3.5 flex justify-center transition-colors">
        <Container>
          <div ref={searchContainerRef} className="relative w-full">
            <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center">
              <Search
                size={22}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => {
                  if (searchTerm.trim().length >= 2 && quickResults.length > 0) {
                    setShowDropdown(true);
                  }
                }}
                placeholder="Buscar paletas, marcas o jugadores en tiempo real..."
                className="w-full h-14 pl-14 pr-12 rounded-2xl bg-[var(--bg-input)] border border-zinc-300 dark:border-white/10 text-[var(--text-primary)] placeholder-[var(--text-muted)] text-base font-medium tracking-tight outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
              />

              {/* Botón de limpiar búsqueda */}
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  aria-label="Limpiar búsqueda"
                >
                  <X size={18} />
                </button>
              )}
            </form>

            {/* Dropdown Flotante de Resultados Rápidos en Vivo */}
            {showDropdown && quickResults.length > 0 && (
              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 bg-[var(--bg-surface)] border border-zinc-200 dark:border-white/15 rounded-2xl shadow-2xl overflow-hidden animate-fade-in backdrop-blur-xl">
                <div className="px-4 py-2.5 bg-zinc-100/70 dark:bg-zinc-900/70 border-b border-zinc-200 dark:border-white/10 flex items-center justify-between text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  <span>Coincidencias instantáneas</span>
                  <span>{quickResults.length} sugeridas</span>
                </div>

                <div className="divide-y divide-zinc-200/60 dark:divide-white/5 max-h-80 overflow-y-auto">
                  {quickResults.map((racket) => (
                    <button
                      key={racket.slug}
                      type="button"
                      onClick={() => handleSelectQuickResult(racket.slug)}
                      className="w-full px-4 py-3 flex items-center justify-between gap-4 text-left hover:bg-emerald-500/10 dark:hover:bg-emerald-500/15 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 flex items-center justify-center p-1 flex-shrink-0">
                          {racket.imagenUrl ? (
                            <img
                              src={racket.imagenUrl}
                              alt={racket.modelo}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <Layers size={18} className="text-zinc-400" />
                          )}
                        </div>
                        <div className="truncate">
                          <span className="text-[11px] font-black uppercase text-emerald-600 dark:text-emerald-400 block tracking-wider">
                            {racket.marca}
                          </span>
                          <span className="text-sm font-bold text-[var(--text-primary)] truncate block group-hover:text-emerald-600 dark:group-hover:text-emerald-300">
                            {racket.modelo}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 text-zinc-400 group-hover:text-emerald-500 transition-colors">
                        <span className="text-xs font-semibold hidden sm:inline">Ver ficha</span>
                        <ChevronRight size={16} />
                      </div>
                    </button>
                  ))}
                </div>

                <div className="p-3 bg-zinc-100/50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-white/10 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5"
                  >
                    <span>Ver todos los resultados para "{searchTerm}" en el catálogo completo</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </Container>
      </div>
    </header>
  );
};
