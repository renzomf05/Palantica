import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { paleteroApi } from '../../api/paletero';
import type { MiPaleteroGrouped, PaleteroItem } from '../../types';
import { PerfilPaletaCard } from './PerfilPaletaCard';
import { Skeleton } from '../ui/Skeleton';
import {
  Briefcase,
  Flame,
  ThumbsUp,
  ThumbsDown,
  PackageOpen,
  ArrowRight,
  Plus,
} from 'lucide-react';

type TabKey =
  | 'usandoActualmente'
  | 'palasQueMeGustaron'
  | 'palasQueNoMeGustaron'
  | 'enElPaletero';

interface TabConfig {
  key: TabKey;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const TABS: TabConfig[] = [
  {
    key: 'usandoActualmente',
    label: 'Usando actualmente',
    icon: Flame,
  },
  {
    key: 'palasQueMeGustaron',
    label: 'Me gustaron',
    icon: ThumbsUp,
  },
  {
    key: 'palasQueNoMeGustaron',
    label: 'No me gustaron',
    icon: ThumbsDown,
  },
  {
    key: 'enElPaletero',
    label: 'En el paletero',
    icon: Briefcase,
  },
];

interface PerfilPaleteroSectionProps {
  onPaleteroUpdate?: (totalCount: number) => void;
}

export const PerfilPaleteroSection: React.FC<PerfilPaleteroSectionProps> = ({
  onPaleteroUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('usandoActualmente');
  const [paletero, setPaletero] = useState<MiPaleteroGrouped | null>(null);
  const [loading, setLoading] = useState(true);

  // Mantener referencia estable al callback del padre para evitar re-renders cíclicos
  const onPaleteroUpdateRef = useRef(onPaleteroUpdate);
  useEffect(() => {
    onPaleteroUpdateRef.current = onPaleteroUpdate;
  }, [onPaleteroUpdate]);

  // Cargar datos exactamente una sola vez al montar
  useEffect(() => {
    let isMounted = true;

    const cargar = async () => {
      setLoading(true);
      try {
        const data = await paleteroApi.getMiPaletero();
        if (!isMounted) return;
        setPaletero(data);

        const total =
          (data.usandoActualmente?.length || 0) +
          (data.palasQueMeGustaron?.length || 0) +
          (data.palasQueNoMeGustaron?.length || 0) +
          (data.enElPaletero?.length || 0);

        onPaleteroUpdateRef.current?.(total);
      } catch (err) {
        console.error('Error al cargar paletero en perfil:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    cargar();

    return () => {
      isMounted = false;
    };
  }, []);

  // Borrado optimista de pala
  const handleEliminarPala = useCallback(async (palaId: number, categoria: string) => {
    await paleteroApi.removeItem(palaId, categoria);

    setPaletero((prev) => {
      if (!prev) return prev;
      const matchItem = (p: PaleteroItem) =>
        (Number(p.palaId) === Number(palaId) || Number(p.id) === Number(palaId)) &&
        p.categoria.toLowerCase() === categoria.toLowerCase();

      const updated: MiPaleteroGrouped = {
        usandoActualmente: prev.usandoActualmente.filter((p) => !matchItem(p)),
        palasQueMeGustaron: prev.palasQueMeGustaron.filter((p) => !matchItem(p)),
        palasQueNoMeGustaron: prev.palasQueNoMeGustaron.filter((p) => !matchItem(p)),
        palasQueQuiero: (prev.palasQueQuiero || []).filter((p) => !matchItem(p)),
        palasQueTuve: (prev.palasQueTuve || []).filter((p) => !matchItem(p)),
        enElPaletero: prev.enElPaletero.filter((p) => !matchItem(p)),
      };

      const newTotal =
        updated.usandoActualmente.length +
        updated.palasQueMeGustaron.length +
        updated.palasQueNoMeGustaron.length +
        updated.enElPaletero.length;

      setTimeout(() => onPaleteroUpdateRef.current?.(newTotal), 0);
      return updated;
    });
  }, []);

  // Obtener ítems de la pestaña actual (sin reinyección fantasma)
  const effectiveItems: PaleteroItem[] = useMemo(() => {
    return paletero ? [...(paletero[activeTab] || [])] : [];
  }, [paletero, activeTab]);

  // Conteo real por pestaña
  const getTabCount = (tabKey: TabKey) => {
    return paletero ? paletero[tabKey]?.length || 0 : 0;
  };

  return (
    <section className="bg-[var(--bg-surface)] border border-zinc-200 dark:border-white/10 rounded-3xl p-5 sm:p-7 shadow-lg flex flex-col gap-6 transition-colors">
      {/* Cabecera del Paletero */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-lime-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Briefcase size={20} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight m-0">
              Mi Paletero
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 m-0 mt-0.5">
              Gestioná tus palas activas, equipamiento de pista e historial de raquetas.
            </p>
          </div>
        </div>

        <Link
          to="/paletas"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline self-start sm:self-auto"
        >
          <span>Buscar más palas</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Pestañas Horizontales: 4 opciones limpias, sin emojis y con iconos vectoriales */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          const count = getTabCount(tab.key);

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap active:scale-95 ${
                isActive
                  ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20 font-black'
                  : 'bg-[var(--bg-card-subtle)] text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 border border-zinc-200 dark:border-white/5'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-[11px] font-black ${
                  isActive
                    ? 'bg-zinc-950/20 text-zinc-950'
                    : 'bg-zinc-200 dark:bg-white/10 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid de Palas Visual: Únicamente la imagen de cada pala */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          <Skeleton height="220px" borderRadius="1rem" />
          <Skeleton height="220px" borderRadius="1rem" />
          <Skeleton height="220px" borderRadius="1rem" />
          <Skeleton height="220px" borderRadius="1rem" />
        </div>
      ) : effectiveItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 animate-fade-in">
          {effectiveItems.map((item) => (
            <PerfilPaletaCard
              key={`${item.id}-${item.palaId}-${item.categoria}`}
              item={item}
              onEliminar={handleEliminarPala}
            />
          ))}
        </div>
      ) : (
        /* Estado Vacío cuando no hay palas en el compartimento */
        <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-zinc-300 dark:border-white/10 bg-[var(--bg-card-subtle)] gap-3 animate-fade-in transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
            <PackageOpen size={24} />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-[var(--text-primary)] m-0">
              No tenés palas en "{TABS.find((t) => t.key === activeTab)?.label}"
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 m-0 mt-1 max-w-sm">
              Podés explorar el catálogo técnico y agregar cualquier pala a tu paletero con un click.
            </p>
          </div>
          <Link
            to="/paletas"
            className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs transition-colors"
          >
            <Plus size={14} />
            <span>Explorar Paletas</span>
          </Link>
        </div>
      )}
    </section>
  );
};
