import React from 'react';
import { Link } from 'react-router-dom';
import type { NewsItem } from '../../../data/news';
import { PhotoPlaceholder } from './PhotoPlaceholder';
import { ArrowUpRight } from 'lucide-react';

interface HeroArticleProps {
  article: NewsItem;
}

export const HeroArticle: React.FC<HeroArticleProps> = ({ article }) => {
  /* acá va la foto de: ${article.fotoDescripcion} */
  return (
    <article className="relative w-full min-h-[92vh] flex flex-col justify-between overflow-hidden border-b border-[var(--editorial-border)]">
      {/* 1. Fondo fotográfico a sangre completa (full-bleed) */}
      <div className="absolute inset-0 z-0">
        <PhotoPlaceholder
          description={article.fotoDescripcion}
          ratio="full"
          overlayOpacity={0.38}
          contrast="high"
          className="w-full h-full"
        />
        {/* Gradiente vertical suave para legibilidad cinematográfica */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(10,10,10,0.65) 0%, rgba(10,10,10,0.2) 40%, rgba(10,10,10,0.85) 100%)',
          }}
        />
      </div>

      {/* 2. Barra de metadatos superior (esquinas) */}
      <div className="relative z-10 w-full pt-20 px-6 md:px-12 flex justify-between items-start text-white">
        <div className="flex flex-col gap-1">
          <span className="editorial-meta text-[11px] text-[#F04E37] tracking-[0.2em]">
            [ EDICIÓN 09/2026 · {article.categoria} ]
          </span>
          <span className="editorial-meta text-[10px] text-white/60">
            VOL. 01 / LOOKBOOK EDITORIAL
          </span>
        </div>

        <div className="text-right flex flex-col items-end gap-1">
          <span className="editorial-meta text-[10px] text-white/70">
            {article.fecha}
          </span>
          <span className="editorial-meta text-[10px] text-white/50">
            {article.tiempoLectura} MIN. LECTURA
          </span>
        </div>
      </div>

      {/* 3. Contenido principal asimétrico (titular masivo + bajada lateral) */}
      <div className="relative z-10 w-full px-6 md:px-12 pb-12 md:pb-16 flex flex-col justify-end text-white">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          
          {/* Titular gigante en minúscula a la izquierda */}
          <div className="lg:col-span-8 flex flex-col items-start">
            <h1 className="headline-giant text-white tracking-[-0.05em] lowercase leading-[0.87] select-none text-balance">
              {article.titulo.endsWith('.') ? article.titulo : `${article.titulo}.`}
            </h1>
          </div>

          {/* Bajada en columna angosta a la derecha + Botón pill blanco */}
          <div className="lg:col-span-4 flex flex-col justify-end gap-6 lg:pl-6 border-l-0 lg:border-l border-white/20">
            <p className="text-[13px] md:text-[14px] text-white/85 font-editorial leading-snug max-w-[38ch]">
              {article.bajada}
            </p>

            <div className="flex items-center gap-4 pt-2">
              <Link
                to={`/noticia/${article.id}`}
                className="editorial-pill-btn bg-white text-[#0A0A0A] hover:bg-[#F04E37] hover:text-white"
              >
                <span>leer nota</span>
                <ArrowUpRight size={15} />
              </Link>

              <span className="editorial-meta text-[10px] text-white/50">
                POR {article.autor.toUpperCase()}
              </span>
            </div>
          </div>

        </div>
      </div>
    </article>
  );
};
