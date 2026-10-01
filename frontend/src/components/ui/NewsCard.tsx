import React from 'react';
import { Link } from 'react-router-dom';
import type { CarouselCardItem } from '../../types';
import { Heart, MessageCircle, Star, ArrowUpRight } from 'lucide-react';

interface NewsCardProps {
  item: CarouselCardItem;
  className?: string;
}

export const NewsCard: React.FC<NewsCardProps> = ({ item, className = '' }) => {
  return (
    <Link
      to={item.linkTo}
      className={`group relative flex-shrink-0 w-[260px] sm:w-[280px] h-[375px] sm:h-[390px] rounded-3xl overflow-hidden block border border-white/10 shadow-lg bg-zinc-900 transition-all duration-300 hover:border-emerald-500/50 hover:shadow-emerald-500/10 hover:shadow-2xl hover:-translate-y-1 ${className}`}
    >
      {/* Imagen a card completo sin oscurecer */}
      <img
        src={item.imagenUrl}
        alt={item.titulo}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        onError={(e) => {
          // Fallback visual si falla la URL de imagen
          (e.currentTarget as HTMLImageElement).src =
            'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=600&q=80';
        }}
      />

      {/* Chip de categoría: No aparece directamente al cargar, solo visible sutilmente en hover */}
      {item.etiqueta && (
        <div className="absolute top-3.5 left-3.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/85 backdrop-blur-md text-emerald-400 border border-emerald-400/40 shadow-sm">
            {item.etiqueta}
          </span>
        </div>
      )}

      {/* Indicador sutil de hover arriba a la derecha */}
      <div className="absolute top-3.5 right-3.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white/90 border border-white/15">
          <ArrowUpRight size={14} />
        </div>
      </div>

      {/* Gradiente suave en la parte inferior adaptado para que no se corte el texto con los bordes redondeados */}
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black via-black/85 to-transparent pointer-events-none" />

      {/* Contenido inferior con padding generoso (px-5 pb-5) para no ser cortado por los bordes rounded-3xl */}
      <div className="absolute inset-x-0 bottom-0 px-5 pb-5 pt-2 z-20 flex flex-col gap-1.5 text-white">
        {item.subtitulo && (
          <span className="text-[11px] font-semibold tracking-wide uppercase text-emerald-400/90 truncate">
            {item.subtitulo}
          </span>
        )}

        <h3 className="text-sm font-bold leading-snug tracking-tight text-white line-clamp-2 drop-shadow-sm group-hover:text-emerald-300 transition-colors">
          {item.titulo}
        </h3>

        {/* Autor si existe */}
        {item.autor && (
          <div className="flex items-center gap-2 pt-0.5 text-xs text-zinc-300">
            {item.autor.avatarUrl ? (
              <img
                src={item.autor.avatarUrl}
                alt={item.autor.nombre}
                className="w-5 h-5 rounded-full object-cover border border-white/20"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                {item.autor.nombre.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="truncate font-medium">{item.autor.nombre}</span>
          </div>
        )}

        {/* Métricas / Precios / Calificaciones adaptados con margen inferior seguro */}
        <div className="flex items-center justify-between text-xs text-zinc-300/90 pt-1.5 border-t border-white/10 mt-0.5">
          <div className="flex items-center gap-3">
            {item.likes !== undefined && (
              <span className="inline-flex items-center gap-1 font-medium">
                <Heart size={12} className="text-rose-400 fill-rose-400/30" />
                {item.likes}
              </span>
            )}
            {item.comentarios !== undefined && (
              <span className="inline-flex items-center gap-1 font-medium">
                <MessageCircle size={12} className="text-cyan-400" />
                {item.comentarios}
              </span>
            )}
            {item.rating !== undefined && (
              <span className="inline-flex items-center gap-1 font-semibold text-amber-400">
                <Star size={12} className="fill-amber-400 text-amber-400" />
                {item.rating.toFixed(1)}
              </span>
            )}
          </div>

          {item.precio !== undefined && (
            <span className="font-bold text-white text-xs tracking-tight">
              ${item.precio}
            </span>
          )}

          {item.fecha && !item.precio && (
            <span className="text-[10px] text-zinc-400 tracking-wider">
              {item.fecha}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};
