import React from 'react';
import { Link } from 'react-router-dom';
import type { NewsItem } from '../../../data/news';
import { PhotoPlaceholder } from './PhotoPlaceholder';

interface NewsCardProps {
  article: NewsItem;
  className?: string;
}

export const NewsCard: React.FC<NewsCardProps> = ({ article, className = '' }) => {
  /* acá va la foto de: ${article.fotoDescripcion} */
  return (
    <article
      className={`editorial-card-group flex flex-col gap-4 group cursor-pointer ${className}`}
      style={{
        background: 'transparent',
        boxShadow: 'none',
        borderRadius: '0px',
      }}
    >
      <Link to={`/noticia/${article.id}`} className="block overflow-hidden relative">
        {/* Contenedor de foto con esquinas 100% rectas */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-[var(--editorial-surface)]">
          <PhotoPlaceholder
            description={article.fotoDescripcion}
            ratio="full"
            overlayOpacity={0.2}
            contrast="medium"
            className="w-full h-full"
          />

          {/* Tag de categoría en esquina superior */}
          <div className="absolute top-3 left-3 z-10">
            <span className="editorial-meta text-[9px] px-2 py-0.5 bg-black/75 backdrop-blur-sm text-white border border-white/10 tracking-widest">
              {article.categoria}
            </span>
          </div>

          {/* Tiempo de lectura en esquina inferior */}
          <div className="absolute bottom-3 right-3 z-10">
            <span className="editorial-meta text-[9px] text-white/70 bg-black/60 px-1.5 py-0.5">
              {article.tiempoLectura} MIN
            </span>
          </div>
        </div>
      </Link>

      {/* Metadatos y titular limpio sin bordes ni fondos */}
      <div className="flex flex-col gap-2 pt-1">
        <div className="flex items-center justify-between text-[var(--editorial-muted)]">
          <span className="editorial-meta text-[10px] text-[#F04E37]">
            {article.categoria}
          </span>
          <span className="editorial-meta text-[10px]">
            {article.fecha}
          </span>
        </div>

        <Link to={`/noticia/${article.id}`}>
          <h3 className="headline-card text-[var(--editorial-fg)] leading-[0.94] tracking-[-0.04em] lowercase editorial-headline-hover text-balance">
            {article.titulo.endsWith('.') ? article.titulo : `${article.titulo}.`}
          </h3>
        </Link>

        <p className="text-[12px] text-[var(--editorial-muted)] font-editorial leading-tight line-clamp-2 mt-1">
          {article.bajada}
        </p>
      </div>
    </article>
  );
};
