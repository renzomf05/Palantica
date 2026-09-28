import React, { useRef } from 'react';
import type { NewsItem } from '../../../data/news';
import { NewsCard } from './NewsCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NewsCarouselProps {
  title?: string;
  subtitle?: string;
  articles: NewsItem[];
}

export const NewsCarousel: React.FC<NewsCarouselProps> = ({
  title = 'últimas noticias.',
  subtitle = 'edición continuada · actualización de pista',
  articles,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full py-16 md:py-24 px-6 md:px-12 border-b border-[var(--editorial-border)] bg-[var(--editorial-bg)] text-[var(--editorial-fg)] flex flex-col gap-10">
      {/* Cabecera del carrusel con estética de colección de tienda */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <span className="editorial-meta text-[11px] text-[#F04E37] tracking-[0.2em]">
            [ LOOKBOOK / NOTICIAS RECIENTES ]
          </span>
          <h2 className="headline-large tracking-[-0.05em] leading-[0.89] lowercase">
            {title}
          </h2>
          <span className="text-xs text-[var(--editorial-muted)] font-editorial">
            {subtitle}
          </span>
        </div>

        {/* Controles de navegación táctiles y flechas */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <span className="editorial-meta text-[10px] text-[var(--editorial-dim)] mr-2 hidden sm:inline">
            ARRASTRAR O DESLIZAR →
          </span>
          <button
            onClick={() => scroll('left')}
            className="w-10 h-10 border border-[var(--editorial-border)] flex items-center justify-center hover:bg-[var(--editorial-fg)] hover:text-[var(--editorial-bg)] transition-colors"
            aria-label="Noticias anteriores"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-10 h-10 border border-[var(--editorial-border)] flex items-center justify-center hover:bg-[var(--editorial-fg)] hover:text-[var(--editorial-bg)] transition-colors"
            aria-label="Siguientes noticias"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Riel deslizable con scroll-snap táctil */}
      <div
        ref={scrollContainerRef}
        className="editorial-carousel w-full pb-4"
        tabIndex={0}
        role="region"
        aria-label="Carrusel de últimas noticias"
      >
        {articles.map((article) => (
          <div
            key={article.id}
            className="editorial-carousel-item w-[280px] sm:w-[320px] md:w-[360px]"
          >
            <NewsCard article={article} />
          </div>
        ))}
      </div>
    </section>
  );
};
