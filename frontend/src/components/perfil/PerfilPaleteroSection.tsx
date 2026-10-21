import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { paleteroApi } from '../../api/paletero';
import type { MiPaleteroGrouped, PaleteroItem } from '../../types';
import { PerfilPaletaCard } from './PerfilPaletaCard';
import { Skeleton } from '../ui/Skeleton';
import { Briefcase, Plus, ArrowRight, PackageOpen } from 'lucide-react';

type TabKey = 'usandoActualmente' | 'enElPaletero' | 'palasQueTuve' | 'palasQueQuiero';

interface TabConfig {
  key: TabKey;
  label: string;
  emoji: string;
  categoriaNombre: string;
}

const TABS: TabConfig[] = [
  {
    key: 'usandoActualmente',
    label: 'Usando actualmente',
    emoji: '🎾',
    categoriaNombre: 'Usando actualmente',
  },
  {
    key: 'enElPaletero',
    label: 'En el paletero',
    emoji: '🎒',
    categoriaNombre: 'En el paletero',
  },
  {
    key: 'palasQueTuve',
    label: 'Palas que tuve',
    emoji: '📜',
    categoriaNombre: 'Palas que tuve',
  },
  {
    key: 'palasQueQuiero',
    label: 'Palas que quiero',
    emoji: '✨',
    categoriaNombre: 'Palas que quiero',
  },
];

interface PerfilPaleteroSectionProps {
  onPaleteroUpdate?: (totalCount: number) => void;
}

export const PerfilPaleteroSection: React.FC<PerfilPaleteroSectionProps> = ({ onPaleteroUpdate }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('usandoActualmente');
  const [paletero, setPaletero] = useState<MiPaleteroGrouped | null>(null);
  const [loading, setLoading] = useState(true);

  const cargarPaletero = useCallback(async () => {
    try {
      setLoading(true);
      const data = await paleteroApi.getMiPaletero();
      setPaletero(data);

      const total =
        (data.usandoActualmente?.length || 0) +
        (data.enElPaletero?.length || 0) +
        (data.palasQueTuve?.length || 0) +
        (data.palasQueQuiero?.length || 0);

      onPaleteroUpdate?.(total);
    } catch (err) {
      console.error('Error al cargar paletero en perfil:', err);
    } finally {
      setLoading(false);
    }
  }, [onPaleteroUpdate]);

  useEffect(() => {
    cargarPaletero();
  }, [cargarPaletero]);

  const handleEliminarPala = async (palaId: number, categoria: string) => {
    await paleteroApi.removeItem(palaId, categoria);

    // Actualización optimista del estado local
    setPaletero((prev) => {
      if (!prev) return prev;
      const updated: MiPaleteroGrouped = {
        usandoActualmente: prev.usandoActualmente.filter((p) => !(p.palaId === palaId && p.categoria === categoria)),
        enElPaletero: prev.enElPaletero.filter((p) => !(p.palaId === palaId && p.categoria === categoria)),
        palasQueTuve: prev.palasQueTuve.filter((p) => !(p.palaId === palaId && p.categoria === categoria)),
        palasQueQuiero: prev.palasQueQuiero.filter((p) => !(p.palaId === palaId && p.categoria === categoria)),
      };

      const newTotal =
        updated.usandoActualmente.length +
        updated.enElPaletero.length +
        updated.palasQueTuve.length +
        updated.palasQueQuiero.length;
      onPaleteroUpdate?.(newTotal);

      return updated;
    });
  };

  const currentItems: PaleteroItem[] = paletero ? paletero[activeTab] || [] : [];

  return (
    <section className="bg-[var(--bg-surface)] border border-white/10 rounded-3xl p-5 sm:p-7 shadow-lg flex flex-col gap-6">
      {/* Cabecera del Paletero */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-lime-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Briefcase size={20} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight m-0">
              Mi Paletero
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 m-0 mt-0.5">
              Gestioná tus palas activas, equipamiento de pista e historial de raquetas.
            </p>
          </div>
        </div>

        <Link
          to="/paletero"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors self-start sm:self-auto"
        >
          <span>Vista Completa</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Pestañas Horizontales con Badges Numéricos (Las 4 opciones) */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const count = paletero ? paletero[tab.key]?.length || 0 : 0;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap active:scale-95 ${
                isActive
                  ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20 font-black'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-white/5'
              }`}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-[11px] font-black ${
                  isActive
                    ? 'bg-zinc-950/20 text-zinc-950'
                    : 'bg-white/10 text-zinc-300'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid de Palas o Estado Vacío */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton height="150px" borderRadius="1rem" />
          <Skeleton height="150px" borderRadius="1rem" />
          <Skeleton height="150px" borderRadius="1rem" />
        </div>
      ) : currentItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          {currentItems.map((item) => (
            <PerfilPaletaCard
              key={`${item.id}-${item.palaId}`}
              item={item}
              onEliminar={handleEliminarPala}
            />
          ))}
        </div>
      ) : (
        /* Estado Vacío cuando no hay palas en el compartimento */
        <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-white/10 bg-zinc-900/40 gap-3 animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 flex items-center justify-center text-zinc-500">
            <PackageOpen size={24} />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-zinc-300 m-0">
              No tenés palas en "{TABS.find((t) => t.key === activeTab)?.label}"
            </h4>
            <p className="text-xs text-zinc-500 m-0 mt-1 max-w-sm">
              Podés explorar el catálogo técnico y agregar cualquier pala a tu paletero con un click.
            </p>
          </div>
          <Link
            to="/paletas"
            className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-xs transition-colors"
          >
            <Plus size={14} />
            <span>Explorar Paletas</span>
          </Link>
        </div>
      )}
    </section>
  );
};
