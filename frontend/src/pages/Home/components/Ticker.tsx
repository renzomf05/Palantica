import React from 'react';
import type { NewsItem } from '../../../data/news';

interface TickerProps {
  items?: NewsItem[];
  isReserved?: boolean;
}

export const Ticker: React.FC<TickerProps> = ({ items = [], isReserved = true }) => {
  if (isReserved || !items || items.length === 0) {
    return (
      <div
        className="w-full border-b border-[var(--editorial-border)] bg-[var(--editorial-bg)] text-[var(--editorial-muted)] py-2.5 px-6 md:px-12 flex items-center justify-between overflow-hidden select-none"
        role="region"
        aria-label="Espacio de transmisión reservado"
      >
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F04E37]/60" />
        </div>
        <div className="flex items-center gap-6 font-mono text-[9px] text-[var(--editorial-dim)] opacity-60">
          <span>FREQ: 104.2 MHZ</span>
          <span className="hidden sm:inline">·· EDICIÓN EN ESPERA ··</span>
          <span>SYS.OFFLINE</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="editorial-ticker-container w-full border-b border-[var(--editorial-border)] bg-[var(--editorial-bg)] text-[var(--editorial-fg)] py-3 px-4 overflow-hidden relative select-none"
      role="region"
      aria-label="Últimas noticias en tiempo real"
    >
      <div className="editorial-ticker-track flex items-center gap-10 whitespace-nowrap">
        {/* Renderizado doble para bucle infinito continuo */}
        {[...items, ...items].map((item, idx) => (
          <div
            key={`${item.id}-${idx}`}
            className="inline-flex items-center gap-4 text-xs font-editorial tracking-tight"
          >
            {/* Punto de acento naranja */}
            <span className="w-2 h-2 rounded-full bg-[#F04E37] flex-shrink-0 animate-pulse" />
            
            {/* Categoría o fuente */}
            <span className="editorial-meta text-[10px] text-[#F04E37]">
              {item.fuente ? item.fuente.toUpperCase() : item.categoria}
            </span>

            {/* Titular con enlace a la fuente si está disponible */}
            {item.link ? (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[13px] tracking-[-0.02em] hover:text-[#F04E37] transition-colors cursor-pointer"
              >
                {item.titulo.endsWith('.') ? item.titulo : `${item.titulo}.`}
              </a>
            ) : (
              <span className="font-bold text-[13px] tracking-[-0.02em] hover:text-[#F04E37] transition-colors cursor-pointer">
                {item.titulo.endsWith('.') ? item.titulo : `${item.titulo}.`}
              </span>
            )}

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
