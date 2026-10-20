import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { PadelfulPalaPreview } from '../../types';
import {
  Star,
  Zap,
  Target,
  Wind,
  RotateCcw,
  ChevronRight,
  CircleDot,
  Layers,
  Disc,
} from 'lucide-react';

interface PadelfulRacketCardProps {
  racket: PadelfulPalaPreview;
  showActions?: boolean;
}

export const PadelfulRacketCard: React.FC<PadelfulRacketCardProps> = ({
  racket,
  showActions = true,
}) => {
  const [imgError, setImgError] = useState(false);

  const getFormaBadge = (forma: string) => {
    switch (forma?.toLowerCase()) {
      case 'diamante':
        return { label: 'Diamante', icon: '💎', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
      case 'redonda':
        return { label: 'Redonda', icon: '⭕', color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' };
      default:
        return { label: 'Lágrima', icon: '💧', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' };
    }
  };

  const formaInfo = getFormaBadge(racket.forma);

  const getDurezaBadge = (dureza: string, score: number) => {
    if (score >= 8 || dureza === 'Dura') {
      return { label: 'Tacto Duro', color: 'text-red-400 bg-red-500/10 border-red-500/30' };
    }
    if (score <= 5.5 || dureza === 'Blanda') {
      return { label: 'Tacto Blando', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    }
    return { label: 'Tacto Medio', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
  };

  const durezaInfo = getDurezaBadge(racket.durezaNivel, racket.durezaScore);

  return (
    <div className="group relative rounded-3xl bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border border-white/10 hover:border-emerald-500/50 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1.5 flex flex-col overflow-hidden">
      {/* Zona Superior: Pedestal con Imagen */}
      <div className="relative w-full h-64 bg-radial from-zinc-800/50 via-zinc-900/80 to-zinc-950 overflow-hidden flex items-center justify-center p-6 border-b border-white/5">
        {/* Glow de fondo */}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Imagen de la pala */}
        {racket.imagenUrl && !imgError ? (
          <img
            src={racket.imagenUrl}
            alt={`${racket.marca} ${racket.modelo}`}
            className="max-h-full max-w-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)] group-hover:scale-110 group-hover:-rotate-2 transition-transform duration-500 ease-out z-10"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-zinc-500 gap-2 z-10">
            <span className="text-5xl">🏓</span>
            <span className="text-xs font-bold tracking-wider uppercase text-zinc-400">{racket.marca}</span>
          </div>
        )}

        {/* Badges superiores flotantes */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-20">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md border flex items-center gap-1 ${formaInfo.color}`}>
            <span>{formaInfo.icon}</span>
            <span>{formaInfo.label}</span>
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-900/90 text-zinc-300 border border-white/10 backdrop-blur-md">
            {racket.anoLanzamiento}
          </span>
        </div>

        {/* Calificación Global */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/85 backdrop-blur-md text-amber-400 font-extrabold text-xs border border-amber-400/40 shadow-lg z-20">
          <Star size={13} className="fill-amber-400 text-amber-400" />
          <span>{racket.puntuacionGeneral.toFixed(1)}</span>
        </div>

        {/* Badge Pro Player */}
        {racket.jugadorPro && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 backdrop-blur-md text-[10px] font-bold z-20">
            <CircleDot size={10} className="text-emerald-400" />
            <span>Pala Pro de {racket.jugadorPro}</span>
          </div>
        )}
      </div>

      {/* Contenido / Métricas de la pala */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-4">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">
              {racket.marca}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${durezaInfo.color}`}>
              {durezaInfo.label}
            </span>
          </div>

          <h3 className="text-lg font-black text-white tracking-tight leading-snug mt-1 group-hover:text-emerald-300 transition-colors line-clamp-1">
            {racket.modelo}
          </h3>

          {racket.descripcion && (
            <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
              {racket.descripcion}
            </p>
          )}
        </div>

        {/* Mini radar / Barras de rendimiento técnico */}
        <div className="space-y-2 pt-2 border-t border-white/5">
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {/* Potencia */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-zinc-400 font-semibold text-[10px]">
                <span className="flex items-center gap-1">
                  <Zap size={11} className="text-amber-400" /> Potencia
                </span>
                <span className="text-white font-bold">{racket.potenciaScore.toFixed(1)}</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full"
                  style={{ width: `${Math.min(100, racket.potenciaScore * 10)}%` }}
                />
              </div>
            </div>

            {/* Control */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-zinc-400 font-semibold text-[10px]">
                <span className="flex items-center gap-1">
                  <Target size={11} className="text-sky-400" /> Control
                </span>
                <span className="text-white font-bold">{racket.controlScore.toFixed(1)}</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-blue-400 rounded-full"
                  style={{ width: `${Math.min(100, racket.controlScore * 10)}%` }}
                />
              </div>
            </div>

            {/* Salida de bola */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-zinc-400 font-semibold text-[10px]">
                <span className="flex items-center gap-1">
                  <Wind size={11} className="text-emerald-400" /> Salida Bola
                </span>
                <span className="text-white font-bold">{racket.salidaBolaScore.toFixed(1)}</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                  style={{ width: `${Math.min(100, racket.salidaBolaScore * 10)}%` }}
                />
              </div>
            </div>

            {/* Maniobrabilidad */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-zinc-400 font-semibold text-[10px]">
                <span className="flex items-center gap-1">
                  <RotateCcw size={11} className="text-purple-400" /> Manejo
                </span>
                <span className="text-white font-bold">{racket.maniobrabilidadScore.toFixed(1)}</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-400 rounded-full"
                  style={{ width: `${Math.min(100, racket.maniobrabilidadScore * 10)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Materiales en cápsulas */}
          <div className="flex flex-wrap gap-1.5 pt-1 text-[10px]">
            <span className="px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-300 border border-white/5 flex items-center gap-1">
              <Layers size={10} className="text-zinc-400" /> {racket.materialCaras}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-300 border border-white/5 flex items-center gap-1">
              <Disc size={10} className="text-zinc-400" /> {racket.materialNucleo}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-300 border border-white/5">
              Balance {racket.balanceNivel} ({racket.balanceMm}mm)
            </span>
          </div>
        </div>

        {/* Footer con Precio y Acciones */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div>
            <span className="text-[10px] text-zinc-400 block font-bold uppercase tracking-wider">
              Mercado Recomendado
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-white">€{racket.precio.toFixed(0)}</span>
              <span className="text-[10px] text-zinc-400 font-semibold">{racket.moneda}</span>
            </div>
          </div>

          {showActions && (
            <Link
              to={`/palas/${racket.slug}`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs transition-colors shadow-md shadow-emerald-500/20"
            >
              <span>Ver Ficha</span>
              <ChevronRight size={14} strokeWidth={2.5} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
export default PadelfulRacketCard;
