import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Trophy,
  Award,
  Sparkles,
  Calendar,
  MapPin,
  ArrowUpRight,
  Flame,
} from 'lucide-react';
import { padelService, type PadelTelemetry } from '../../services/padel/padelService';

interface CircuitCardItem {
  id: string;
  tipo: 'lanzamiento' | 'ranking' | 'torneo';
  badge: string;
  badgeColor: 'emerald' | 'amber' | 'cyan' | 'purple';
  titulo: string;
  subtitulo: string;
  descripcion: string;
  imagenUrl: string;
  linkTo: string;
  linkText: string;
  extraMeta?: {
    ranking?: number;
    puntos?: number;
    pais?: string;
    palaAsociada?: string;
    fecha?: string;
    lugar?: string;
    premio?: string;
    precio?: number;
  };
}

export const NuevosLanzamientosCircuit: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filtroActivo, setFiltroActivo] = useState<'TODOS' | 'LANZAMIENTOS' | 'RANKINGS' | 'TORNEOS'>('TODOS');
  const [telemetry, setTelemetry] = useState<PadelTelemetry | null>(null);

  // Cargar telemetría desde la API de pádel
  useEffect(() => {
    let mounted = true;
    async function fetchTelemetry() {
      try {
        const data = await padelService.getTelemetry();
        if (mounted) {
          setTelemetry(data);
        }
      } catch (err) {
        console.error('Error cargando telemetría de pádel:', err);
      }
    }
    fetchTelemetry();
    return () => {
      mounted = false;
    };
  }, []);

  // Construir elementos combinados enriquecidos
  const allItems: CircuitCardItem[] = React.useMemo(() => {
    const items: CircuitCardItem[] = [
      // 1. Lanzamiento Estrella 2026
      {
        id: 'lanz-1',
        tipo: 'lanzamiento',
        badge: 'NUEVO LANZAMIENTO OFICIAL',
        badgeColor: 'emerald',
        titulo: 'Nox AT10 Luxury Genius 18K Alum 2026: La joya de Agustín Tapia',
        subtitulo: 'Nox Padel • Colección Pro Luxury 2026',
        descripcion: 'Evolución con Carbono 18K aluminizado y núcleo MLD Black EVA multicapa. Diseñada para un tacto seco reactivo y salida de bola implacable en pistas rápidas.',
        imagenUrl: 'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?w=1200&auto=format&fit=crop&q=80',
        linkTo: '/paletas?marca=Nox',
        linkText: 'Ver Colección Nox',
        extraMeta: {
          precio: 320,
          palaAsociada: 'Nox AT10 Genius 18K Alum',
          pais: 'AR'
        }
      },
      // 2. Ranking FIP #1 Mundial Tapia & Coello
      {
        id: 'rank-1',
        tipo: 'ranking',
        badge: 'TOP 1 FIP RANKING MUNDIAL',
        badgeColor: 'amber',
        titulo: 'Agustín Tapia & Arturo Coello: Reyes indiscutidos con 20.383 pts',
        subtitulo: 'Premier Padel Circuit • Temporada 2026',
        descripcion: 'La pareja dominante del circuito mundial con un 92% de victorias en pista rápida. Tapia arma el juego con Nox AT10 mientras Coello pulveriza remates con Head Extreme Pro.',
        imagenUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1200&auto=format&fit=crop&q=80',
        linkTo: '/paletas?search=Extreme',
        linkText: 'Explorar Palas del #1',
        extraMeta: {
          ranking: 1,
          puntos: 20383,
          palaAsociada: 'Head Extreme Pro & Nox AT10'
        }
      },
      // 3. Próximo Torneo P1 Kuwait
      {
        id: 'torn-1',
        tipo: 'torneo',
        badge: 'PRÓXIMO TORNEO • PREMIER PADEL',
        badgeColor: 'cyan',
        titulo: 'Kuwait City Premier Padel P1: Gira del Golfo en Pista Rápida',
        subtitulo: '26 Octubre - 01 Noviembre • Kuwait City',
        descripcion: '470.000 € en premios y 1.000 puntos en disputa en superficie indoor de cristal panorámico. Los mejores jugadores del planeta afinan sus palas para el tramo decisivo.',
        imagenUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1200&auto=format&fit=crop&q=80',
        linkTo: '/paletas',
        linkText: 'Ver Palas en Competición',
        extraMeta: {
          lugar: 'Kuwait City, Kuwait',
          fecha: '26 Oct - 01 Nov 2026',
          premio: '470.000 €'
        }
      },
      // 4. Lanzamiento Bullpadel Vertex 04 2026
      {
        id: 'lanz-2',
        tipo: 'lanzamiento',
        badge: 'NUEVA GEOMETRÍA DE MARCO',
        badgeColor: 'emerald',
        titulo: 'Bullpadel Vertex 04 2026: Balance aerodinámico CurvAktiv y Air Power',
        subtitulo: 'Bullpadel • Pro Line 2026',
        descripcion: 'La pala de potencia por excelencia se reinventa con canalización de aire lateral que reduce la resistencia al viento en un 23% para acelerar el smash.',
        imagenUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=1200&auto=format&fit=crop&q=80',
        linkTo: '/paletas?marca=Bullpadel',
        linkText: 'Ficha Bullpadel Vertex',
        extraMeta: {
          precio: 310,
          palaAsociada: 'Vertex 04 2026'
        }
      },
      // 5. Ranking FIP #3 Galán & Chingotto
      {
        id: 'rank-2',
        tipo: 'ranking',
        badge: 'TOP 3 FIP RANKING • CHINGALÁN',
        badgeColor: 'purple',
        titulo: 'Ale Galán & Federico Chingotto: Solidez y potencia extrema (18.006 pts)',
        subtitulo: 'La dupla sensación del Premier Padel',
        descripcion: 'Galán comanda la red con su Adidas Metalbone 3.3 HRD de balance personalizable, mientras Chingotto defiende cada centímetro con precisión quirúrgica.',
        imagenUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=1200&auto=format&fit=crop&q=80',
        linkTo: '/paletas?marca=Adidas',
        linkText: 'Ver Palas de Galán y Chingotto',
        extraMeta: {
          ranking: 3,
          puntos: 18006,
          palaAsociada: 'Adidas Metalbone & Bullpadel Neuron'
        }
      },
      // 6. Major México Acapulco
      {
        id: 'torn-2',
        tipo: 'torneo',
        badge: 'MAJOR PREMIER PADEL • 2.000 PTS',
        badgeColor: 'cyan',
        titulo: 'GNP Mexico Premier Padel Major: La gran cita en la cuna del pádel',
        subtitulo: '23 - 29 Noviembre • Acapulco, México',
        descripcion: 'El cuarto y último Major de la temporada con 600.000 € en premios. Condiciones de calor y humedad costera que exigen palas con núcleos de goma dura de alta reactividad.',
        imagenUrl: 'https://images.unsplash.com/photo-1563299796-17596ed6b017?w=1200&auto=format&fit=crop&q=80',
        linkTo: '/paletas?forma=Diamante',
        linkText: 'Palas para Clima Cálido',
        extraMeta: {
          lugar: 'Acapulco, México',
          fecha: '23 - 29 Nov 2026',
          premio: '600.000 €'
        }
      },
      // 7. Ranking Femenino #1 Paula & Ari
      {
        id: 'rank-3',
        tipo: 'ranking',
        badge: 'Nº 1 RANKING FEMENINO FIP',
        badgeColor: 'amber',
        titulo: 'Paula Josemaría & Ari Sánchez: Líderes absolutas con 21.100 puntos',
        subtitulo: '94% de victorias • Head Padel Team',
        descripcion: 'La zurda letal de Paula y el control absoluto de revés de Ari marcan el estándar del pádel moderno con las nuevas Head Speed Motion y Speed Pro.',
        imagenUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1200&auto=format&fit=crop&q=80',
        linkTo: '/paletas?marca=Head',
        linkText: 'Palas Head Speed',
        extraMeta: {
          ranking: 1,
          puntos: 21100,
          palaAsociada: 'Head Speed Motion & Speed Pro'
        }
      },
      // 8. Torneo Final Barcelona Finals
      {
        id: 'torn-3',
        tipo: 'torneo',
        badge: 'FINALS • TORNEO DE MAESTROS',
        badgeColor: 'purple',
        titulo: 'Barcelona Premier Padel Finals: El trono mundial en el Palau Sant Jordi',
        subtitulo: '16 - 20 Diciembre • Barcelona, España',
        descripcion: 'Solo las 8 mejores parejas masculinas y femeninas del ranking FIP clasificarán al torneo de maestros más prestigioso y mejor dotado del planeta (750.000 €).',
        imagenUrl: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1200&auto=format&fit=crop&q=80',
        linkTo: '/paletas',
        linkText: 'Ver Palas Top 8 Mundial',
        extraMeta: {
          lugar: 'Palau Sant Jordi, Barcelona',
          fecha: '16 - 20 Dic 2026',
          premio: '750.000 €'
        }
      }
    ];

    // Enriquecer si vino telemetría viva de la API
    if (telemetry?.rankings?.topPlayers && telemetry.rankings.topPlayers.length > 0) {
      // Sincronizar datos vivos
      const top1 = telemetry.rankings.topPlayers[0];
      if (top1 && items[1]) {
        items[1].descripcion = `${top1.name} lidera el ranking mundial con ${top1.points.toLocaleString()} puntos FIP. Conoce la pala que utiliza en cada partido.`;
      }
    }

    return items;
  }, [telemetry]);

  // Filtrar según botón seleccionado
  const filteredItems = React.useMemo(() => {
    if (filtroActivo === 'LANZAMIENTOS') return allItems.filter(i => i.tipo === 'lanzamiento');
    if (filtroActivo === 'RANKINGS') return allItems.filter(i => i.tipo === 'ranking');
    if (filtroActivo === 'TORNEOS') return allItems.filter(i => i.tipo === 'torneo');
    return allItems;
  }, [allItems, filtroActivo]);

  // Chequeo de scroll para botones prev/next
  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 20);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 20);

    const cardWidth = 520;
    const idx = Math.round(scrollLeft / cardWidth);
    setCurrentIndex(Math.min(Math.max(0, idx), filteredItems.length - 1));
  }, [filteredItems.length]);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      return () => el.removeEventListener('scroll', checkScroll);
    }
  }, [checkScroll]);

  // Desplazar izquierda / derecha
  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const scrollDelta = container.clientWidth * 0.75;
    container.scrollBy({
      left: direction === 'left' ? -scrollDelta : scrollDelta,
      behavior: 'smooth'
    });
  };

  const getBadgeStyle = (color: CircuitCardItem['badgeColor']) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/20';
      case 'amber':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-500/20';
      case 'cyan':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-cyan-500/20';
      case 'purple':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-purple-500/20';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <section className="w-full flex flex-col gap-5 my-6">
      {/* Cabecera ampliada con Controles y Filtros Rápidos */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-white/10 pb-4 transition-colors">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Flame size={18} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)] m-0">
              Nuevos Lanzamientos & Circuito
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium">
            Palas oficiales 2026 conectadas con el ranking FIP y el calendario Premier Padel.
          </p>
        </div>

        {/* Controles de navegación y Filtros */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Filtros pills */}
          <div className="flex items-center gap-1 bg-[var(--bg-card-subtle)] p-1 rounded-full border border-zinc-200 dark:border-white/10 transition-colors">
            {(['TODOS', 'LANZAMIENTOS', 'RANKINGS', 'TORNEOS'] as const).map((f) => {
              const active = filtroActivo === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFiltroActivo(f)}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-full transition-all ${
                    active
                      ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/30'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>

          {/* Flechas de desplazamiento izquierda / derecha */}
          <div className="flex items-center gap-1.5 bg-[var(--bg-card-subtle)] p-1 rounded-full border border-zinc-200 dark:border-white/10 transition-colors">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              aria-label="Desplazar hacia la izquierda"
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                canScrollLeft
                  ? 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-white hover:bg-emerald-500 hover:text-zinc-950 active:scale-95 shadow-sm'
                  : 'text-zinc-400 dark:text-zinc-600 cursor-not-allowed opacity-40'
              }`}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              aria-label="Desplazar hacia la derecha"
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                canScrollRight
                  ? 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-white hover:bg-emerald-500 hover:text-zinc-950 active:scale-95 shadow-sm'
                  : 'text-zinc-400 dark:text-zinc-600 cursor-not-allowed opacity-40'
              }`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Contenedor Desplazable Panorámico (Ocupa más espacio con tarjetas grandes) */}
      <div
        ref={scrollRef}
        className="flex items-stretch gap-6 overflow-x-auto scrollbar-none scroll-smooth snap-x snap-mandatory py-2 px-1 focus:outline-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {filteredItems.map((item) => (
          <article
            key={item.id}
            className="group relative flex-shrink-0 w-[320px] sm:w-[480px] md:w-[540px] lg:w-[580px] h-[370px] sm:h-[410px] rounded-3xl overflow-hidden border border-zinc-200/90 dark:border-white/10 bg-zinc-900 shadow-md shadow-zinc-900/10 dark:shadow-xl transition-all duration-300 hover:border-emerald-500/60 hover:shadow-2xl hover:shadow-emerald-500/10 snap-start flex flex-col justify-end"
          >
            {/* Imagen cinematográfica de fondo de alta definición */}
            <img
              src={item.imagenUrl}
              alt={item.titulo}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />

            {/* Gradiente cinematográfico oscuro tipo viñeta para máxima legibilidad */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/30 group-hover:via-black/75 transition-all duration-300 pointer-events-none" />

            {/* Header del card: Badge superior e icono de flecha */}
            <div className="absolute top-4 inset-x-5 z-20 flex items-center justify-between">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border backdrop-blur-md shadow-md ${getBadgeStyle(
                  item.badgeColor
                )}`}
              >
                {item.tipo === 'ranking' && <Trophy size={13} className="text-amber-400" />}
                {item.tipo === 'torneo' && <Calendar size={13} className="text-cyan-400" />}
                {item.tipo === 'lanzamiento' && <Sparkles size={13} className="text-emerald-400" />}
                <span>{item.badge}</span>
              </span>

              <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white/80 border border-white/15 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:scale-110">
                <ArrowUpRight size={16} />
              </div>
            </div>

            {/* Contenido Editorial Inferior con tipografía rica */}
            <div className="relative z-20 p-5 sm:p-7 flex flex-col gap-2.5 text-white">
              <span className="text-xs sm:text-sm font-bold tracking-wide uppercase text-emerald-400">
                {item.subtitulo}
              </span>

              <h3 className="text-lg sm:text-2xl font-black leading-tight tracking-tight text-white drop-shadow-md group-hover:text-emerald-300 transition-colors line-clamp-2">
                {item.titulo}
              </h3>

              <p className="text-xs sm:text-sm text-zinc-300 font-normal leading-relaxed line-clamp-2 sm:line-clamp-3">
                {item.descripcion}
              </p>

              {/* Barra de metadatos técnicos / FIP / Torneo */}
              <div className="pt-3 border-t border-white/15 flex flex-wrap items-center justify-between gap-2 text-xs">
                {/* Meta izquierda según tipo */}
                <div className="flex items-center gap-4 text-zinc-300 font-medium">
                  {item.extraMeta?.ranking && (
                    <span className="inline-flex items-center gap-1 text-amber-300 font-bold">
                      <Award size={14} />
                      FIP #{item.extraMeta.ranking}
                    </span>
                  )}
                  {item.extraMeta?.puntos && (
                    <span className="text-zinc-200">
                      {item.extraMeta.puntos.toLocaleString()} pts
                    </span>
                  )}
                  {item.extraMeta?.precio && (
                    <span className="text-emerald-400 font-bold text-sm">
                      {item.extraMeta.precio} €
                    </span>
                  )}
                  {item.extraMeta?.lugar && (
                    <span className="inline-flex items-center gap-1 text-zinc-300">
                      <MapPin size={13} className="text-cyan-400" />
                      {item.extraMeta.lugar}
                    </span>
                  )}
                  {item.extraMeta?.palaAsociada && (
                    <span className="hidden sm:inline-flex items-center text-[11px] text-zinc-300 bg-white/10 px-2 py-0.5 rounded-md">
                      <Award size={12} className="inline mr-1 text-emerald-400" />
                      <span>{item.extraMeta.palaAsociada}</span>
                    </span>
                  )}
                </div>

                {/* Botón de acción */}
                <Link
                  to={item.linkTo}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-emerald-500 hover:text-zinc-950 text-white font-bold text-xs transition-all active:scale-95"
                >
                  <span>{item.linkText}</span>
                  <ArrowUpRight size={13} />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Indicador de posición inferior / contador interactivo */}
      <div className="flex items-center justify-between px-2 pt-1">
        <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
          Deslizá con rueda, táctil o flechas para ver los {filteredItems.length} destacados
        </span>

        <div className="flex items-center gap-1.5">
          {filteredItems.slice(0, Math.min(filteredItems.length, 6)).map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-6 bg-emerald-400' : 'w-1.5 bg-zinc-700'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
