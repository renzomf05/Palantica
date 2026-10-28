import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { padelfulApi } from '../../api/padelful';
import type { PadelfulPalaPreview, PadelfulFilterParams } from '../../types';
import { PadelfulRacketCard } from '../../components/palas/PadelfulRacketCard';
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Layers,
} from 'lucide-react';

const BRANDS = ['Todas', 'Nox', 'Bullpadel', 'Head', 'Babolat', 'Wilson', 'Adidas', 'Siux', 'Varlion', 'Starvie', 'Dunlop'];
const SHAPES = ['Todas', 'Lagrima', 'Diamante', 'Redonda'];
const HARDNESSES = ['Todas', 'Blanda', 'Media', 'Dura'];

export const CatalogoPadelfulPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('q') || '';
  const initialBrand = searchParams.get('marca') || 'Todas';

  const [rackets, setRackets] = useState<PadelfulPalaPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [search, setSearch] = useState(initialSearch);
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);
  const [selectedShape, setSelectedShape] = useState('Todas');
  const [selectedHardness, setSelectedHardness] = useState('Todas');
  const [sortBy, setSortBy] = useState<'rating' | 'potencia' | 'control' | 'precio_asc' | 'precio_desc'>('rating');
  const [showFilters, setShowFilters] = useState(false);

  // Sincronización con base de datos
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  // Paginación
  const [page, setPage] = useState(1);
  const pageSize = 9;

  // Cargar palas desde Padelful API
  const loadRackets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: PadelfulFilterParams = {
        limit: 50,
        offset: 0,
        brand: selectedBrand !== 'Todas' ? selectedBrand : undefined,
        shape: selectedShape !== 'Todas' ? selectedShape : undefined,
        query: search.trim() || undefined,
      };

      const data = await padelfulApi.getRackets(params);
      setRackets(data || []);
      setPage(1);
    } catch (err) {
      console.error('Error al consultar catálogo de Padelful:', err);
      setError('No se pudo conectar con el catálogo de Padelful. Por favor verifica que el backend esté en ejecución.');
    } finally {
      setLoading(false);
    }
  }, [selectedBrand, selectedShape, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadRackets();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadRackets]);

  // Scroll suave al inicio cada vez que se cambia de página en el catálogo
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  // Sincronizar catálogo a Supabase/PostgreSQL
  const handleSyncDatabase = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await padelfulApi.syncRackets({
        brand: selectedBrand !== 'Todas' ? selectedBrand : undefined,
        maxItems: 30,
        overwriteExisting: false,
      });
      setSyncResult(res.mensaje || `Sincronización completada: ${res.totalImportados} palas importadas.`);
      setTimeout(() => setSyncResult(null), 6000);
    } catch (err) {
      console.error('Error al sincronizar catálogo:', err);
      setSyncResult('Error al sincronizar con la base de datos.');
    } finally {
      setSyncing(false);
    }
  };

  // Filtrado y ordenamiento en cliente
  const filteredAndSortedRackets = useMemo(() => {
    let result = [...rackets];

    if (selectedHardness !== 'Todas') {
      result = result.filter((r) => r.durezaNivel.toLowerCase() === selectedHardness.toLowerCase());
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'potencia':
          return b.potenciaScore - a.potenciaScore;
        case 'control':
          return b.controlScore - a.controlScore;
        case 'precio_asc':
          return a.precio - b.precio;
        case 'precio_desc':
          return b.precio - a.precio;
        case 'rating':
        default:
          return b.puntuacionGeneral - a.puntuacionGeneral;
      }
    });

    return result;
  }, [rackets, selectedHardness, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedRackets.length / pageSize);
  const paginatedRackets = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredAndSortedRackets.slice(start, start + pageSize);
  }, [filteredAndSortedRackets, page, pageSize]);

  const resetFilters = () => {
    setSearch('');
    setSelectedBrand('Todas');
    setSelectedShape('Todas');
    setSelectedHardness('Todas');
    setSortBy('rating');
  };

  const activeFiltersCount =
    (selectedBrand !== 'Todas' ? 1 : 0) +
    (selectedShape !== 'Todas' ? 1 : 0) +
    (selectedHardness !== 'Todas' ? 1 : 0) +
    (search.trim() ? 1 : 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
      {/* Hero Header Estilo Palantica */}
      <div className="relative border-b border-white/10 bg-gradient-to-b from-zinc-900/90 via-zinc-950/80 to-zinc-950 px-4 pt-8 pb-10 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumbs y Tag */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Link to="/paletas" className="text-xs font-bold text-zinc-400 hover:text-white transition-colors">
                Paletas
              </Link>
              <span className="text-zinc-600">/</span>
              <span className="text-xs font-bold text-emerald-400">Padelful Live</span>
            </div>

            {/* Sincronizador a base de datos */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSyncDatabase}
                disabled={syncing}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all disabled:opacity-50"
              >
                <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
                <span>{syncing ? 'Sincronizando...' : 'Sincronizar a BD'}</span>
              </button>

              <Link
                to="/comparador"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold border border-white/10 transition-colors"
              >
                <Sparkles size={13} className="text-amber-400" />
                <span>Comparador Dual</span>
              </Link>
            </div>
          </div>

          {/* Banner de resultado de sincronización */}
          {syncResult && (
            <div className="mb-6 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
              <span>{syncResult}</span>
            </div>
          )}

          {/* Título Principal */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-black uppercase tracking-wider mb-2">
                <Sparkles size={12} />
                <span>Catálogo Técnico de Alta Fidelidad</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight m-0">
                Palas de Pádel <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Padelful</span>
              </h1>
              <p className="text-zinc-400 text-sm mt-2 max-w-2xl">
                Fotografías oficiales de alta resolución, radares biométricos y parámetros sensoriales de juego (potencia, control, salida y maniobrabilidad).
              </p>
            </div>

            {/* Contador dinámico */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-zinc-900/80 border border-white/10 self-start md:self-auto">
              <Layers size={18} className="text-emerald-400" />
              <div className="flex flex-col">
                <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Modelos</span>
                <span className="text-lg font-black text-white leading-tight">
                  {loading ? '...' : filteredAndSortedRackets.length} disponibles
                </span>
              </div>
            </div>
          </div>

          {/* Barra de Búsqueda y Filtros Rápidos */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por modelo, marca o jugador estrella (ej: Agustín Tapia, Vertex, Nox)..."
                className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-zinc-900/90 border border-white/10 text-white placeholder-zinc-500 text-sm outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowFilters((prev) => !prev)}
                className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl border font-bold text-sm transition-all ${
                  showFilters || activeFiltersCount > 0
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                    : 'bg-zinc-900 border-white/10 text-zinc-300 hover:text-white'
                }`}
              >
                <SlidersHorizontal size={16} />
                <span>Filtros</span>
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-zinc-950 text-xs font-black flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-full px-4 py-3.5 rounded-2xl bg-zinc-900 border border-white/10 text-zinc-200 text-sm font-bold outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="rating">Mayor Puntuación</option>
                <option value="potencia">Mayor Potencia</option>
                <option value="control">Mayor Control</option>
                <option value="precio_asc">Precio: Menor a Mayor</option>
                <option value="precio_desc">Precio: Mayor a Menor</option>
              </select>
            </div>
          </div>

          {/* Panel Desplegable de Filtros */}
          {showFilters && (
            <div className="mt-4 p-5 rounded-3xl bg-zinc-900/95 border border-white/10 backdrop-blur-xl animate-fade-in space-y-4">
              {/* Marcas */}
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 block mb-2">
                  Marca
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {BRANDS.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setSelectedBrand(b)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selectedBrand === b
                          ? 'bg-emerald-500 text-zinc-950 font-black shadow-md shadow-emerald-500/20'
                          : 'bg-zinc-800/80 text-zinc-400 hover:text-white border border-white/5'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
                {/* Formas */}
                <div>
                  <label className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 block mb-2">
                    Forma de Cabeza
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {SHAPES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedShape(s)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          selectedShape === s
                            ? 'bg-emerald-500 text-zinc-950 font-black'
                            : 'bg-zinc-800/80 text-zinc-400 hover:text-white border border-white/5'
                        }`}
                      >
                        {s === 'Lagrima' ? 'Lágrima' : s === 'Diamante' ? 'Diamante' : s === 'Redonda' ? 'Redonda' : 'Todas'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dureza */}
                <div>
                  <label className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 block mb-2">
                    Tacto de Goma
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {HARDNESSES.map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setSelectedHardness(h)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          selectedHardness === h
                            ? 'bg-emerald-500 text-zinc-950 font-black'
                            : 'bg-zinc-800/80 text-zinc-400 hover:text-white border border-white/5'
                        }`}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Botón limpiar */}
              <div className="flex justify-end pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-emerald-400 font-bold transition-colors"
                >
                  <RotateCcw size={13} />
                  <span>Restablecer Filtros</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid de Paletas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Mensaje de Error */}
        {error && (
          <div className="p-6 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-start gap-3 mb-8">
            <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block text-red-200">No se pudo cargar el catálogo</strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-96 rounded-3xl bg-zinc-900 border border-white/5 animate-pulse flex flex-col p-6"
              >
                <div className="h-44 bg-zinc-800 rounded-2xl mb-4" />
                <div className="h-4 w-24 bg-zinc-800 rounded mb-2" />
                <div className="h-6 w-48 bg-zinc-800 rounded mb-4" />
                <div className="h-12 bg-zinc-800/50 rounded-xl mt-auto" />
              </div>
            ))}
          </div>
        ) : paginatedRackets.length === 0 ? (
          /* Estado Vacío */
          <div className="p-16 text-center rounded-3xl bg-zinc-900/50 border border-dashed border-white/10 flex flex-col items-center gap-3 my-8">
            <Layers size={48} className="text-zinc-500" />
            <h2 className="text-xl font-bold text-white m-0">No se encontraron palas de Padelful</h2>
            <p className="text-zinc-400 text-sm max-w-md">
              Prueba a suavizar los filtros de marca o busca por un término más general.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-2 px-6 py-2.5 rounded-full bg-emerald-500 text-zinc-950 font-extrabold text-xs hover:bg-emerald-400 transition-colors"
            >
              Restablecer Filtros
            </button>
          </div>
        ) : (
          /* Listado de Tarjetas */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedRackets.map((racket) => (
              <PadelfulRacketCard key={racket.slug} racket={racket} />
            ))}
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-center gap-2 pt-10">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-10 h-10 rounded-full flex items-center justify-center border border-white/10 bg-zinc-900 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="text-xs font-bold text-zinc-400 px-4">
              Página <strong className="text-white">{page}</strong> de <strong className="text-white">{totalPages}</strong>
            </span>

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-10 h-10 rounded-full flex items-center justify-center border border-white/10 bg-zinc-900 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogoPadelfulPage;
