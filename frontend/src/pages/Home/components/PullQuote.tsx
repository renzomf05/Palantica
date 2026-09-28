import React from 'react';

interface PullQuoteProps {
  quote?: string;
  author?: string;
  role?: string;
  statNumber?: string;
  statLabel?: string;
}

export const PullQuote: React.FC<PullQuoteProps> = ({
  quote = 'el pádel moderno no se juega con el brazo, se juega con la velocidad de la bola y los datos de la pista.',
  author = 'agustín tapia',
  role = 'nº1 del mundo · premio a la precisión 2026',
  statNumber = '74%',
  statLabel = 'de los puntos en el 20x10 se deciden en la red',
}) => {
  return (
    <section
      className="relative w-full min-h-[82vh] flex flex-col justify-between p-8 md:p-16 border-b border-[var(--editorial-border)] select-none overflow-hidden transition-colors"
      style={{
        backgroundColor: 'var(--special-bg)',
        color: 'var(--special-fg)',
      }}
    >
      {/* 1. Fondo Gráfico y Tipografía Monumental Superpuesta (Estilo Afiche Suizo) */}
      <div
        className="absolute top-8 left-8 right-8 z-0 pointer-events-none select-none flex flex-col opacity-[0.16] overflow-hidden"
        aria-hidden="true"
      >
        <span
          className="font-editorial font-black text-[clamp(4.5rem,14vw,16rem)] leading-[0.8] tracking-[-0.07em] lowercase"
          style={{ color: '#F04E37' }}
        >
          swiss
        </span>
        <span
          className="font-editorial font-black text-[clamp(4.5rem,14vw,16rem)] leading-[0.8] tracking-[-0.07em] lowercase"
          style={{ color: 'var(--special-fg)' }}
        >
          typography.
        </span>
      </div>

      {/* 2. Esquinas Superiores: Marcas de Registro Técnicas */}
      <div className="relative z-10 flex justify-between items-start w-full">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-3 bg-[#F04E37] inline-block" />
        </div>
        <span
          className="editorial-meta text-[11px] font-bold tracking-widest"
          style={{ color: 'var(--special-dim)' }}
        >
          | SWISS STYLE |
        </span>
      </div>

      {/* 3. Centro / Asimetría: Cita gigante en tipografía suiza extrema */}
      <div className="relative z-10 my-auto py-12 max-w-5xl">
        <blockquote
          className="headline-large tracking-[-0.05em] leading-[0.88] lowercase text-balance font-extrabold"
          style={{ color: 'var(--special-fg)' }}
        >
          "{quote.endsWith('.') ? quote : `${quote}.`}"
        </blockquote>
      </div>

      {/* 4. Esquinas Inferiores: Atribución + Muestra Tipográfica + Métrica */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pt-8 border-t border-[var(--special-border)]">

        {/* Atribución del autor */}
        <div className="flex flex-col gap-1">
          <span className="font-editorial text-xl md:text-2xl font-bold lowercase tracking-[-0.03em] text-[#F04E37]">
            — {author}.
          </span>
          <span
            className="editorial-meta text-[10px]"
            style={{ color: 'var(--special-muted)' }}
          >
            {role.toUpperCase()}
          </span>
        </div>

        {/* Muestra técnica de letras/números (homenaje al póster) */}
        <div
          className="hidden lg:flex flex-col gap-0.5 font-mono text-[9px] tracking-widest opacity-60 border-l border-[var(--special-border)] pl-6"
          style={{ color: 'var(--special-fg)' }}
        >
          <span>ABCDEFGHIJKLM</span>
          <span>NOPQRSTUVWXYZ</span>
          <span className="text-[#F04E37]">1234567890$?</span>
        </div>

        {/* Dato estadístico en número monumental */}
        <div className="flex items-baseline gap-4 md:text-right">
          <span
            className="font-editorial text-5xl md:text-7xl font-black tracking-[-0.06em]"
            style={{ color: 'var(--special-fg)' }}
          >
            {statNumber}
          </span>
          <span
            className="editorial-meta text-[10px] max-w-[20ch]"
            style={{ color: 'var(--special-muted)' }}
          >
            {statLabel.toUpperCase()}
          </span>
        </div>

      </div>
    </section>
  );
};
