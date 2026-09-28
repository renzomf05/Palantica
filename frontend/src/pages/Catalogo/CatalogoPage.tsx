import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { palasApi } from '../../api/palas';
import { shopifyApi } from '../../api/shopify';
import type { Pala, Marca, PalaFilterParams, ShopifyPalaPreview } from '../../types';
import { PalaCard } from '../../components/ui/PalaCard';
import { PalaCardSkeleton } from '../../components/ui/Skeleton';
import { PalaFinderModal } from '../../components/palas/PalaFinderModal';
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
  ShoppingBag,
  RefreshCw,
  CheckCircle2,
  Filter,
  RotateCcw,
  Sparkles,
  ArrowLeftRight
} from 'lucide-react';

export const CatalogoPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';

  const [palas, setPalas] = useState<Pala[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filtros
  const [search, setSearch] = useState(urlSearch);
  const [selectedMarca, setSelectedMarca] = useState('');
  const [selectedForma, setSelectedForma] = useState('');
  const [selectedEstacion, setSelectedEstacion] = useState('');
  const [durezaMin, setDurezaMin] = useState<number | undefined>(undefined);
  const [orderBy, setOrderBy] = useState('puntuacion');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showFinder, setShowFinder] = useState(false);

  // Shopify Modal
  const [showShopifyModal, setShowShopifyModal] = useState(false);
  const [shopifyStoreUrl, setShopifyStoreUrl] = useState('https://tiendapadelpoint.com');
  const [shopifyPreviews, setShopifyPreviews] = useState<ShopifyPalaPreview[]>([]);
  const [shopifyLoading, setShopifyLoading] = useState(false);
  const [shopifySyncing, setShopifySyncing] = useState(false);
  const [shopifySuccessMsg, setShopifySuccessMsg] = useState<string | null>(null);

  // Sincronizar parámetro de búsqueda de la URL (ej: si viene desde el buscador del Header)
  useEffect(() => {
    if (urlSearch !== search) {
      setSearch(urlSearch);
      setPage(1);
    }
  }, [urlSearch]);

  // Cargar marcas iniciales
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
  const loadPalas = async () => {
    setLoading(true);
    try {
      const filterParams: PalaFilterParams = {
        search: search.trim() || undefined,
        marca: selectedMarca || undefined,
        forma: selectedForma || undefined,
        estacion: selectedEstacion || undefined,
        durezaMin,
        orderBy,
        page,
        pageSize: 12,
      };

      const response = await palasApi.getPalas(filterParams);
      setPalas(response.items);
      setTotalPages(response.totalPages);
      setTotalCount(response.totalCount);
    } catch (err) {
      console.error('Error cargando catálogo de palas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPalas();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, selectedMarca, selectedForma, selectedEstacion, durezaMin, orderBy, page]);

  const resetFilters = () => {
    setSearch('');
    setSelectedMarca('');
    setSelectedForma('');
    setSelectedEstacion('');
    setDurezaMin(undefined);
    setOrderBy('puntuacion');
    setPage(1);
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(
    search || selectedMarca || selectedForma || selectedEstacion || durezaMin || orderBy !== 'puntuacion'
  );

  const handlePreviewShopify = async () => {
    setShopifyLoading(true);
    setShopifySuccessMsg(null);
    try {
      const data = await shopifyApi.previewStore(shopifyStoreUrl, 10);
      setShopifyPreviews(data);
    } catch (err) {
      console.error('Error previsualizando tienda Shopify:', err);
    } finally {
      setShopifyLoading(false);
    }
  };

  const handleSyncShopify = async () => {
    setShopifySyncing(true);
    try {
      const result = await shopifyApi.syncStore(shopifyStoreUrl, 15, true);
      setShopifySuccessMsg(`¡Sincronización completada! ${result.totalImportados} palas importadas con fotos reales.`);
      await loadPalas();
    } catch (err) {
      console.error('Error sincronizando con Shopify:', err);
    } finally {
      setShopifySyncing(false);
    }
  };

  // Componente de controles de filtros reutilizable entre Sidebar desktop y Drawer móvil
  const renderFilterControls = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} color="var(--padel-court-blue-vibrant)" />
          <span style={{ fontSize: '0.90rem', fontWeight: 800 }}>Filtros Técnicos</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.74rem',
              color: 'var(--padel-turf-green)',
              fontWeight: 700,
            }}
          >
            <RotateCcw size={12} />
            <span>Restablecer</span>
          </button>
        )}
      </div>

      {/* Fabricante */}
      <div>
        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
          Fabricante / Marca
        </label>
        <select
          value={selectedMarca}
          onChange={(e) => {
            setSelectedMarca(e.target.value);
            setPage(1);
          }}
          className="input-field"
        >
          <option value="">Todas las marcas</option>
          {marcas.map((m) => (
            <option key={m.id} value={m.nombre}>
              {m.nombre} ({m.totalPalas})
            </option>
          ))}
        </select>
      </div>

      {/* Formato Geométrico */}
      <div>
        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
          Formato de Molde
        </label>
        <select
          value={selectedForma}
          onChange={(e) => {
            setSelectedForma(e.target.value);
            setPage(1);
          }}
          className="input-field"
        >
          <option value="">Todos los moldes</option>
          <option value="Redonda">Redonda (Control)</option>
          <option value="Lagrima">Lágrima (Polivalente)</option>
          <option value="Diamante">Diamante (Potencia)</option>
        </select>
      </div>

      {/* Comportamiento Térmico */}
      <div>
        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
          Comportamiento Térmico
        </label>
        <select
          value={selectedEstacion}
          onChange={(e) => {
            setSelectedEstacion(e.target.value);
            setPage(1);
          }}
          className="input-field"
        >
          <option value="">Cualquier estación</option>
          <option value="Verano">Verano (&gt;25°C / Goma que no ablande)</option>
          <option value="Invierno">Invierno (&lt;15°C / Goma elástica)</option>
          <option value="TodoAno">Todo el año</option>
        </select>
      </div>

      {/* Dureza Mínima */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            Dureza Mínima
          </label>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--padel-court-blue-vibrant)' }}>
            {durezaMin ? `${durezaMin} / 10` : 'Cualquiera'}
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          step="1"
          value={durezaMin || 1}
          onChange={(e) => {
            setDurezaMin(Number(e.target.value));
            setPage(1);
          }}
          style={{ width: '100%', accentColor: 'var(--padel-court-blue-vibrant)' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          <span>1 Blanda</span>
          <span>5 Media</span>
          <span>10 Dura</span>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* Header del Catálogo con Titular & Acciones */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="badge badge-steel" style={{ marginBottom: '8px' }}>
            Enciclopedia de Palas
          </span>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 900, letterSpacing: '-0.03em' }}>
            Catálogo Técnico de Pádel
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Explorá {totalCount} modelos con especificación de materiales de carbono, gomas de núcleo y métricas sensoriales.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowFinder(true)}
            className="btn-primary"
            style={{ borderRadius: '0px' }}
          >
            <Sparkles size={15} />
            <span>Pala Finder (Quiz)</span>
          </button>

          <Link
            to="/comparador"
            className="btn-secondary"
            style={{ borderRadius: '0px' }}
          >
            <ArrowLeftRight size={15} />
            <span>Comparador A/B</span>
          </Link>

          <button
            onClick={() => {
              setShowShopifyModal(true);
              if (shopifyPreviews.length === 0) handlePreviewShopify();
            }}
            className="btn-secondary"
            style={{ borderRadius: '0px' }}
            title="Sincronizar palas reales desde tiendas Shopify"
          >
            <ShoppingBag size={15} color="var(--padel-turf-green)" />
            <span>Integrador Shopify</span>
          </button>

          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="btn-secondary mobile-filter-btn"
            style={{ borderRadius: '0px' }}
          >
            <SlidersHorizontal size={15} />
            <span>Filtros {hasActiveFilters ? '• Activos' : ''}</span>
          </button>
        </div>
      </div>

      {/* Barra de Búsqueda y Ordenamiento Superior */}
      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search
            size={18}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Buscar por modelo, fabricante o jugador pro (ej: AT10 18K, Tapia, Vertex, Metalbone)..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSearchParams(e.target.value.trim() ? { search: e.target.value.trim() } : {});
              setPage(1);
            }}
            className="input-field"
            style={{ paddingLeft: '46px' }}
          />
          {search && (
            <button
              onClick={() => {
                setSearch('');
                setSearchParams({});
              }}
              style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <select
          value={orderBy}
          onChange={(e) => {
            setOrderBy(e.target.value);
            setPage(1);
          }}
          className="input-field"
          style={{ width: 'auto', minWidth: '200px' }}
        >
          <option value="puntuacion">Mejor Puntuadas</option>
          <option value="novedad">Más Recientes (2025/2026)</option>
          <option value="precio_desc">Mayor Gama</option>
          <option value="precio_asc">Menor Precio</option>
          <option value="dureza">Mayor Dureza</option>
        </select>
      </div>

      {/* Drawer Móvil de Filtros */}
      {showMobileFilters && (
        <div
          className="card-skeuomorphic animate-slide-up mobile-filter-drawer"
          style={{
            padding: '20px',
            background: 'var(--bg-card)',
          }}
        >
          {renderFilterControls()}
        </div>
      )}

      {/* Layout Full-Width Desktop: Sidebar Sticky a la Izquierda + Grid a la Derecha */}
      <div className="catalogo-desktop-layout">
        {/* Sidebar Fijo de Filtros en Desktop */}
        <aside
          className="catalogo-sidebar"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            boxShadow: 'var(--shadow-card)',
            position: 'sticky',
            top: 'calc(var(--header-height) + 16px)',
          }}
        >
          {renderFilterControls()}
        </aside>

        {/* Contenedor Principal de Palas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '20px' }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <PalaCardSkeleton key={i} />
              ))}
            </div>
          ) : palas.length === 0 ? (
            <div
              className="card-skeuomorphic"
              style={{
                padding: '56px 24px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              <p style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                No encontramos modelos que coincidan con los criterios técnicos seleccionados.
              </p>
              <button onClick={resetFilters} className="btn-primary" style={{ marginTop: '8px' }}>
                <span>Limpiar Filtros</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '20px' }}>
              {palas.map((pala) => (
                <PalaCard key={pala.id} pala={pala} />
              ))}
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '14px',
                marginTop: '16px',
              }}
            >
              <button
                disabled={page <= 1}
                onClick={() => {
                  setPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="btn-secondary"
                style={{ opacity: page <= 1 ? 0.5 : 1 }}
              >
                <ChevronLeft size={16} />
                <span>Anterior</span>
              </button>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Página {page} de {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => {
                  setPage((p) => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="btn-secondary"
                style={{ opacity: page >= totalPages ? 0.5 : 1 }}
              >
                <span>Siguiente</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Integrador Shopify */}
      {showShopifyModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 17, 40, 0.88)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: '20px',
          }}
        >
          <div
            className="card-skeuomorphic animate-slide-up"
            style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShoppingBag size={22} color="var(--padel-turf-green)" />
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Integrador Shopify de Pádel</h3>
              </div>
              <button onClick={() => setShowShopifyModal(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
              Palantica se conecta a endpoints públicos <code>/products.json</code> de tiendas de pádel para importar fotografías de alta definición y especificaciones de producto auténticas.
            </p>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <input
                type="text"
                value={shopifyStoreUrl}
                onChange={(e) => setShopifyStoreUrl(e.target.value)}
                placeholder="https://tiendapadelpoint.com"
                className="input-field"
                style={{ flex: 1 }}
              />
              <button
                onClick={handlePreviewShopify}
                disabled={shopifyLoading}
                className="btn-secondary"
              >
                {shopifyLoading ? <RefreshCw size={15} className="animate-spin" /> : 'Consultar'}
              </button>
            </div>

            {shopifySuccessMsg && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid var(--padel-turf-green)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--padel-turf-green)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  marginBottom: '16px',
                }}
              >
                <CheckCircle2 size={18} />
                <span>{shopifySuccessMsg}</span>
              </div>
            )}

            {shopifyPreviews.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.90rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-secondary)' }}>
                  Modelos detectados en catálogo ({shopifyPreviews.length}):
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto', marginBottom: '20px' }}>
                  {shopifyPreviews.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: 'var(--bg-input)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.82rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {item.imagenUrl && (
                          <img src={item.imagenUrl} alt="" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                        )}
                        <div>
                          <strong>{item.modelo}</strong>
                          <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>({item.marca})</span>
                        </div>
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--padel-turf-green)' }}>
                        {item.precio.toFixed(2)} {item.moneda}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button onClick={() => setShowShopifyModal(false)} className="btn-secondary">
                    Cerrar
                  </button>
                  <button
                    onClick={handleSyncShopify}
                    disabled={shopifySyncing}
                    className="btn-primary"
                  >
                    {shopifySyncing ? 'Sincronizando...' : 'Sincronizar Catálogo'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 1080px) {
          .mobile-filter-btn {
            display: none !important;
          }
          .mobile-filter-drawer {
            display: none !important;
          }
        }
        @media (max-width: 1079px) {
          .catalogo-sidebar {
            display: none !important;
          }
        }
      `}</style>

      <PalaFinderModal isOpen={showFinder} onClose={() => setShowFinder(false)} />
    </div>
  );
};
