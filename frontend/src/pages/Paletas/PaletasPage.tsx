import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { palasApi } from '../../api/palas';
import type { Pala, Marca, PalaFilterParams } from '../../types';
import {
  SlidersHorizontal,
  X,
  Star,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown
} from 'lucide-react';

export const PaletasPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const setSearch = (val: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val) next.set('search', val);
      else next.delete('search');
      return next;
    });
  };

  const selectedMarca = searchParams.get('marca') || '';
  const setSelectedMarca = (val: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val) next.set('marca', val);
      else next.delete('marca');
      return next;
    });
  };

  const [palas, setPalas] = useState<Pala[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [selectedForma, setSelectedForma] = useState('');
  const [selectedBalance, setSelectedBalance] = useState('');
  const [selectedDureza, setSelectedDureza] = useState('');
  const [selectedNivel, setSelectedNivel] = useState('');
  const [selectedNucleo, setSelectedNucleo] = useState('');
  const [selectedMaterialCara, setSelectedMaterialCara] = useState('');
  const [selectedAno, setSelectedAno] = useState<number | ''>('');
  const [selectedGenero, setSelectedGenero] = useState('');
  const [precioMax, setPrecioMax] = useState<number>(450);
  const [pesoRango, setPesoRango] = useState<string>('');
  const [orderBy, setOrderBy] = useState<'novedad' | 'puntuacion' | 'populares' | 'precio_asc' | 'precio_desc'>('puntuacion');

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);

  // Cargar marcas
  useEffect(() => {
    async function loadMarcas() {
      try {
        const data = await palasApi.getMarcas();
        setMarcas(data);
      } catch (err) {
        console.error('Error cargando marcas:', err);
      }
    }
    loadMarcas();
  }, []);

  // Cargar palas
  const loadPalas = useCallback(async () => {
    setLoading(true);
    try {
      const filterParams: PalaFilterParams = {
        search: search.trim() || undefined,
        marca: selectedMarca || undefined,
        forma: selectedForma || undefined,
        orderBy,
        page: 1,
        pageSize: 50,
      };

      const response = await palasApi.getPalas(filterParams);
      if (response && response.items && response.items.length > 0) {
        setPalas(response.items);
      } else {
        // Fallback enriquecido de palas si la base de datos está vacía o sin datos
        setPalas(mockPalasFallback);
      }
    } catch (err) {
      console.error('Error cargando catálogo de palas:', err);
      setPalas(mockPalasFallback);
    } finally {
      setLoading(false);
    }
  }, [search, selectedMarca, selectedForma, orderBy]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPalas();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadPalas]);

  // Filtrado exhaustivo por distintivos en memoria
  const filteredPalas = useMemo(() => {
    return palas.filter((pala) => {
      // Búsqueda por texto (nombre, marca, jugador)
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = pala.modelo.toLowerCase().includes(query);
        const matchesBrand = pala.marcaNombre.toLowerCase().includes(query);
        const matchesPlayer = pala.jugadorPro?.toLowerCase().includes(query);
        if (!matchesName && !matchesBrand && !matchesPlayer) return false;
      }

      // Marca
      if (selectedMarca && pala.marcaNombre.toLowerCase() !== selectedMarca.toLowerCase()) {
        return false;
      }

      // Forma
      if (selectedForma && pala.forma.toLowerCase() !== selectedForma.toLowerCase()) {
        return false;
      }

      // Balance
      if (selectedBalance) {
        const balanceMm = pala.balanceMm || 265;
        if (selectedBalance === 'Bajo' && balanceMm > 260) return false;
        if (selectedBalance === 'Medio' && (balanceMm <= 260 || balanceMm > 270)) return false;
        if (selectedBalance === 'Alto' && balanceMm <= 270) return false;
      }

      // Dureza
      if (selectedDureza) {
        const dureza = pala.durezaPromedio || 6;
        if (selectedDureza === 'Blanda' && dureza > 5.5) return false;
        if (selectedDureza === 'Media' && (dureza <= 5.5 || dureza > 7.5)) return false;
        if (selectedDureza === 'Dura' && dureza <= 7.5) return false;
      }

      // Peso
      if (pesoRango) {
        const pMin = pala.pesoMin || 360;
        const pMax = pala.pesoMax || 375;
        if (pesoRango === 'Ligero' && pMin >= 360) return false;
        if (pesoRango === 'Estándar' && (pMin < 360 || pMax > 375)) return false;
        if (pesoRango === 'Pesado' && pMax <= 375) return false;
      }

      // Nivel de juego
      if (selectedNivel) {
        const nivel = pala.nivelJuego?.toLowerCase() || 'avanzado';
        if (!nivel.includes(selectedNivel.toLowerCase())) return false;
      }

      // Núcleo / Goma
      if (selectedNucleo) {
        const nucleo = pala.materialNucleo?.toLowerCase() || '';
        if (!nucleo.includes(selectedNucleo.toLowerCase())) return false;
      }

      // Material Caras
      if (selectedMaterialCara) {
        const caras = pala.materialCaras?.toLowerCase() || '';
        if (!caras.includes(selectedMaterialCara.toLowerCase())) return false;
      }

      // Año de lanzamiento
      if (selectedAno && pala.anoLanzamiento !== selectedAno) {
        return false;
      }

      // Género
      if (selectedGenero && pala.genero && pala.genero.toLowerCase() !== selectedGenero.toLowerCase()) {
        return false;
      }

      // Precio
      if (pala.precioReferencia && pala.precioReferencia > precioMax) {
        return false;
      }

      return true;
    });
  }, [
    palas,
    search,
    selectedMarca,
    selectedForma,
    selectedBalance,
    selectedDureza,
    pesoRango,
    selectedNivel,
    selectedNucleo,
    selectedMaterialCara,
    selectedAno,
    selectedGenero,
    precioMax,
  ]);

  // Ordenamiento de resultados
  const sortedPalas = useMemo(() => {
    const list = [...filteredPalas];
    switch (orderBy) {
      case 'novedad':
        return list.sort((a, b) => (b.anoLanzamiento || 2026) - (a.anoLanzamiento || 2026));
      case 'puntuacion':
        return list.sort((a, b) => (b.puntuacionGeneral || 0) - (a.puntuacionGeneral || 0));
      case 'populares':
        return list.sort((a, b) => (b.totalResenas || 0) - (a.totalResenas || 0));
      case 'precio_asc':
        return list.sort((a, b) => (a.precioReferencia || 0) - (b.precioReferencia || 0));
      case 'precio_desc':
        return list.sort((a, b) => (b.precioReferencia || 0) - (a.precioReferencia || 0));
      default:
        return list;
    }
  }, [filteredPalas, orderBy]);

  // Paginación
  const totalPages = Math.ceil(sortedPalas.length / pageSize) || 1;
  const paginatedPalas = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedPalas.slice(start, start + pageSize);
  }, [sortedPalas, page, pageSize]);

  // Reset de todos los filtros
  const handleClearFilters = () => {
    setSearch('');
    setSelectedMarca('');
    setSelectedForma('');
    setSelectedBalance('');
    setSelectedDureza('');
    setSelectedNivel('');
    setSelectedNucleo('');
    setSelectedMaterialCara('');
    setSelectedAno('');
    setSelectedGenero('');
    setPrecioMax(450);
    setPesoRango('');
    setOrderBy('puntuacion');
    setPage(1);
    setSearchParams({});
  };

  // Contar filtros activos
  const activeFiltersCount = [
    selectedMarca,
    selectedForma,
    selectedBalance,
    selectedDureza,
    pesoRango,
    selectedNivel,
    selectedNucleo,
    selectedMaterialCara,
    selectedAno,
    selectedGenero,
    precioMax < 450 ? precioMax : null,
  ].filter(Boolean).length;

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in pb-16">
      {/* Encabezado Principal Swiss de la Sección PALETAS */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-2">
            <Sparkles size={13} />
            <span>Enciclopedia Técnica</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white m-0">
            Catálogo de Paletas
          </h1>
          <p className="text-zinc-400 text-sm mt-1 max-w-xl">
            Explora las características distintivas de cada modelo: dureza de tacto, balance, peso, trenzado de carbono y núcleo térmico.
          </p>
        </div>

        {/* Contador y Orden */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            {sortedPalas.length} {sortedPalas.length === 1 ? 'Paleta' : 'Paletas'}
          </span>

          <div className="flex items-center gap-1.5 bg-zinc-900 border border-white/10 rounded-2xl px-3 py-2 text-xs font-bold text-white">
            <ArrowUpDown size={14} className="text-emerald-400" />
            <select
              value={orderBy}
              onChange={(e) => {
                setOrderBy(e.target.value as 'novedad' | 'puntuacion' | 'populares' | 'precio_asc' | 'precio_desc');
                setPage(1);
              }}
              className="bg-transparent outline-none text-white cursor-pointer"
            >
              <option value="puntuacion" className="bg-zinc-900">Mejor calificadas</option>
              <option value="novedad" className="bg-zinc-900">Más nuevas</option>
              <option value="populares" className="bg-zinc-900">Más populares</option>
              <option value="precio_asc" className="bg-zinc-900">Precio: Menor a Mayor</option>
              <option value="precio_desc" className="bg-zinc-900">Precio: Mayor a Menor</option>
            </select>
          </div>

          {/* Botón de filtros móvil */}
          <button
            type="button"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-emerald-500 text-zinc-950 font-bold text-xs"
          >
            <SlidersHorizontal size={14} />
            <span>Filtros ({activeFiltersCount})</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros Activos Removibles */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-zinc-900/60 border border-white/10">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider mr-1">
            Filtros activos:
          </span>

          {selectedMarca && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-800 text-white border border-white/15">
              Marca: {selectedMarca}
              <button type="button" onClick={() => setSelectedMarca('')}>
                <X size={12} className="hover:text-emerald-400" />
              </button>
            </span>
          )}

          {selectedForma && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-800 text-white border border-white/15">
              Forma: {selectedForma}
              <button type="button" onClick={() => setSelectedForma('')}>
                <X size={12} className="hover:text-emerald-400" />
              </button>
            </span>
          )}

          {selectedBalance && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-800 text-white border border-white/15">
              Balance: {selectedBalance}
              <button type="button" onClick={() => setSelectedBalance('')}>
                <X size={12} className="hover:text-emerald-400" />
              </button>
            </span>
          )}

          {selectedDureza && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-800 text-white border border-white/15">
              Dureza: {selectedDureza}
              <button type="button" onClick={() => setSelectedDureza('')}>
                <X size={12} className="hover:text-emerald-400" />
              </button>
            </span>
          )}

          {pesoRango && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-800 text-white border border-white/15">
              Peso: {pesoRango}
              <button type="button" onClick={() => setPesoRango('')}>
                <X size={12} className="hover:text-emerald-400" />
              </button>
            </span>
          )}

          {selectedNivel && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-800 text-white border border-white/15">
              Nivel: {selectedNivel}
              <button type="button" onClick={() => setSelectedNivel('')}>
                <X size={12} className="hover:text-emerald-400" />
              </button>
            </span>
          )}

          {selectedMaterialCara && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-800 text-white border border-white/15">
              Caras: {selectedMaterialCara}
              <button type="button" onClick={() => setSelectedMaterialCara('')}>
                <X size={12} className="hover:text-emerald-400" />
              </button>
            </span>
          )}

          {selectedNucleo && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-800 text-white border border-white/15">
              Núcleo: {selectedNucleo}
              <button type="button" onClick={() => setSelectedNucleo('')}>
                <X size={12} className="hover:text-emerald-400" />
              </button>
            </span>
          )}

          {selectedAno && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-800 text-white border border-white/15">
              Año: {selectedAno}
              <button type="button" onClick={() => setSelectedAno('')}>
                <X size={12} className="hover:text-emerald-400" />
              </button>
            </span>
          )}

          {precioMax < 450 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-800 text-white border border-white/15">
              Hasta ${precioMax}
              <button type="button" onClick={() => setPrecioMax(450)}>
                <X size={12} className="hover:text-emerald-400" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={handleClearFilters}
            className="text-xs font-bold text-rose-400 hover:text-rose-300 ml-auto flex items-center gap-1"
          >
            <RotateCcw size={12} />
            <span>Limpiar todos</span>
          </button>
        </div>
      )}

      {/* LAYOUT: Barra lateral de distintivos + Grilla de resultados */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SIDEBAR DE FILTROS POR DISTINTIVOS (3 columnas en desktop) */}
        <aside
          className={`lg:col-span-3 lg:block flex-col gap-6 p-5 rounded-3xl bg-[var(--bg-surface)] border border-white/10 shadow-xl ${
            showMobileFilters ? 'block' : 'hidden'
          }`}
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-emerald-400" />
              <h2 className="text-sm font-black tracking-tight text-white uppercase m-0">
                Filtros por Distintivos
              </h2>
            </div>
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs font-bold text-zinc-400 hover:text-white"
              >
                Reset
              </button>
            )}
          </div>

          <div className="flex flex-col gap-5 text-xs">
            {/* 1. Marca */}
            <div>
              <label className="font-extrabold text-zinc-300 uppercase tracking-wider block mb-2">
                Marca
              </label>
              <select
                value={selectedMarca}
                onChange={(e) => setSelectedMarca(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-zinc-900 border border-white/10 text-white outline-none focus:border-emerald-500"
              >
                <option value="">Todas las marcas</option>
                {marcas.length > 0
                  ? marcas.map((m) => (
                      <option key={m.id} value={m.nombre}>
                        {m.nombre} ({m.totalPalas || 0})
                      </option>
                    ))
                  : ['Bullpadel', 'Nox', 'Siux', 'Babolat', 'Head', 'Adidas', 'Wilson', 'Varlion'].map(
                      (m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      )
                    )}
              </select>
            </div>

            {/* 2. Forma de la cabeza */}
            <div>
              <label className="font-extrabold text-zinc-300 uppercase tracking-wider block mb-2">
                Forma de la Pala
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {['Redonda', 'Lagrima', 'Diamante'].map((forma) => {
                  const isSel = selectedForma.toLowerCase() === forma.toLowerCase();
                  return (
                    <button
                      key={forma}
                      type="button"
                      onClick={() => setSelectedForma(isSel ? '' : forma)}
                      className={`py-2 px-1 rounded-xl text-center font-bold text-xs transition-all ${
                        isSel
                          ? 'bg-emerald-500 text-zinc-950 font-black shadow-sm'
                          : 'bg-zinc-900 text-zinc-400 border border-white/5 hover:text-white'
                      }`}
                    >
                      {forma === 'Lagrima' ? 'Lágrima' : forma}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Balance */}
            <div>
              <label className="font-extrabold text-zinc-300 uppercase tracking-wider block mb-2">
                Balance (Punto de gravedad)
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {['Bajo', 'Medio', 'Alto'].map((b) => {
                  const isSel = selectedBalance === b;
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setSelectedBalance(isSel ? '' : b)}
                      className={`py-2 px-1 rounded-xl text-center font-bold text-xs transition-all ${
                        isSel
                          ? 'bg-emerald-500 text-zinc-950 font-black shadow-sm'
                          : 'bg-zinc-900 text-zinc-400 border border-white/5 hover:text-white'
                      }`}
                    >
                      {b}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Dureza del tacto */}
            <div>
              <label className="font-extrabold text-zinc-300 uppercase tracking-wider block mb-2">
                Dureza de Tacto
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {['Blanda', 'Media', 'Dura'].map((d) => {
                  const isSel = selectedDureza === d;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSelectedDureza(isSel ? '' : d)}
                      className={`py-2 px-1 rounded-xl text-center font-bold text-xs transition-all ${
                        isSel
                          ? 'bg-emerald-500 text-zinc-950 font-black shadow-sm'
                          : 'bg-zinc-900 text-zinc-400 border border-white/5 hover:text-white'
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Nivel de Juego */}
            <div>
              <label className="font-extrabold text-zinc-300 uppercase tracking-wider block mb-2">
                Nivel Recomendado
              </label>
              <select
                value={selectedNivel}
                onChange={(e) => setSelectedNivel(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-zinc-900 border border-white/10 text-white outline-none focus:border-emerald-500"
              >
                <option value="">Cualquier nivel</option>
                <option value="Principiante">Iniciación / Principiante</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
                <option value="Profesional">Competición / Profesional</option>
              </select>
            </div>

            {/* 6. Material de las caras */}
            <div>
              <label className="font-extrabold text-zinc-300 uppercase tracking-wider block mb-2">
                Material de las Caras
              </label>
              <select
                value={selectedMaterialCara}
                onChange={(e) => setSelectedMaterialCara(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-zinc-900 border border-white/10 text-white outline-none focus:border-emerald-500"
              >
                <option value="">Todos los materiales</option>
                <option value="3K">Carbono 3K</option>
                <option value="12K">Carbono 12K</option>
                <option value="18K">Carbono 18K</option>
                <option value="24K">Carbono 24K</option>
                <option value="Vidrio">Fibra de Vidrio (Fiberglass)</option>
              </select>
            </div>

            {/* 7. Núcleo / Goma */}
            <div>
              <label className="font-extrabold text-zinc-300 uppercase tracking-wider block mb-2">
                Núcleo / Espuma
              </label>
              <select
                value={selectedNucleo}
                onChange={(e) => setSelectedNucleo(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-zinc-900 border border-white/10 text-white outline-none focus:border-emerald-500"
              >
                <option value="">Todas las gomas</option>
                <option value="EVA Soft">EVA Soft (Gran salida)</option>
                <option value="Black EVA">Black EVA (Firmeza y potencia)</option>
                <option value="MultiEVA">MultiEVA (Doble densidad)</option>
                <option value="Foam">Foam / Polietileno (Confort brazo)</option>
              </select>
            </div>

            {/* 8. Rango de Peso */}
            <div>
              <label className="font-extrabold text-zinc-300 uppercase tracking-wider block mb-2">
                Rango de Peso
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: 'Ligero', desc: '<360g', id: 'Ligero' },
                  { label: 'Medio', desc: '360-375g', id: 'Estándar' },
                  { label: 'Pesado', desc: '>375g', id: 'Pesado' },
                ].map((item) => {
                  const isSel = pesoRango === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPesoRango(isSel ? '' : item.id)}
                      className={`p-2 rounded-xl text-center font-bold text-xs transition-all ${
                        isSel
                          ? 'bg-emerald-500 text-zinc-950 font-black shadow-sm'
                          : 'bg-zinc-900 text-zinc-400 border border-white/5 hover:text-white'
                      }`}
                    >
                      <div>{item.label}</div>
                      <div className="text-[10px] opacity-75 font-normal">{item.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 9. Año de Lanzamiento */}
            <div>
              <label className="font-extrabold text-zinc-300 uppercase tracking-wider block mb-2">
                Año de Lanzamiento
              </label>
              <div className="flex items-center gap-2">
                {[2026, 2025, 2024].map((ano) => {
                  const isSel = selectedAno === ano;
                  return (
                    <button
                      key={ano}
                      type="button"
                      onClick={() => setSelectedAno(isSel ? '' : ano)}
                      className={`flex-1 py-1.5 rounded-xl text-center font-bold text-xs transition-all ${
                        isSel
                          ? 'bg-emerald-500 text-zinc-950 font-black shadow-sm'
                          : 'bg-zinc-900 text-zinc-400 border border-white/5 hover:text-white'
                      }`}
                    >
                      {ano}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 10. Rango de Precio */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-extrabold text-zinc-300 uppercase tracking-wider">
                  Precio Máximo
                </label>
                <span className="font-bold text-emerald-400 text-xs">${precioMax}</span>
              </div>
              <input
                type="range"
                min="100"
                max="450"
                step="10"
                value={precioMax}
                onChange={(e) => setPrecioMax(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        </aside>

        {/* GRILLA DE RESULTADOS (9 columnas en desktop) */}
        <main className="lg:col-span-9 flex flex-col gap-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[420px] rounded-3xl skeleton border border-white/5"
                />
              ))}
            </div>
          ) : paginatedPalas.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[var(--bg-surface)] border border-dashed border-white/10 flex flex-col items-center gap-3">
              <span className="text-4xl">🎾</span>
              <h2 className="text-xl font-bold text-white m-0">
                No se encontraron paletas con estos distintivos
              </h2>
              <p className="text-zinc-400 text-sm max-w-md">
                Prueba a suavizar los filtros de dureza, marca o forma para ver más resultados del catálogo.
              </p>
              <button
                type="button"
                onClick={handleClearFilters}
                className="mt-2 px-5 py-2 rounded-full bg-emerald-500 text-zinc-950 font-extrabold text-xs"
              >
                Restablecer todos los filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedPalas.map((pala) => (
                <Link
                  key={pala.id}
                  to={`/paletas/${pala.id}`}
                  className="group relative rounded-3xl bg-[var(--bg-surface)] border border-white/10 hover:border-emerald-500/50 shadow-xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-emerald-500/10"
                >
                  {/* Foto de la pala */}
                  <div className="relative w-full h-64 bg-zinc-950/80 overflow-hidden flex items-center justify-center p-4">
                    <img
                      src={
                        pala.imagenUrl ||
                        'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=600&q=80'
                      }
                      alt={`${pala.marcaNombre} ${pala.modelo}`}
                      className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=600&q=80';
                      }}
                    />

                    {/* Chips superiores */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/80 backdrop-blur-md text-emerald-400 border border-emerald-400/30">
                        {pala.forma}
                      </span>
                      {pala.anoLanzamiento && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-900/80 text-zinc-300 border border-white/10">
                          {pala.anoLanzamiento}
                        </span>
                      )}
                    </div>

                    {/* Calificación */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-amber-400 font-extrabold text-xs border border-amber-400/30">
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      <span>{(pala.puntuacionGeneral || 9.0).toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Cuerpo de la card con distintivos técnicos */}
                  <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                    <div>
                      <div className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">
                        {pala.marcaNombre}
                      </div>
                      <h3 className="text-lg font-black text-white tracking-tight leading-snug group-hover:text-emerald-300 transition-colors">
                        {pala.modelo}
                      </h3>
                      {pala.jugadorPro && (
                        <div className="text-[11px] text-zinc-400 mt-0.5">
                          Pala oficial de <span className="text-zinc-200 font-semibold">{pala.jugadorPro}</span>
                        </div>
                      )}
                    </div>

                    {/* Fila de distintivos técnicos */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-3 border-t border-white/5">
                      <div className="flex flex-col">
                        <span className="text-zinc-400 text-[10px] font-bold uppercase">Balance</span>
                        <span className="font-semibold text-white">
                          {pala.balanceMm ? `${pala.balanceMm} mm` : 'Medio (265mm)'}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-zinc-400 text-[10px] font-bold uppercase">Dureza</span>
                        <span className="font-semibold text-emerald-400">
                          {pala.durezaPromedio ? `${pala.durezaPromedio.toFixed(1)}/10` : 'Media-Dura'}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-zinc-400 text-[10px] font-bold uppercase">Caras</span>
                        <span className="font-semibold text-white truncate">
                          {pala.materialCaras || 'Carbono 12K'}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-zinc-400 text-[10px] font-bold uppercase">Núcleo</span>
                        <span className="font-semibold text-white truncate">
                          {pala.materialNucleo || 'Black EVA'}
                        </span>
                      </div>
                    </div>

                    {/* Pie de card: Precio e icono ver ficha */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <div>
                        <span className="text-[10px] text-zinc-400 block font-bold uppercase">
                          Precio Referencia
                        </span>
                        <span className="text-lg font-black text-white">
                          ${pala.precioReferencia || 280}
                        </span>
                      </div>

                      <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-400 group-hover:translate-x-1 transition-transform">
                        <span>Ver Ficha</span>
                        <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-9 h-9 rounded-full flex items-center justify-center border border-white/10 bg-zinc-900 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-800"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="text-xs font-bold text-zinc-400 px-3">
                Página {page} de {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-9 h-9 rounded-full flex items-center justify-center border border-white/10 bg-zinc-900 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-800"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Fallback de catálogo rico con distintivos completos para pádel
const mockPalasFallback: Pala[] = [
  {
    id: 1,
    marcaId: 1,
    marcaNombre: 'Bullpadel',
    modelo: 'Vertex 04 2026',
    forma: 'Diamante',
    balanceMm: 275,
    pesoMin: 365,
    pesoMax: 375,
    materialCaras: 'Carbono Xtend 12K',
    materialNucleo: 'MultiEVA',
    superficieRugosa: 'Topspin Arenosa',
    estacionOptima: 'TodoAno',
    precioReferencia: 310,
    puntuacionGeneral: 9.6,
    durezaPromedio: 8.2,
    potenciaPromedio: 9.7,
    controlPromedio: 8.5,
    anoLanzamiento: 2026,
    jugadorPro: 'Juan Tello',
    totalResenas: 48,
    totalVotos: 120,
    nivelJuego: 'Profesional',
    genero: 'Unisex',
    imagenUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 2,
    marcaId: 2,
    marcaNombre: 'Nox',
    modelo: 'AT10 Luxury Genius 18K Alum',
    forma: 'Lagrima',
    balanceMm: 265,
    pesoMin: 360,
    pesoMax: 375,
    materialCaras: 'Carbono 18K Alum',
    materialNucleo: 'MLD Black EVA',
    superficieRugosa: 'Rugoso 3D Hexagonal',
    estacionOptima: 'TodoAno',
    precioReferencia: 330,
    puntuacionGeneral: 9.8,
    durezaPromedio: 7.2,
    potenciaPromedio: 9.2,
    controlPromedio: 9.8,
    anoLanzamiento: 2026,
    jugadorPro: 'Agustín Tapia',
    totalResenas: 92,
    totalVotos: 240,
    nivelJuego: 'Avanzado',
    genero: 'Unisex',
    imagenUrl: 'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    marcaId: 3,
    marcaNombre: 'Babolat',
    modelo: 'Technical Viper Lebrón',
    forma: 'Diamante',
    balanceMm: 280,
    pesoMin: 365,
    pesoMax: 375,
    materialCaras: 'Carbono 3K',
    materialNucleo: 'X-EVA Tridensidad',
    superficieRugosa: '3D Spin+',
    estacionOptima: 'Verano',
    precioReferencia: 320,
    puntuacionGeneral: 9.4,
    durezaPromedio: 8.8,
    potenciaPromedio: 9.9,
    controlPromedio: 7.8,
    anoLanzamiento: 2025,
    jugadorPro: 'Juan Lebrón',
    totalResenas: 64,
    totalVotos: 180,
    nivelJuego: 'Profesional',
    genero: 'Hombre',
    imagenUrl: 'https://images.unsplash.com/photo-1544919982-b61976f0ba43?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 4,
    marcaId: 4,
    marcaNombre: 'Siux',
    modelo: 'Electra ST3 Pro Stupa',
    forma: 'Lagrima',
    balanceMm: 268,
    pesoMin: 355,
    pesoMax: 375,
    materialCaras: 'Carbono 15K TexTreme',
    materialNucleo: 'EVA Hard',
    superficieRugosa: 'Arenosa Mate',
    estacionOptima: 'TodoAno',
    precioReferencia: 295,
    puntuacionGeneral: 9.5,
    durezaPromedio: 7.8,
    potenciaPromedio: 9.4,
    controlPromedio: 9.3,
    anoLanzamiento: 2026,
    jugadorPro: 'Franco Stupaczuk',
    totalResenas: 36,
    totalVotos: 88,
    nivelJuego: 'Avanzado',
    genero: 'Unisex',
    imagenUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 5,
    marcaId: 5,
    marcaNombre: 'Head',
    modelo: 'Extreme Pro 2026',
    forma: 'Diamante',
    balanceMm: 272,
    pesoMin: 370,
    pesoMax: 380,
    materialCaras: 'Híbrido Carbono/Vidrio',
    materialNucleo: 'Power Foam',
    superficieRugosa: 'Extreme Spin',
    estacionOptima: 'Invierno',
    precioReferencia: 280,
    puntuacionGeneral: 9.2,
    durezaPromedio: 6.8,
    potenciaPromedio: 9.3,
    controlPromedio: 8.4,
    anoLanzamiento: 2026,
    jugadorPro: 'Arturo Coello',
    totalResenas: 41,
    totalVotos: 95,
    nivelJuego: 'Profesional',
    genero: 'Unisex',
    imagenUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 6,
    marcaId: 6,
    marcaNombre: 'Adidas',
    modelo: 'Metalbone 3.3 Ale Galán',
    forma: 'Diamante',
    balanceMm: 285,
    pesoMin: 345,
    pesoMax: 360,
    materialCaras: 'Carbon Aluminized 2 T0 1',
    materialNucleo: 'EVA Soft Performance',
    superficieRugosa: 'Spin Blade Decal',
    estacionOptima: 'TodoAno',
    precioReferencia: 340,
    puntuacionGeneral: 9.7,
    durezaPromedio: 7.5,
    potenciaPromedio: 9.8,
    controlPromedio: 8.8,
    anoLanzamiento: 2025,
    jugadorPro: 'Alejandro Galán',
    totalResenas: 77,
    totalVotos: 210,
    nivelJuego: 'Profesional',
    genero: 'Hombre',
    imagenUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=600&q=80',
  },
];
