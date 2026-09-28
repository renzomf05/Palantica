import React from 'react';
import { Link } from 'react-router-dom';
import type { NewsItem } from '../../../data/news';
import { PhotoPlaceholder } from './PhotoPlaceholder';
import { ArrowUpRight } from 'lucide-react';

interface FeaturedArticleProps {
  article: NewsItem;
}

export const FeaturedArticle: React.FC<FeaturedArticleProps> = ({ article }) => {
  const titulo = article.titulo || '';
  const words = titulo.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const charCount = titulo.length;

  const hasBajada = !!article.bajada && article.bajada.trim().length > 0;

  // Escala tipográfica para que la información de la noticia aproveche al máximo el espacio delimitado
  let titleSizeClass = 'text-[clamp(2.4rem,4.0vw,3.65rem)] leading-[1.02]';
  let bajadaSizeClass = 'text-[14px] md:text-[15px] lg:text-[16px] leading-relaxed line-clamp-3 mt-4';

  if (hasBajada) {
    if (wordCount > 20 || charCount > 115) {
      titleSizeClass = 'text-[clamp(1.9rem,3.0vw,2.75rem)] leading-[1.08] line-clamp-5';
      bajadaSizeClass = 'text-[13px] md:text-[14px] leading-normal line-clamp-2 mt-3';
    } else if (wordCount > 11 || charCount > 60) {
      titleSizeClass = 'text-[clamp(2.4rem,3.8vw,3.5rem)] leading-[1.03] line-clamp-4';
      bajadaSizeClass = 'text-[14px] md:text-[15px] lg:text-[16px] leading-relaxed line-clamp-3 mt-4';
    } else {
      titleSizeClass = 'text-[clamp(2.9rem,4.8vw,4.3rem)] leading-[0.95] line-clamp-3';
      bajadaSizeClass = 'text-[15px] md:text-[16px] lg:text-[17px] leading-relaxed line-clamp-4 mt-5';
    }
  } else {
    // Si no hay bajada, el titular escala al máximo para llenar el alto delimitado
    if (wordCount > 20 || charCount > 115) {
      titleSizeClass = 'text-[clamp(2.25rem,3.6vw,3.35rem)] leading-[1.05] line-clamp-6';
    } else if (wordCount > 11 || charCount > 60) {
      titleSizeClass = 'text-[clamp(2.8rem,4.4vw,4.15rem)] leading-[1.0] line-clamp-5';
    } else {
      titleSizeClass = 'text-[clamp(3.4rem,5.6vw,5.0rem)] leading-[0.92] line-clamp-4';
    }
  }

  return (
    <article
      className="relative w-full min-h-[460px] lg:h-[540px] flex flex-col lg:flex-row overflow-hidden border-b border-[var(--editorial-border)] select-none transition-colors"
      style={{
        backgroundColor: 'var(--special-bg)',
        color: 'var(--special-fg)',
      }}
    >
      {/* 1. Fondo Fotográfico Único Continuo en toda la tarjeta */}
      <div className="absolute inset-0 z-0 opacity-45 mix-blend-luminosity">
        <PhotoPlaceholder
          description={article.fotoDescripcion || article.titulo}
          src={article.imagen}
          ratio="full"
          overlayOpacity={0.1}
          contrast="high"
          className="w-full h-full"
        />
      </div>

      {/* 2. Gradiente continuo sin cortes ni líneas: da contraste fluido a la mitad derecha sobre la misma imagen */}
      <div
        className="absolute inset-0 pointer-events-none z-0 hidden lg:block"
        style={{
          background:
            'linear-gradient(90deg, rgba(8, 22, 20, 0.12) 0%, rgba(8, 22, 20, 0.32) 40%, rgba(8, 22, 20, 0.82) 65%, rgba(8, 22, 20, 0.96) 100%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none z-0 block lg:hidden"
        style={{
          background:
            'linear-gradient(180deg, rgba(8, 22, 20, 0.25) 0%, rgba(8, 22, 20, 0.85) 60%, rgba(8, 22, 20, 0.98) 100%)',
        }}
      />

      {/* Marca gráfica de agua sutil en la composición */}
      <div
        className="absolute left-[6%] bottom-[-4vw] z-0 font-editorial font-black text-[clamp(12rem,26vw,32rem)] leading-none select-none pointer-events-none opacity-[0.04] tracking-tighter"
        style={{ color: 'var(--special-fg)' }}
      >
        G
      </div>

      {/* Mitad Izquierda (0% a 50%): Espacio abierto continuo para apreciar la imagen sin líneas divisorias */}
      <div className="hidden lg:block lg:w-1/2 lg:h-full self-stretch pointer-events-none" />

      {/* Mitad Derecha (50% a 100%): La información de la noticia utiliza este espacio al máximo */}
      <div className="w-full lg:w-1/2 lg:h-full min-h-[460px] lg:h-[540px] self-stretch flex-1 flex flex-col justify-between p-6 md:p-8 lg:p-12 relative z-10">
        
        {/* Cabecera superior de la mitad derecha */}
        <div className="w-full flex justify-between items-center border-b border-[var(--special-border)] pb-3.5">
          <span className="editorial-meta text-[11px] font-bold tracking-[0.25em] text-[#F04E37]">
            [ {article.categoria.toUpperCase()} ]
          </span>

          <div className="text-right">
            <span
              className="editorial-meta text-[10px] font-mono"
              style={{ color: 'var(--special-dim)' }}
            >
              {article.fecha} · {article.tiempoLectura || 5} MIN
            </span>
          </div>
        </div>

        {/* Zona central: La información de la noticia utiliza el espacio disponible al máximo */}
        <div className="flex-1 flex flex-col justify-center my-auto py-4 lg:py-6">
          <h2
            className={`${titleSizeClass} font-bold tracking-[-0.035em] lowercase select-none text-balance`}
            style={{ color: 'var(--special-fg)' }}
          >
            {titulo.endsWith('.') ? titulo : `${titulo}.`}
          </h2>

          {hasBajada && (
            <p
              className={`${bajadaSizeClass} font-editorial max-w-[50ch] text-[var(--special-muted)] text-pretty`}
            >
              {article.bajada}
            </p>
          )}
        </div>

        {/* Zona inferior de la mitad derecha: Fuente, autor y botón anclados al fondo */}
        <div className="w-full flex justify-between items-center pt-3.5 border-t border-[var(--special-border)] mt-auto">
          <div className="flex items-center gap-2 sm:gap-3 text-[10px] font-mono">
            <span style={{ color: 'var(--special-dim)' }}>
              FUENTE: {(article.fuente || 'ORIGINAL').toUpperCase()}
            </span>
            {article.autor && (
              <span className="hidden sm:inline text-[var(--special-muted)]">
                · {article.autor.toUpperCase()}
              </span>
            )}
          </div>

          {article.link ? (
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="editorial-pill-btn shadow-lg"
              style={{
                backgroundColor: 'var(--special-pill-bg)',
                color: 'var(--special-pill-fg)',
              }}
            >
              <span>leer en {article.fuente || 'fuente original'}</span>
              <ArrowUpRight size={14} />
            </a>
          ) : (
            <Link
              to={`/noticia/${article.id}`}
              className="editorial-pill-btn shadow-lg"
              style={{
                backgroundColor: 'var(--special-pill-bg)',
                color: 'var(--special-pill-fg)',
              }}
            >
              <span>leer informe especial</span>
              <ArrowUpRight size={14} />
            </Link>
          )}
        </div>

      </div>
    </article>
  );
};

