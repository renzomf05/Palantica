import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Cpu } from 'lucide-react';

export const EncyclopediaBridge: React.FC = () => {
  return (
    <section className="w-full py-16 px-6 md:px-12 border-b border-[var(--editorial-border)] bg-[var(--editorial-bg)] text-[var(--editorial-fg)]">
      <div className="max-w-6xl mx-auto border border-[var(--editorial-border)] p-8 md:p-12 relative overflow-hidden bg-[var(--editorial-surface)]">
        
        {/* Metadatos superiores */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-2">
            <Cpu size={14} className="text-[#F04E37]" />
            <span className="editorial-meta text-[10px] text-[#F04E37] tracking-[0.2em]">
              [ PUENTE CON LA ENCICLOPEDIA // LAB REVIEW ]
            </span>
          </div>
          <span className="editorial-meta text-[10px] text-[var(--editorial-muted)]">
            TEST Nº 842 · CATÁLOGO ACTIVO
          </span>
        </div>

        {/* Estructura asimétrica: Pala destacada de la semana */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-8 flex flex-col gap-4">
            <span className="editorial-meta text-[11px] text-[var(--editorial-muted)]">
              PALA DE LA SEMANA
            </span>

            <h3 className="headline-medium text-[var(--editorial-fg)] tracking-[-0.05em] leading-[0.9] lowercase">
              nox at10 genius 18k alum.
            </h3>

            <p className="text-xs md:text-sm text-[var(--editorial-muted)] font-editorial leading-relaxed max-w-[50ch]">
              Revisamos la pala insignia de Agustín Tapia: núcleo MLD Black Eva multicapa y carbono aluminizado 18K. Medimos balance, rigidez torsional y tolerancia del punto dulce en nuestro banco de pruebas.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex flex-col">
                <span className="editorial-meta text-[9px] text-[var(--editorial-dim)]">BALANCE</span>
                <span className="font-editorial text-sm font-bold lowercase">265 mm (medio-alto)</span>
              </div>
              <div className="flex flex-col border-l border-[var(--editorial-border)] pl-4">
                <span className="editorial-meta text-[9px] text-[var(--editorial-dim)]">TACTO</span>
                <span className="font-editorial text-sm font-bold lowercase">medio-duro reactivo</span>
              </div>
              <div className="flex flex-col border-l border-[var(--editorial-border)] pl-4">
                <span className="editorial-meta text-[9px] text-[var(--editorial-dim)]">CONTROL / POTENCIA</span>
                <span className="font-editorial text-sm font-bold lowercase">9.4 / 9.6 rating</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-center gap-4">
            <Link
              to="/catalogo"
              className="editorial-pill-btn bg-[var(--editorial-fg)] text-[var(--editorial-bg)] hover:bg-[#F04E37] hover:text-white"
            >
              <span>ver en el catálogo</span>
              <ArrowUpRight size={15} />
            </Link>
            <span className="editorial-meta text-[9px] text-[var(--editorial-dim)] text-left lg:text-right">
              EXPLORAR 140+ MODELOS ANALIZADOS
            </span>
          </div>

        </div>

      </div>
    </section>
  );
};
