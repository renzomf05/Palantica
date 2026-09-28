import React, { useState, useEffect } from 'react';
import { mockSections, type SectionMeta } from '../../../data/news';
import { PhotoPlaceholder } from './PhotoPlaceholder';
import { padelService, fallbackTelemetry, type PadelTelemetry } from '../../../services/padel/padelService';
import { ArrowUpRight, X } from 'lucide-react';

interface SectionGridProps {
  isReserved?: boolean;
}

export const SectionGrid: React.FC<SectionGridProps> = ({ isReserved = true }) => {
  const [telemetry, setTelemetry] = useState<PadelTelemetry>(fallbackTelemetry);
  const [activeSection, setActiveSection] = useState<SectionMeta | null>(null);

  useEffect(() => {
    if (isReserved) return;
    let mounted = true;
    padelService
      .getTelemetry()
      .then((data) => {
        if (mounted && data) {
          setTelemetry(data);
        }
      })
      .catch((err) => {
        console.warn('[SectionGrid] Error cargando telemetría FIP:', err);
      });

    return () => {
      mounted = false;
    };
  }, [isReserved]);

  const getSectionBadge = (slug: string) => {
    switch (slug) {
      case 'circuito': {
        const p1 = telemetry.rankings.topPlayers[0];
        const p2 = telemetry.rankings.topPlayers[1];
        if (p1 && p2) {
          return (
            <div className="flex items-center gap-2 py-1 px-2.5 bg-black/75 backdrop-blur-md border border-[#F04E37]/60 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F04E37] animate-pulse" />
              <span className="editorial-meta text-[9px] text-white tracking-widest uppercase font-mono">
                FIP Nº 1 EN VIVO: {p1.name.toUpperCase()} & {p2.name.toUpperCase()} · {p1.points.toLocaleString()} PTS
              </span>
            </div>
          );
        }
        return null;
      }
      case 'torneos': {
        const next = telemetry.nextTournament;
        return (
          <div className="flex items-center gap-2 py-1 px-2.5 bg-black/75 backdrop-blur-md border border-white/20 w-fit">
            <span className="editorial-meta text-[9px] text-[#F04E37] tracking-widest uppercase font-mono">
              PRÓXIMO FIP:
            </span>
            <span className="editorial-meta text-[9px] text-white/90 tracking-wide uppercase font-mono">
              {next ? `${next.name.toUpperCase()} · ${next.location.toUpperCase()}` : 'CALENDARIO OFICIAL FIP'}
            </span>
          </div>
        );
      }
      case 'jugadores': {
        const top4 = telemetry.rankings.topPlayers.slice(0, 4);
        return (
          <div className="flex items-center gap-2 py-1 px-2.5 bg-black/75 backdrop-blur-md border border-white/20 w-fit">
            <span className="editorial-meta text-[9px] text-[#F04E37] tracking-widest uppercase font-mono">
              TOP 4 FIP:
            </span>
            <span className="editorial-meta text-[9px] text-white/90 tracking-wide uppercase font-mono">
              {top4.length > 0
                ? top4.map((p) => `${p.ranking}. ${p.name.split(' ').pop()} (${p.country})`).join(' · ')
                : 'RANKING OFICIAL FIP'}
            </span>
          </div>
        );
      }
      case 'material':
        return (
          <div className="flex items-center gap-2 py-1 px-2.5 bg-black/75 backdrop-blur-md border border-white/20 w-fit">
            <span className="editorial-meta text-[9px] text-[#F04E37] tracking-widest uppercase font-mono">
              LAB TESTING:
            </span>
            <span className="editorial-meta text-[9px] text-white/90 tracking-wide uppercase font-mono">
              54 PALAS HOMOLOGADAS · BANCO TÉRMICO
            </span>
          </div>
        );
      case 'entrevistas':
        return (
          <div className="flex items-center gap-2 py-1 px-2.5 bg-black/75 backdrop-blur-md border border-white/20 w-fit">
            <span className="editorial-meta text-[9px] text-[#F04E37] tracking-widest uppercase font-mono">
              MICRO ABIERTO:
            </span>
            <span className="editorial-meta text-[9px] text-white/90 tracking-wide uppercase font-mono">
              VOCES DEL 20X10 Y SECRETOS DE PISTA
            </span>
          </div>
        );
      case 'opinion':
        return (
          <div className="flex items-center gap-2 py-1 px-2.5 bg-black/75 backdrop-blur-md border border-white/20 w-fit">
            <span className="editorial-meta text-[9px] text-[#F04E37] tracking-widest uppercase font-mono">
              DEBATE TÁCTICO:
            </span>
            <span className="editorial-meta text-[9px] text-white/90 tracking-wide uppercase font-mono">
              ANÁLISIS DE GEOMETRÍA Y VELOCIDAD
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section className="w-full border-b border-[var(--editorial-border)] bg-[var(--editorial-bg)] text-[var(--editorial-fg)] relative">
      {/* Cabecera de la sección */}
      <div className="py-12 px-6 md:px-12 border-b border-[var(--editorial-border)] flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="headline-large tracking-[-0.05em] leading-[0.89] lowercase">
            secciones del archivo.
          </h2>
        </div>
        <p className="text-xs text-[var(--editorial-muted)] font-editorial max-w-[36ch]">
          Seis ramas de cobertura analítica sincronizadas con telemetría en vivo de la FIP (padelapi.org) y el laboratorio de palas.
        </p>
      </div>

      {/* Grilla de 6 bloques grandes con separación entre sí */}
      <div className="p-6 md:p-12">
        {isReserved ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {mockSections.map((section, index) => (
              <div
                key={section.id}
                className="border border-dashed border-[var(--editorial-border)] p-6 min-h-[220px] md:min-h-[260px] flex flex-col justify-between bg-[var(--editorial-surface)]/25 text-left select-none"
              >
                <div className="flex justify-between items-start">
                  <span className="editorial-meta text-[11px] text-[var(--editorial-muted)]">
                    [{String(index + 1).padStart(2, '0')} / 06]
                  </span>
                  <span className="editorial-meta text-[9px] text-[var(--editorial-dim)] uppercase tracking-widest font-mono">
                    SECCIÓN {section.slug.toUpperCase()}
                  </span>
                </div>

                <div className="my-auto py-6 text-center">
                  <span className="editorial-meta text-[11px] text-[var(--editorial-muted)] tracking-[0.25em] block uppercase">
                    [ ESPACIO RESERVADO ]
                  </span>
                  <p className="text-xs text-[var(--editorial-dim)] font-editorial mt-1.5 lowercase">
                    {section.nombre}
                  </p>
                </div>

                <div className="flex justify-between items-center text-[10px] font-mono text-[var(--editorial-dim)] border-t border-dashed border-[var(--editorial-border)]/60 pt-3">
                  <span>MÓDULO DE COBERTURA</span>
                  <span>EN ESPERA TÉCNICA</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {mockSections.map((section, index) => (
              <div
                key={section.id}
                onClick={() => setActiveSection(section)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setActiveSection(section);
                  }
                }}
                className="editorial-card-group group relative min-h-[58vh] md:min-h-[66vh] flex flex-col justify-between p-8 overflow-hidden transition-colors border border-[var(--editorial-border)] cursor-pointer select-none text-left"
              >
                {/* 1. Fondo fotográfico con esquinas 100% rectas */}
                <div className="absolute inset-0 z-0">
                  <PhotoPlaceholder
                    description={section.fotoDescripcion}
                    ratio="full"
                    overlayOpacity={0.48}
                    contrast="medium"
                    className="w-full h-full"
                  />
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        'linear-gradient(180deg, rgba(10,10,10,0.6) 0%, rgba(10,10,10,0.25) 40%, rgba(10,10,10,0.95) 100%)',
                    }}
                  />
                </div>

                {/* 2. Metadatos superiores (esquinas) */}
                <div className="relative z-10 flex justify-between items-start text-white">
                  <span className="editorial-meta text-[11px] text-[#F04E37]">
                    [{String(index + 1).padStart(2, '0')} / 06]
                  </span>
                  <span className="editorial-meta text-[10px] text-white/80 bg-black/70 px-2 py-0.5 border border-white/10 uppercase tracking-widest">
                    {section.conteo} NOTAS
                  </span>
                </div>

                {/* 3. Contenido inferior: Micro-datos en vivo + Titular gigante en minúscula + flecha */}
                <div className="relative z-10 flex flex-col gap-4 text-white">
                  {/* Píldora de telemetría PadelAPI / FIP */}
                  {getSectionBadge(section.slug)}

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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL EDITORIAL AL CLICKEAR CUALQUIER SECCIÓN (Información oficial en vivo de PadelAPI) */}
      {activeSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[var(--editorial-bg)] border border-[var(--editorial-border)] p-6 sm:p-10 shadow-2xl flex flex-col gap-6 text-[var(--editorial-fg)] my-auto">
            {/* Header del modal */}
            <div className="flex items-start justify-between border-b border-[var(--editorial-border)] pb-4">
              <div className="flex flex-col gap-1">
                <span className="editorial-meta text-[11px] text-[#F04E37] tracking-[0.25em]">
                  [ ARCHIVO EDITORIAL // {activeSection.slug.toUpperCase()} ]
                </span>
                <h3 className="headline-medium lowercase text-[var(--editorial-fg)] leading-none">
                  {activeSection.nombre}
                </h3>
              </div>
              <button
                onClick={() => setActiveSection(null)}
                className="w-9 h-9 border border-[var(--editorial-border)] flex items-center justify-center hover:bg-[#F04E37] hover:text-white transition-colors"
                aria-label="Cerrar modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Contenido dinámico según la sección */}
            {activeSection.slug === 'circuito' || activeSection.slug === 'jugadores' ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between text-xs text-[var(--editorial-muted)] border-b border-[var(--editorial-border)] pb-2 font-mono">
                  <span>RANKING OFICIAL FIP (PADELAPI)</span>
                  <span>ACTUALIZADO: {telemetry.rankings.date}</span>
                </div>

                <div className="flex flex-col divide-y divide-[var(--editorial-border)]">
                  {telemetry.rankings.topPlayers.map((player) => (
                    <div key={`${player.ranking}-${player.name}`} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="w-6 font-mono font-bold text-[#F04E37]">
                          #{player.ranking}
                        </span>
                        <span className="font-bold text-[13px]">{player.name}</span>
                        <span className="editorial-meta text-[10px] px-1.5 py-0.2 border border-[var(--editorial-border)] bg-[var(--editorial-surface)]">
                          {player.country}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-[var(--editorial-fg)]">
                        {player.points.toLocaleString()} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : activeSection.slug === 'torneos' ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between text-xs text-[var(--editorial-muted)] border-b border-[var(--editorial-border)] pb-2 font-mono">
                  <span>CALENDARIO PREMIER PADEL & FIP TOUR</span>
                  <span>{telemetry.totalTournaments} TORNEOS OFICIALES</span>
                </div>

                {telemetry.nextTournament && (
                  <div className="p-4 bg-[var(--editorial-surface)] border border-[#F04E37]/40 flex flex-col gap-2">
                    <span className="editorial-meta text-[10px] text-[#F04E37] tracking-widest">
                      [ PRÓXIMA CITA EN PISTA ]
                    </span>
                    <h4 className="text-lg font-bold lowercase">{telemetry.nextTournament.name}</h4>
                    <div className="flex items-center gap-4 text-xs text-[var(--editorial-muted)] font-mono">
                      <span>SEDE: {telemetry.nextTournament.location}</span>
                      <span>FECHA: {telemetry.nextTournament.startDate}</span>
                      <span className="text-[#F04E37]">NIVEL: {telemetry.nextTournament.level}</span>
                    </div>
                  </div>
                )}

                <p className="text-xs text-[var(--editorial-muted)] font-editorial">
                  Las crónicas y resultados de cada eliminatoria se reflejan en tiempo real en el carrusel de noticias y el ticker superior.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 text-xs font-editorial text-[var(--editorial-muted)]">
                <p>{activeSection.subtitulo}</p>
                <p className="text-[var(--editorial-fg)] font-mono text-[11px]">
                  // Cobertura permanente Palantica Lab & Revista Editorial.
                </p>
              </div>
            )}

            {/* Footer del modal */}
            <div className="pt-4 border-t border-[var(--editorial-border)] flex justify-between items-center text-[10px] font-mono text-[var(--editorial-dim)]">
              <span>DATOS PROPORCIONADOS VÍA PADELAPI.ORG & NEWSDATA.IO</span>
              <button
                onClick={() => setActiveSection(null)}
                className="editorial-pill-btn bg-[var(--editorial-fg)] text-[var(--editorial-bg)] hover:bg-[#F04E37] hover:text-white"
              >
                <span>cerrar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
