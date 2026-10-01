import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { NewsCard } from './NewsCard';
import type { CarouselCardItem } from '../../types';

interface CarouselProps {
  titulo: string;
  items: CarouselCardItem[];
  verTodoLink?: string;
  filtros?: string[];
  filtroActivo?: string;
  onFiltroChange?: (filtro: string) => void;
  loading?: boolean;
}

export const Carousel: React.FC<CarouselProps> = ({
  titulo,
  items,
  verTodoLink = '/paletas',
  filtros,
  filtroActivo,
  onFiltroChange,
  loading = false,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const checkScroll = React.useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);

    // Calcular índice de página aproximado
    const itemWidth = 280;
    const index = Math.round(scrollLeft / itemWidth);
    setActiveIndex(Math.min(Math.max(0, index), Math.max(0, items.length - 1)));
  }, [items.length]);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      return () => el.removeEventListener('scroll', checkScroll);
    }
  }, [checkScroll]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="w-full flex flex-col gap-4 my-2">
      {/* Cabecera del carrusel: Título, Filtros opcionales y 'Ver todo' */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-4">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white m-0">
            {titulo}
          </h2>

          {/* Filtros tipo pills si se proporcionan (ej: HOY, SEMANA, MES) */}
          {filtros && filtros.length > 0 && (
            <div className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-full border border-white/10">
              {filtros.map((f) => {
                const isActive = filtroActivo === f;
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => onFiltroChange?.(f)}
                    className={`px-3 py-1 text-xs font-bold uppercase rounded-full transition-all ${isActive
                      ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Acciones derechas: Controles de navegación y Ver Todo */}
        <div className="flex items-center gap-3">
          {verTodoLink && (
            <Link
              to={verTodoLink}
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors group"
            >
              <span>Ver todo</span>
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          )}

          {/* Flechas de carrusel ampliadas (44-48px de área táctil con ícono 22px) */}
          <div className="hidden sm:flex items-center gap-2 ml-2">
            <button
              type="button"
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              aria-label="Anterior"
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border shadow-md transition-all ${canScrollLeft
                ? 'border-white/20 bg-zinc-800/90 text-white hover:bg-zinc-700 hover:border-emerald-400 hover:text-emerald-400 active:scale-95'
                : 'border-white/5 bg-zinc-900/50 text-zinc-600 cursor-not-allowed'
                }`}
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              aria-label="Siguiente"
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border shadow-md transition-all ${canScrollRight
                ? 'border-white/20 bg-zinc-800/90 text-white hover:bg-zinc-700 hover:border-emerald-400 hover:text-emerald-400 active:scale-95'
                : 'border-white/5 bg-zinc-900/50 text-zinc-600 cursor-not-allowed'
                }`}
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* Contenedor scrolleable con cards horizontales (Swipe en mobile) */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-2 -mx-4 px-4 sm:mx-0 sm:px-0"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {loading ? (
          // Skeletons con el mismo tamaño uniforme de NewsCard
          Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 w-[260px] sm:w-[280px] h-[375px] sm:h-[390px] rounded-3xl skeleton border border-white/5"
            />
          ))
        ) : items.length === 0 ? (
          <div className="w-full py-12 text-center text-sm text-zinc-400 border border-dashed border-white/10 rounded-2xl">
            No hay publicaciones disponibles en esta sección por el momento.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="snap-start flex-shrink-0">
              <NewsCard item={item} />
            </div>
          ))
        )}
      </div>

      {/* Indicadores de página tipo puntos (dots) */}
      {items.length > 1 && !loading && (
        <div className="flex items-center justify-center gap-1.5 pt-1">
          {items.slice(0, Math.min(items.length, 8)).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (scrollRef.current) {
                  const targetX = idx * 280;
                  scrollRef.current.scrollTo({ left: targetX, behavior: 'smooth' });
                }
              }}
              aria-label={`Ir a tarjeta ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${activeIndex === idx
                ? 'w-6 bg-emerald-400'
                : 'w-1.5 bg-zinc-700 hover:bg-zinc-500'
                }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};
