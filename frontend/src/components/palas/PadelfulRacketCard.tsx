import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { PadelfulPalaPreview } from '../../types';
import { ChevronRight, Layers } from 'lucide-react';
import { formatPalaModelOnly } from '../../utils/formatters';

interface PadelfulRacketCardProps {
  racket: PadelfulPalaPreview;
  showActions?: boolean;
}

export const PadelfulRacketCard: React.FC<PadelfulRacketCardProps> = ({
  racket,
  showActions = true,
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      to={`/palas/${racket.slug}`}
      className="group relative rounded-3xl bg-[var(--bg-card)] border border-zinc-200 dark:border-white/10 hover:border-emerald-500/50 shadow-md shadow-zinc-900/5 dark:shadow-xl hover:shadow-xl dark:hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1.5 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Zona Superior: Pedestal con Imagen Ampliada */}
      <div className="relative w-full h-72 sm:h-80 bg-gradient-to-b from-zinc-100 via-zinc-200/50 to-zinc-100 dark:bg-radial dark:from-zinc-800/40 dark:via-zinc-900/70 dark:to-zinc-950 overflow-hidden flex items-center justify-center p-6 border-b border-zinc-200 dark:border-white/5 transition-colors">
        {/* Glow de fondo en hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Imagen de la pala */}
        {racket.imagenUrl && !imgError ? (
          <img
            src={racket.imagenUrl}
            alt={`${racket.marca} ${racket.modelo}`}
            className="max-h-full max-w-full object-contain filter drop-shadow-[0_12px_20px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_14px_28px_rgba(0,0,0,0.65)] group-hover:scale-105 group-hover:-rotate-1 transition-transform duration-500 ease-out z-10"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 gap-2 z-10">
            <Layers size={44} className="text-zinc-400" />
            <span className="text-xs font-bold tracking-wider uppercase text-zinc-500 dark:text-zinc-400">{racket.marca}</span>
          </div>
        )}

        {/* Badge Flotante de Año */}
        {racket.anoLanzamiento && (
          <div className="absolute top-3.5 left-3.5 z-20">
            <span className="px-3 py-1 rounded-full text-xs font-black tracking-wider bg-white/90 dark:bg-zinc-900/85 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-white/15 backdrop-blur-md shadow-sm">
              {racket.anoLanzamiento}
            </span>
          </div>
        )}
      </div>

      {/* Zona Inferior: Información esencial y Botón Ver Ficha */}
      <div className="p-4 sm:p-5 flex items-center justify-between gap-3 bg-[var(--bg-card)] dark:bg-zinc-950/60 border-t border-zinc-100 dark:border-transparent transition-colors">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block truncate">
            {racket.marca}
          </span>
          <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors mt-0.5">
            {formatPalaModelOnly(racket.marca, racket.modelo) || racket.modelo}
          </h3>
        </div>

        {showActions && (
          <span className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 group-hover:bg-emerald-400 text-zinc-950 font-black text-xs transition-all shadow-md shadow-emerald-500/20 shrink-0">
            <span>Ver Ficha</span>
            <ChevronRight size={14} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform" />
          </span>
        )}
      </div>
    </Link>
  );
};

export default PadelfulRacketCard;
