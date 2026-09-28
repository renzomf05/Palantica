import React from 'react';
import type { NewsItem } from '../../../data/news';

interface TickerProps {
  items: NewsItem[];
}

export const Ticker: React.FC<TickerProps> = ({ items }) => {
  return (
    <div
      className="editorial-ticker-container w-full border-b border-[var(--editorial-border)] bg-[var(--editorial-bg)] text-[var(--editorial-fg)] py-3 px-4 overflow-hidden relative select-none"
      role="region"
      aria-label="Últimas noticias en tiempo real"
    >
      <div className="editorial-ticker-track flex items-center gap-10 whitespace-nowrap">
        {/* Renderizado doble para bucle infinito perfecto */}
        {[...items, ...items].map((item, idx) => (
          <div
            key={`${item.id}-${idx}`}
            className="inline-flex items-center gap-4 text-xs font-editorial tracking-tight"
          >
            {/* Punto de acento naranja */}
            <span className="w-2 h-2 rounded-full bg-[#F04E37] flex-shrink-0 animate-pulse" />
            
            {/* Categoría en estilo monoespaciado */}
            <span className="editorial-meta text-[10px] text-[#F04E37]">
              {item.categoria}
            </span>

            {/* Titular corto en minúscula */}
            <span className="font-bold text-[13px] tracking-[-0.02em] hover:text-[#F04E37] transition-colors cursor-pointer">
              {item.titulo.endsWith('.') ? item.titulo : `${item.titulo}.`}
            </span>

            {/* Separador editorial suizo */}
            <span className="text-[var(--editorial-dim)] text-[10px] font-mono">
              //
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
