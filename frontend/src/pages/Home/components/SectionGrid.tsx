import React from 'react';
import { Link } from 'react-router-dom';
import { mockSections } from '../../../data/news';
import { PhotoPlaceholder } from './PhotoPlaceholder';
import { ArrowUpRight } from 'lucide-react';

export const SectionGrid: React.FC = () => {
  return (
    <section className="w-full border-b border-[var(--editorial-border)] bg-[var(--editorial-bg)] text-[var(--editorial-fg)]">
      {/* Cabecera de la sección */}
      <div className="py-12 px-6 md:px-12 border-b border-[var(--editorial-border)] flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="editorial-meta text-[11px] text-[#F04E37] tracking-[0.2em] block mb-2">
            [ ÍNDICE EDITORIAL ]
          </span>
          <h2 className="headline-large tracking-[-0.05em] leading-[0.89] lowercase">
            secciones del archivo.
          </h2>
        </div>
        <p className="text-xs text-[var(--editorial-muted)] font-editorial max-w-[36ch]">
          Seis ramas de cobertura analítica que documentan el pádel contemporáneo desde la pista hasta el laboratorio.
        </p>
      </div>

      {/* Grilla de 6 bloques grandes con separación entre sí */}
      <div className="p-6 md:p-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {mockSections.map((section, index) => (
            <Link
              key={section.id}
              to={`/seccion/${section.slug}`}
              className="editorial-card-group group relative min-h-[58vh] md:min-h-[66vh] flex flex-col justify-between p-8 overflow-hidden transition-colors border border-[var(--editorial-border)]"
            >
              {/* 1. Fondo fotográfico con esquinas 100% rectas */}
              <div className="absolute inset-0 z-0">
                <PhotoPlaceholder
                  description={section.fotoDescripcion}
                  ratio="full"
                  overlayOpacity={0.42}
                  contrast="medium"
                  className="w-full h-full"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(10,10,10,0.5) 0%, rgba(10,10,10,0.2) 40%, rgba(10,10,10,0.92) 100%)',
                  }}
                />
              </div>

              {/* 2. Metadatos superiores (esquinas) */}
              <div className="relative z-10 flex justify-between items-start text-white">
                <span className="editorial-meta text-[11px] text-[#F04E37]">
                  [{String(index + 1).padStart(2, '0')} / 06]
                </span>
                <span className="editorial-meta text-[10px] text-white/60 bg-black/60 px-2 py-0.5 border border-white/10">
                  {section.conteo} NOTAS
                </span>
              </div>

              {/* 3. Contenido inferior: Titular gigante en minúscula + flecha */}
              <div className="relative z-10 flex flex-col gap-3 text-white">
                <div className="flex items-end justify-between gap-4">
                  <h3 className="headline-medium text-white tracking-[-0.05em] leading-[0.9] lowercase editorial-headline-hover">
                    {section.nombre}
                  </h3>
                  <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center group-hover:bg-[#F04E37] group-hover:border-[#F04E37] transition-all flex-shrink-0">
                    <ArrowUpRight size={18} />
                  </div>
                </div>

                <p className="text-[12px] text-white/75 font-editorial leading-snug max-w-[32ch]">
                  {section.subtitulo}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
