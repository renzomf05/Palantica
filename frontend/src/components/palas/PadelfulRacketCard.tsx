import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { PadelfulPalaPreview } from '../../types';
import { ChevronRight } from 'lucide-react';

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
      className="group relative rounded-3xl bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border border-white/10 hover:border-emerald-500/50 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1.5 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Zona Superior: Pedestal con Imagen Ampliada */}
      <div className="relative w-full h-72 sm:h-80 bg-radial from-zinc-800/40 via-zinc-900/70 to-zinc-950 overflow-hidden flex items-center justify-center p-6 border-b border-white/5">
        {/* Glow de fondo en hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Imagen de la pala */}
        {racket.imagenUrl && !imgError ? (
          <img
            src={racket.imagenUrl}
            alt={`${racket.marca} ${racket.modelo}`}
            className="max-h-full max-w-full object-contain filter drop-shadow-[0_14px_28px_rgba(0,0,0,0.65)] group-hover:scale-105 group-hover:-rotate-1 transition-transform duration-500 ease-out z-10"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-zinc-500 gap-2 z-10">
            <span className="text-5xl">🏓</span>
            <span className="text-xs font-bold tracking-wider uppercase text-zinc-400">{racket.marca}</span>
          </div>
        )}

        {/* Badge Flotante de Año */}
        {racket.anoLanzamiento && (
          <div className="absolute top-3.5 left-3.5 z-20">
            <span className="px-3 py-1 rounded-full text-xs font-black tracking-wider bg-zinc-900/85 text-zinc-200 border border-white/15 backdrop-blur-md shadow-md">
              {racket.anoLanzamiento}
            </span>
          </div>
        )}
      </div>

      {/* Zona Inferior: Información esencial y Botón Ver Ficha */}
      <div className="p-4 sm:p-5 flex items-center justify-between gap-3 bg-zinc-950/60">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block truncate">
            {racket.marca}
          </span>
          <h3 className="text-sm sm:text-base font-bold text-white truncate group-hover:text-emerald-300 transition-colors mt-0.5">
            {racket.modelo}
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
