import React from 'react';
import { Link } from 'react-router-dom';
import type { NewsItem } from '../../../data/news';
import { PhotoPlaceholder } from './PhotoPlaceholder';
import { ArrowUpRight } from 'lucide-react';

interface NewsCardProps {
  article: NewsItem;
  className?: string;
}

interface CardLinkProps {
  article: NewsItem;
  children: React.ReactNode;
  className?: string;
}

const CardLink: React.FC<CardLinkProps> = ({ article, children, className = '' }) => {
  if (article.link) {
    return (
      <a
        href={article.link}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    );
  }
  return (
    <Link to={`/noticia/${article.id}`} className={className}>
      {children}
    </Link>
  );
};

export const NewsCard: React.FC<NewsCardProps> = ({ article, className = '' }) => {
  return (
    <article
      className={`editorial-card-group flex flex-col gap-4 group cursor-pointer ${className}`}
      style={{
        background: 'transparent',
        boxShadow: 'none',
        borderRadius: '0px',
      }}
    >
      <CardLink article={article} className="block overflow-hidden relative">
        {/* Contenedor de foto con esquinas 100% rectas */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-[var(--editorial-surface)]">
          <PhotoPlaceholder
            description={article.fotoDescripcion || article.titulo}
            src={article.imagen}
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

          {/* Fuente o tiempo de lectura en esquina inferior */}
          <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5">
            {article.fuente && (
              <span className="editorial-meta text-[9px] text-white/90 bg-black/70 px-1.5 py-0.5 border border-white/10 max-w-[120px] truncate">
                {article.fuente}
              </span>
            )}
            {article.tiempoLectura && (
              <span className="editorial-meta text-[9px] text-white/70 bg-black/60 px-1.5 py-0.5">
                {article.tiempoLectura} MIN
              </span>
            )}
          </div>
        </div>
      </CardLink>

      {/* Metadatos y titular limpio sin bordes ni fondos */}
      <div className="flex flex-col gap-2 pt-1">
        <div className="flex items-center justify-between text-[var(--editorial-muted)]">
          <span className="editorial-meta text-[10px] text-[#F04E37] flex items-center gap-1">
            {article.categoria}
            {article.link && <ArrowUpRight size={11} className="opacity-70" />}
          </span>
          <span className="editorial-meta text-[10px]">
            {article.fecha}
          </span>
        </div>

        <CardLink article={article}>
          <h3 className="headline-card text-[var(--editorial-fg)] leading-[0.94] tracking-[-0.04em] lowercase editorial-headline-hover text-balance">
            {article.titulo.endsWith('.') ? article.titulo : `${article.titulo}.`}
          </h3>
        </CardLink>

        <p className="text-[12px] text-[var(--editorial-muted)] font-editorial leading-tight line-clamp-3 mt-1">
          {article.bajada}
        </p>
      </div>
    </article>
  );
};
