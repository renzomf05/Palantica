import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Calendar,
  Flame,
  Award,
} from 'lucide-react';
import { padelService, type PadelTelemetry } from '../../services/padel/padelService';

export interface PalaVisual {
  nombre: string;
  marca: string;
  jugador?: string;
  imagenUrl: string;
  specs: string;
  linkTo: string;
}

export interface HeroSlide {
  id: string;
  badge: string;
  badgeType: 'tecnico' | 'ranking' | 'torneo' | 'dupla';
  titulo: string;
  descripcion: string;
  linkTo: string;
  linkText: string;
  secondaryLinkTo?: string;
  secondaryLinkText?: string;
  statPill?: {
    label: string;
    value: string;
  };
  palas: PalaVisual[];
  glowColor: string; // ej: 'emerald', 'amber', 'sky', 'indigo', 'rose'
}

export const HeroCarousel: React.FC = () => {
  const [telemetry, setTelemetry] = useState<PadelTelemetry | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cargar telemetría desde Padel API
  useEffect(() => {
    let mounted = true;
    async function loadTelemetry() {
      try {
        const data = await padelService.getTelemetry();
        if (mounted) setTelemetry(data);
      } catch (err) {
        console.warn('Error cargando telemetría para Hero Carousel:', err);
      }
    }
    loadTelemetry();
    return () => {
      mounted = false;
    };
  }, []);

  // Construir las diapositivas dinámicas con imágenes oficiales de palas recortadas
  const slides: HeroSlide[] = React.useMemo(() => {
    const top1 = telemetry?.rankings?.topPlayers?.[0];
    const top2 = telemetry?.rankings?.topPlayers?.[1];
    const nextTourn = telemetry?.nextTournament || telemetry?.upcomingTournaments?.[0];

    return [
      // 1. Slide Editorial: La Guía Definitiva de Palas 2026
      {
        id: 'guia-definitiva',
        badge: 'ANÁLISIS TÉCNICO & CIENCIA DEL PÁDEL',
        badgeType: 'tecnico',
        glowColor: 'emerald',
        titulo: 'La Guía Definitiva de Palas 2026: Dureza, Balances y Comportamiento Térmico',
        descripcion:
          'Analizamos la física y el tacto sensorial de cada goma EVA y carbono en pista para encontrar la pala exacta según tu estilo y clima.',
        linkTo: '/paletas',
        linkText: 'Explorar Catálogo',
        secondaryLinkTo: '/paletas/bullpadel-vertex-05-2027-juan-tello',
        secondaryLinkText: 'Ficha Vertex 05',
        statPill: {
          label: 'Enciclopedia',
          value: '1.729 palas oficiales',
        },
        palas: [
          {
            nombre: 'Bullpadel Vertex 05',
            marca: 'Bullpadel',
            jugador: 'Juan Tello',
            imagenUrl:
              'https://www.padelful.com/images/rackets/variants/bullpadel-vertex-05-2027-juan-tello-512.webp',
            specs: 'Diamante • Carbono 12K • Balance Alto',
            linkTo: '/paletas/bullpadel-vertex-05-2027-juan-tello',
          },
        ],
      },
      // 2. Slide Padel API: Ranking #1 Mundial (Agustín Tapia & Arturo Coello)
      {
        id: 'fip-ranking-top1',
        badge: 'TOP 1 FIP RANKING MUNDIAL • PADEL API',
        badgeType: 'ranking',
        glowColor: 'amber',
        titulo: `${top1?.name || 'Agustín Tapia'} & ${top2?.name || 'Arturo Coello'}: Las Palas de los Nº 1`,
        descripcion: `Dominan la cima del pádel mundial con ${
          top1?.points ? top1.points.toLocaleString() : '20.383'
        } puntos FIP y un 92% de victorias. Conoce a fondo la Nox AT10 18K Alum de Tapia y la Head Extreme Pro de Coello.`,
        linkTo: '/paletas/nox-at10-luxury-genius-18k-alum-2027-agustin-tapia',
        linkText: 'Ver Palas de los Nº 1',
        secondaryLinkTo: '/paletas/nox-at10-luxury-genius-18k-alum-2027-agustin-tapia',
        secondaryLinkText: 'Ficha Nox AT10 18K',
        statPill: {
          label: 'Ranking FIP Oficial',
          value: `${top1?.points ? top1.points.toLocaleString() : '20.383'} pts • 92% vict.`,
        },
        palas: [
          {
            nombre: 'Nox AT10 18K Alum',
            marca: 'Nox',
            jugador: 'Agustín Tapia #1',
            imagenUrl:
              'https://www.padelful.com/images/rackets/variants/nox-at10-luxury-genius-18k-alum-2027-agustin-tapia-512.webp',
            specs: 'Lágrima • Carbono 18K Alum • MLD Black EVA',
            linkTo: '/paletas/nox-at10-luxury-genius-18k-alum-2027-agustin-tapia',
          },
          {
            nombre: 'Head Extreme Pro',
            marca: 'Head',
            jugador: 'Arturo Coello #1',
            imagenUrl:
              'https://www.padelful.com/images/rackets/variants/head-extreme-pro-2024-512.webp',
            specs: 'Diamante • Carbono Híbrido • Potencia Pura',
            linkTo: '/paletas/head-extreme-pro-2024',
          },
        ],
      },
      // 3. Slide Padel API: Pareja "Chingalán" (Ale Galán & Fede Chingotto)
      {
        id: 'chingalan-pro-dupla',
        badge: 'TOP 3 FIP RANKING • CHINGALÁN',
        badgeType: 'dupla',
        glowColor: 'indigo',
        titulo: 'Chingalán al Acecho: Potencia Metalbone vs Control Neuron',
        descripcion:
          'Alejandro Galán y Federico Chingotto suman 18.006 puntos. Descubre la sinergia entre el cañón de la Adidas Metalbone HRD y la precisión quirúrgica de la Bullpadel Neuron.',
        linkTo: '/paletas/adidas-metalbone-3-4-hrd-plus-2025',
        linkText: 'Ficha Metalbone HRD+',
        secondaryLinkTo: '/paletas/bullpadel-neuron-02-2027-fede-chingotto',
        secondaryLinkText: 'Ficha Neuron 02',
        statPill: {
          label: 'Efectividad Dupla',
          value: '18.006 pts FIP • 88% vict.',
        },
        palas: [
          {
            nombre: 'Adidas Metalbone HRD+',
            marca: 'Adidas',
            jugador: 'Ale Galán #3',
            imagenUrl:
              'https://www.padelful.com/images/rackets/variants/adidas-metalbone-3-4-hrd-plus-2025-512.webp',
            specs: 'Diamante Oversize • Carbon Aluminizado • High Memory',
            linkTo: '/paletas/adidas-metalbone-3-4-hrd-plus-2025',
          },
          {
            nombre: 'Bullpadel Neuron 02',
            marca: 'Bullpadel',
            jugador: 'Fede Chingotto #3',
            imagenUrl:
              'https://www.padelful.com/images/rackets/variants/bullpadel-neuron-02-2027-fede-chingotto-512.webp',
            specs: 'Híbrida • Xtend Carbon 3K • MultiEVA',
            linkTo: '/paletas/bullpadel-neuron-02-2027-fede-chingotto',
          },
        ],
      },
      // 4. Slide Padel API: Próximo Torneo Oficial Premier Padel
      {
        id: 'proximo-torneo-fip',
        badge: 'PREMIER PADEL TOUR • PRÓXIMA PARADA',
        badgeType: 'torneo',
        glowColor: 'sky',
        titulo: `${nextTourn?.name || 'Kuwait City Premier Padel P1'}: Batalla en el Desierto`,
        descripcion: `${nextTourn?.prize || '470.000 €'} en premios y 1.000 puntos en disputa. Superficie ${
          nextTourn?.surface || 'Indoor Cristal Rápido'
        }: analiza qué balance y dureza de pala rinden mejor con la velocidad de la pista.`,
        linkTo: '/paletas/bullpadel-vertex-05-2027-juan-tello',
        linkText: 'Ficha Vertex 05',
        secondaryLinkTo: '/feed',
        secondaryLinkText: 'Ver Noticias Circuito',
        statPill: {
          label: 'Categoría Oficial',
          value: `${nextTourn?.level || 'P1'} • 470.000 €`,
        },
        palas: [
          {
            nombre: 'Bullpadel Vertex 05',
            marca: 'Bullpadel',
            jugador: 'Competición P1',
            imagenUrl:
              'https://www.padelful.com/images/rackets/variants/bullpadel-vertex-05-2027-juan-tello-512.webp',
            specs: 'Indoor Rápido • Tacto Reactivo 8.8/10',
            linkTo: '/paletas/bullpadel-vertex-05-2027-juan-tello',
          },
        ],
      },
      // 5. Slide Padel API: Nº 1 Femenino (Ari Sánchez & Paula Josemaría)
      {
        id: 'ranking-femenino-top1',
        badge: 'Nº 1 RANKING FEMENINO FIP • PREMIER PADEL',
        badgeType: 'ranking',
        glowColor: 'rose',
        titulo: 'Ariana Sánchez & Paula Josemaría: La Dinastía de Head Speed',
        descripcion:
          'Con 21.100 puntos y un demoledor 94% de victorias. La aceleración, confort y punto dulce ampliado de la saga Head Speed dominan el circuito femenino mundial.',
        linkTo: '/paletas/head-speed-pro-x-2023',
        linkText: 'Ficha Head Speed Pro X',
        secondaryLinkTo: '/paletas/head-speed-pro-x-2023',
        secondaryLinkText: 'Ver Especificaciones',
        statPill: {
          label: 'Líderes Femeninas',
          value: '21.100 pts FIP • 94% vict.',
        },
        palas: [
          {
            nombre: 'Head Speed Pro X',
            marca: 'Head',
            jugador: 'Ari Sánchez & Paula #1',
            imagenUrl:
              'https://www.padelful.com/images/rackets/variants/head-speed-pro-x-2023-512.webp',
            specs: 'Lágrima • Power Foam • Auxetic Control',
            linkTo: '/paletas/head-speed-pro-x-2023',
          },
        ],
      },
    ];
  }, [telemetry]);

  // Rotación automática cada 6.5 segundos
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(nextSlide, 6500);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, nextSlide]);

  const currentSlide = slides[currentIndex];

  const getBadgeIcon = (tipo: HeroSlide['badgeType']) => {
    switch (tipo) {
      case 'ranking':
        return <Trophy size={13} className="text-amber-400" />;
      case 'torneo':
        return <Calendar size={13} className="text-sky-400" />;
      case 'dupla':
        return <Award size={13} className="text-indigo-400" />;
      default:
        return <Flame size={13} className="text-emerald-400" />;
    }
  };

  const getBadgeColorClasses = (tipo: HeroSlide['badgeType']) => {
    switch (tipo) {
      case 'ranking':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'torneo':
        return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
      case 'dupla':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      default:
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    }
  };

  const getGlowBgClasses = (glow: string) => {
    switch (glow) {
      case 'amber':
        return 'from-amber-950/40 via-zinc-950/80 to-zinc-950';
      case 'sky':
        return 'from-sky-950/40 via-zinc-950/80 to-zinc-950';
      case 'indigo':
        return 'from-indigo-950/40 via-zinc-950/80 to-zinc-950';
      case 'rose':
        return 'from-rose-950/30 via-zinc-950/80 to-zinc-950';
      default:
        return 'from-emerald-950/40 via-zinc-950/80 to-zinc-950';
    }
  };

  return (
    <section
      aria-label="Destacados y Circuito de Pádel"
      className="relative w-full rounded-3xl overflow-hidden min-h-[420px] sm:min-h-[440px] flex items-stretch border border-zinc-200 dark:border-white/10 shadow-xl shadow-zinc-900/10 dark:shadow-2xl bg-zinc-950 group select-none transition-colors"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Fondo cinematográfico sutil con gradiente temático según el slide */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${getGlowBgClasses(
          currentSlide.glowColor
        )} transition-colors duration-1000`}
      />

      {/* Textura de pista de pádel / malla sutil de fondo */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Resplandor ambiental de color detrás de las palas */}
      <div
        className={`absolute -right-16 -top-16 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-1000 ${
          currentSlide.glowColor === 'amber'
            ? 'bg-amber-500'
            : currentSlide.glowColor === 'sky'
            ? 'bg-sky-500'
            : currentSlide.glowColor === 'indigo'
            ? 'bg-indigo-500'
            : currentSlide.glowColor === 'rose'
            ? 'bg-rose-500'
            : 'bg-emerald-500'
        }`}
      />

      {/* Controles de navegación laterales (< y >) */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Diapositiva anterior"
        className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/50 hover:bg-black/80 border border-white/20 text-white/80 hover:text-white backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 hover:scale-110 active:scale-95 shadow-xl"
      >
        <ChevronLeft size={20} />
      </button>

      <button
        type="button"
        onClick={nextSlide}
        aria-label="Diapositiva siguiente"
        className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/50 hover:bg-black/80 border border-white/20 text-white/80 hover:text-white backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 hover:scale-110 active:scale-95 shadow-xl"
      >
        <ChevronRight size={20} />
      </button>

      {/* Contenido principal: Grid de 2 columnas (Texto editorial a la izquierda + Palas flotantes oficiales a la derecha) */}
      <div className="relative z-20 w-full p-6 sm:p-8 flex flex-col justify-between gap-6">
        {/* FILA SUPERIOR: Badge de categoría + Pill de métricas de Padel API */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-black tracking-wider uppercase border backdrop-blur-md transition-colors ${getBadgeColorClasses(
                currentSlide.badgeType
              )}`}
            >
              {getBadgeIcon(currentSlide.badgeType)}
              <span>{currentSlide.badge}</span>
            </span>
          </div>

          {currentSlide.statPill && (
            <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-zinc-200 shadow-sm">
              <span className="text-zinc-400 text-[11px] uppercase tracking-wider font-semibold">
                {currentSlide.statPill.label}:
              </span>
              <span className="font-black text-white">{currentSlide.statPill.value}</span>
            </div>
          )}
        </div>

        {/* CUERPO CENTRAL: Texto a la izquierda y Palas oficiales recortadas en 3D a la derecha */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center flex-1 my-auto">
          {/* Columna Izquierda (Texto Editorial y Titulares) */}
          <div className="md:col-span-7 lg:col-span-8 flex flex-col gap-3">
            <h2 className="font-black tracking-tight text-white leading-tight drop-shadow-md text-2xl sm:text-3xl lg:text-[2.25rem]">
              {currentSlide.titulo}
            </h2>

            <p className="text-sm sm:text-base text-zinc-300 line-clamp-3 max-w-xl font-medium leading-relaxed">
              {currentSlide.descripcion}
            </p>
          </div>

          {/* Columna Derecha: PALAS OFICIALES REALES RECORTADAS EN HD CON NAVEGACIÓN DIRECTA */}
          <div className="md:col-span-5 lg:col-span-4 flex items-center justify-center relative min-h-[190px] sm:min-h-[220px]">
            {currentSlide.palas.length === 1 ? (
              // 1 Pala grande destacada
              <Link
                to={currentSlide.palas[0].linkTo}
                className="group/pala relative flex flex-col items-center transition-transform duration-500 hover:scale-105 cursor-pointer"
                title={`Ver ficha técnica de ${currentSlide.palas[0].nombre}`}
              >
                <div className="relative">
                  {/* Resplandor aura */}
                  <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full scale-75 pointer-events-none" />
                  <img
                    src={currentSlide.palas[0].imagenUrl}
                    alt={currentSlide.palas[0].nombre}
                    className="relative z-10 h-44 sm:h-52 object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.85)] -rotate-6 transition-transform duration-500 group-hover/pala:-rotate-3 group-hover/pala:scale-105"
                  />
                </div>
                {/* Etiqueta interactiva de la pala */}
                <div className="mt-2 text-center bg-black/75 hover:bg-black/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 shadow-lg group-hover/pala:border-emerald-400/60 transition-colors flex items-center gap-2">
                  <span className="text-xs font-bold text-white tracking-tight">
                    {currentSlide.palas[0].nombre}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                    Ficha Técnica →
                  </span>
                </div>
              </Link>
            ) : (
              // 2 Palas en formación "V" (ej: Tapia & Coello, o Galán & Chingotto)
              <div className="relative flex items-center justify-center w-full h-full">
                {/* Pala 1 (Izquierda) */}
                <Link
                  to={currentSlide.palas[0].linkTo}
                  className="group/pala1 relative -mr-6 z-10 flex flex-col items-center transition-transform duration-500 hover:scale-110 hover:z-30 cursor-pointer"
                  title={`Ver ficha técnica de ${currentSlide.palas[0].nombre}`}
                >
                  <img
                    src={currentSlide.palas[0].imagenUrl}
                    alt={currentSlide.palas[0].nombre}
                    className="h-40 sm:h-48 object-contain drop-shadow-[0_15px_20px_rgba(0,0,0,0.9)] -rotate-12 transition-transform duration-500 group-hover/pala1:-rotate-6"
                  />
                  <span className="mt-1 text-[10px] font-bold text-zinc-200 bg-black/80 group-hover/pala1:bg-emerald-500 group-hover/pala1:text-zinc-950 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/15 whitespace-nowrap shadow transition-colors flex items-center gap-1.5">
                    <span>{currentSlide.palas[0].nombre}</span>
                    <span className="text-[9px] font-extrabold uppercase">Ficha →</span>
                  </span>
                </Link>

                {/* Pala 2 (Derecha) */}
                <Link
                  to={currentSlide.palas[1].linkTo}
                  className="group/pala2 relative -ml-6 z-20 flex flex-col items-center transition-transform duration-500 hover:scale-110 hover:z-30 cursor-pointer"
                  title={`Ver ficha técnica de ${currentSlide.palas[1].nombre}`}
                >
                  <img
                    src={currentSlide.palas[1].imagenUrl}
                    alt={currentSlide.palas[1].nombre}
                    className="h-40 sm:h-48 object-contain drop-shadow-[0_15px_20px_rgba(0,0,0,0.9)] rotate-12 transition-transform duration-500 group-hover/pala2:rotate-6"
                  />
                  <span className="mt-1 text-[10px] font-bold text-zinc-200 bg-black/80 group-hover/pala2:bg-emerald-500 group-hover/pala2:text-zinc-950 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/15 whitespace-nowrap shadow transition-colors flex items-center gap-1.5">
                    <span>{currentSlide.palas[1].nombre}</span>
                    <span className="text-[9px] font-extrabold uppercase">Ficha →</span>
                  </span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* FILA INFERIOR: Botones de Acción y Navegación con Dots */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1 border-t border-white/10">
          <div className="flex items-center gap-3">
            <Link
              to={currentSlide.linkTo}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 text-zinc-950 font-black text-xs sm:text-sm hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/25 active:scale-95 whitespace-nowrap"
            >
              <span>{currentSlide.linkText}</span>
              <ArrowUpRight size={16} />
            </Link>

            {currentSlide.secondaryLinkTo && currentSlide.secondaryLinkText && (
              <Link
                to={currentSlide.secondaryLinkTo}
                className="hidden xs:inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs sm:text-sm transition-all active:scale-95 whitespace-nowrap backdrop-blur-md"
              >
                <span>{currentSlide.secondaryLinkText}</span>
              </Link>
            )}
          </div>

          {/* Indicadores de diapositiva (Pill Dots + Contador) */}
          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
            <div className="flex items-center gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentIndex(i)}
                  aria-label={`Ir a diapositiva ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentIndex
                      ? 'w-6 bg-emerald-400'
                      : 'w-2 bg-white/30 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>

            <span className="text-[11px] font-mono font-bold text-zinc-400 pl-1 border-l border-white/15">
              {String(currentIndex + 1).padStart(2, '0')}/{String(slides.length).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
