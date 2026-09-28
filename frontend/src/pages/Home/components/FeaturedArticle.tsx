import React from 'react';
import { Link } from 'react-router-dom';
import type { NewsItem } from '../../../data/news';
import { PhotoPlaceholder } from './PhotoPlaceholder';
import { ArrowUpRight } from 'lucide-react';

interface FeaturedArticleProps {
  article: NewsItem;
}

export const FeaturedArticle: React.FC<FeaturedArticleProps> = ({ article }) => {
  /* acá va la foto de: ${article.fotoDescripcion} */
  return (
    <article
      className="relative w-full min-h-[92vh] flex flex-col justify-between overflow-hidden border-b border-[var(--editorial-border)] select-none transition-colors"
      style={{
        backgroundColor: 'var(--special-bg)',
        color: 'var(--special-fg)',
      }}
    >
      {/* 1. Fondo Duotone Fotográfico con Verde Petróleo y Crema Suizo */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-luminosity">
        <PhotoPlaceholder
          description={article.fotoDescripcion}
          ratio="full"
          overlayOpacity={0.15}
          contrast="high"
          className="w-full h-full"
        />
      </div>

      {/* Gradiente sutil para profundidad cromática suiza */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse at 85% 25%, rgba(240, 78, 55, 0.12) 0%, transparent 55%), linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%)',
        }}
      />

      {/* Letra gráfica de fondo a escala monumental (inspirada en la "G" del afiche de referencia) */}
      <div
        className="absolute right-[-2vw] bottom-[-6vw] z-0 font-editorial font-black text-[clamp(16rem,36vw,44rem)] leading-none select-none pointer-events-none opacity-[0.07] tracking-tighter"
        style={{ color: 'var(--special-fg)' }}
      >
        G
      </div>

      {/* 2. Marcas de Registro y Metadatos Superiores (Swiss Grid) */}
      <div className="relative z-10 w-full pt-16 px-6 md:px-12 flex justify-between items-start">
        {/* Marcas de estilo suizo en las esquinas */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3 bg-[#F04E37] inline-block" />
            <span
              className="editorial-meta text-[11px] font-bold tracking-[0.25em]"
              style={{ color: '#F04E37' }}
            >
              SWISS TYPOGRAPHY // INFORME ESPECIAL
            </span>
          </div>
          <span
            className="editorial-meta text-[10px] tracking-widest pl-3.5"
            style={{ color: 'var(--special-dim)' }}
          >
            PALANTICA LAB RESEARCH · SPECIMEN 02
          </span>
        </div>

        {/* Metadatos superiores derechos */}
        <div className="text-right flex flex-col items-end gap-1">
          <span
            className="editorial-meta text-[11px] font-bold tracking-widest"
            style={{ color: 'var(--special-fg)' }}
          >
            | SWISS STYLE |
          </span>
          <span
            className="editorial-meta text-[10px]"
            style={{ color: 'var(--special-dim)' }}
          >
            {article.fecha} · {article.tiempoLectura} MIN LECTURA
          </span>
        </div>
      </div>

      {/* 3. Contenido Principal: Tipografía Asimétrica a 12 Columnas */}
      <div className="relative z-10 w-full px-6 md:px-12 pb-16 flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">

          {/* Columna Izquierda: Tarjeta Técnica Specimen (Inspirada en el bloque interior de la "G") */}
          <div className="lg:col-span-4 hidden lg:flex flex-col gap-5 border-l border-[var(--special-border)] pl-6">

            {/* Caja de muestras tipográficas suizas */}
            <div
              className="p-5 border border-[var(--special-border-strong)] flex flex-col gap-3 backdrop-blur-sm"
              style={{ backgroundColor: 'var(--special-specimen-bg)' }}
            >
              <div className="flex justify-between items-baseline border-b border-[var(--special-border)] pb-2">
                <span className="editorial-meta text-[10px] font-bold text-[#F04E37]">
                  Neue Haas
                </span>
                <span
                  className="editorial-meta text-[10px] tracking-wider"
                  style={{ color: 'var(--special-fg)' }}
                >
                  grotesk.
                </span>
              </div>

              {/* Alfabeto técnico reducido del afiche */}
              <div
                className="font-mono text-[9px] leading-tight tracking-widest opacity-80 select-all"
                style={{ color: 'var(--special-fg)' }}
              >
                ABCDEFGHIJKLMNOP<br />
                QRSTUVWXYZ<br />
                1234567890$?&%
              </div>

              {/* Parámetros técnicos del informe de palas */}
              <div className="pt-2 border-t border-[var(--special-border)] flex flex-col gap-1 text-[11px] font-editorial">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--special-dim)' }}>rigidez dinámica:</span>
                  <span className="font-bold text-[#F04E37]">94.2 n/mm</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--special-dim)' }}>salida de bola:</span>
                  <span className="font-bold">4.8 / 10 (seca)</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--special-dim)' }}>ensayo:</span>
                  <span className="font-mono text-[10px] opacity-75">iso-padel 2026</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="editorial-meta text-[10px] text-[#F04E37]">
                DIRECCIÓN DE INVESTIGACIÓN
              </span>
              <span
                className="editorial-meta text-[10px]"
                style={{ color: 'var(--special-muted)' }}
              >
                AUTOR: {article.autor.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Columna Derecha: Titulares de Doble Impacto con Contraste Suizo */}
          <div className="lg:col-span-8 flex flex-col items-start lg:items-end text-left lg:text-right">

            {/* Tag previo en Naranja Suizo */}
            <div className="flex items-center gap-3 mb-3">
              <span className="editorial-meta text-[11px] font-bold tracking-[0.2em] text-[#F04E37]">
                [ MATERIAL Y LABORATORIO ]
              </span>
              <span
                className="editorial-meta text-[10px] hidden sm:inline"
                style={{ color: 'var(--special-dim)' }}
              >
                // REPORTE TÉCNICO EXCLUSIVO
              </span>
            </div>

            {/* Titular Gigante Asimétrico */}
            <h2
              className="headline-giant tracking-[-0.05em] lowercase leading-[0.87] select-none text-balance mb-6"
              style={{ color: 'var(--special-fg)' }}
            >
              {article.titulo.endsWith('.') ? article.titulo : `${article.titulo}.`}
            </h2>

            {/* Bajada en columna angosta */}
            <p
              className="text-[13px] md:text-[15px] font-editorial leading-snug max-w-[42ch] mb-8"
              style={{ color: 'var(--special-muted)' }}
            >
              {article.bajada}
            </p>

            {/* Botón Pill Suizo con Contraste Puro */}
            <Link
              to={`/noticia/${article.id}`}
              className="editorial-pill-btn shadow-lg"
              style={{
                backgroundColor: 'var(--special-pill-bg)',
                color: 'var(--special-pill-fg)',
              }}
            >
              <span>leer informe especial</span>
              <ArrowUpRight size={15} />
            </Link>
          </div>

        </div>
      </div>
    </article>
  );
};
