import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { palasApi } from '../../api/palas';
import type { PalaDetalle, Pala } from '../../types';
import { DualRadarChart } from '../../components/palas/DualRadarChart';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  ArrowLeftRight,
  SlidersHorizontal,
  Layers,
  Sparkles,
  ExternalLink,
  Search,
  Check,
  ChevronDown,
} from 'lucide-react';

export const ComparadorPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const pala1IdParam = searchParams.get('pala1');
  const pala2IdParam = searchParams.get('pala2');

  const [todasLasPalas, setTodasLasPalas] = useState<Pala[]>([]);
  const [pala1, setPala1] = useState<PalaDetalle | null>(null);
  const [pala2, setPala2] = useState<PalaDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectorOpenSlot, setSelectorOpenSlot] = useState<1 | 2 | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Carga inicial del catálogo para selector
  useEffect(() => {
    const fetchCatalogo = async () => {
      try {
        const res = await palasApi.getPalas({ pageSize: 50 });
        setTodasLasPalas(res.items);
      } catch (err) {
        console.error('Error al cargar palas para el comparador:', err);
      }
    };
    fetchCatalogo();
  }, []);

  // Cargar detalles de las 2 palas seleccionadas
  useEffect(() => {
    const cargarPalas = async () => {
      setLoading(true);
      try {
        const id1 = pala1IdParam ? parseInt(pala1IdParam, 10) : 1;
        const id2 = pala2IdParam ? parseInt(pala2IdParam, 10) : 2;

        const [p1, p2] = await Promise.all([
          palasApi.getPalaDetalle(id1).catch(() => null),
          palasApi.getPalaDetalle(id2).catch(() => null),
        ]);

        setPala1(p1);
        setPala2(p2);
      } catch (err) {
        console.error('Error cargando detalles en comparador:', err);
      } finally {
        setLoading(false);
      }
    };

    cargarPalas();
  }, [pala1IdParam, pala2IdParam]);

  // Selección de una pala para un slot
  const handleSelectPala = (slot: 1 | 2, id: number) => {
    const current1 = pala1?.id || 1;
    const current2 = pala2?.id || 2;

    if (slot === 1) {
      setSearchParams({ pala1: id.toString(), pala2: current2.toString() });
    } else {
      setSearchParams({ pala1: current1.toString(), pala2: id.toString() });
    }
    setSelectorOpenSlot(null);
    setSearchTerm('');
  };

  // Intercambiar posiciones
  const handleSwap = () => {
    if (!pala1 || !pala2) return;
    setSearchParams({ pala1: pala2.id.toString(), pala2: pala1.id.toString() });
  };

  // Filtrado de palas en el buscador del selector
  const palasFiltradas = useMemo(() => {
    if (!searchTerm.trim()) return todasLasPalas;
    const term = searchTerm.toLowerCase();
    return todasLasPalas.filter(
      (p) =>
        p.modelo.toLowerCase().includes(term) ||
        p.marcaNombre.toLowerCase().includes(term) ||
        p.materialCaras.toLowerCase().includes(term)
    );
  }, [todasLasPalas, searchTerm]);

  // Generación de veredicto técnico inteligente
  const veredicto = useMemo(() => {
    if (!pala1 || !pala2) return null;

    const diffPotencia = pala1.potenciaPromedio - pala2.potenciaPromedio;
    const diffControl = pala1.controlPromedio - pala2.controlPromedio;
    const diffBalance = pala1.balanceMm - pala2.balanceMm;
    const diffDureza = pala1.durezaPromedio - pala2.durezaPromedio;

    let perfilPala1 = '';
    let perfilPala2 = '';

    if (pala1.potenciaPromedio > 8.5 || pala1.balanceMm >= 270) {
      perfilPala1 = 'perfil agresivo de ataque y rematadores aéreos (revés)';
    } else if (pala1.controlPromedio > 8.5 || pala1.forma === 'Redonda') {
      perfilPala1 = 'perfil quirúrgico de control, precisión y defensa (drive)';
    } else {
      perfilPala1 = 'perfil polivalente balanceado de juego total';
    }

    if (pala2.potenciaPromedio > 8.5 || pala2.balanceMm >= 270) {
      perfilPala2 = 'perfil agresivo de ataque y rematadores aéreos (revés)';
    } else if (pala2.controlPromedio > 8.5 || pala2.forma === 'Redonda') {
      perfilPala2 = 'perfil quirúrgico de control, precisión y defensa (drive)';
    } else {
      perfilPala2 = 'perfil polivalente balanceado de juego total';
    }

    let comparacionClave = '';
    if (Math.abs(diffPotencia) >= 0.8) {
      const masPotente = diffPotencia > 0 ? pala1 : pala2;
      const menosPotente = diffPotencia > 0 ? pala2 : pala1;
      comparacionClave = `La ${masPotente.marcaNombre} ${masPotente.modelo} ofrece una aceleración de bola notablemente superior (+${Math.abs(diffPotencia).toFixed(1)} en potencia), mientras que la ${menosPotente.marcaNombre} ${menosPotente.modelo} compensa con mayor maniobrabilidad en defensa baja.`;
    } else if (Math.abs(diffControl) >= 0.8) {
      const masControl = diffControl > 0 ? pala1 : pala2;
      comparacionClave = `La ${masControl.marcaNombre} ${masControl.modelo} destaca por su punto dulce más indulgente y precisión milimétrica en bloqueos y chiquitas.`;
    } else {
      comparacionClave = `Ambas palas pertenecen a un espectro biomecánico muy similar, distinguiéndose principalmente por la respuesta elástica de sus materiales y dureza percibida.`;
    }

    return {
      perfilPala1,
      perfilPala2,
      comparacionClave,
      diffBalance,
      diffDureza,
    };
  }, [pala1, pala2]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%', maxWidth: '1720px', margin: '0 auto' }}>
      {/* Encabezado Editorial */}
      <div
        className="card-skeuomorphic"
        style={{
          padding: '28px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-surface) 100%)',
          borderRadius: '0px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              padding: '6px',
              background: 'rgba(37, 99, 235, 0.15)',
              border: '1px solid var(--border-accent)',
              borderRadius: '0px',
              color: 'var(--padel-court-blue-vibrant)',
            }}
          >
            <ArrowLeftRight size={22} />
          </div>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--padel-court-blue-light)' }}>
            Telemetría de Rendimiento
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '2.3rem', fontWeight: 900, fontFamily: 'var(--font-serif)', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
              Comparador Técnico A/B
            </h1>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginTop: '6px', maxWidth: '720px' }}>
              Enfrentamiento biomedido de especificaciones de fábrica, sensaciones en pista comunitarias y respuesta de materiales.
            </p>
          </div>

          <button
            onClick={handleSwap}
            className="btn-secondary"
            style={{ borderRadius: '0px', padding: '10px 18px', fontSize: '0.85rem' }}
            title="Intercambiar orden de las palas"
          >
            <ArrowLeftRight size={16} />
            <span>Invertir Lado A ↔ B</span>
          </button>
        </div>
      </div>

      {/* Selector de Palas Superior (Headers Duales) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Selector Pala 1 */}
        <div
          className="card-skeuomorphic"
          style={{
            padding: '20px',
            borderTop: '4px solid var(--padel-court-blue-vibrant)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            borderRadius: '0px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="badge badge-steel" style={{ borderRadius: '0px' }}>
              Pala A • Azul Cancha
            </span>
            <button
              onClick={() => setSelectorOpenSlot(selectorOpenSlot === 1 ? null : 1)}
              style={{
                fontSize: '0.80rem',
                fontWeight: 700,
                color: 'var(--padel-court-blue-light)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>Cambiar pala</span>
              <ChevronDown size={14} />
            </button>
          </div>

          {loading || !pala1 ? (
            <Skeleton height="80px" borderRadius="0px" />
          ) : (
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  background: 'radial-gradient(circle, var(--bg-card-hover) 0%, var(--bg-deep) 100%)',
                  borderRadius: '0px',
                  border: '1px solid var(--border-card)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                }}
              >
                <img
                  src={pala1.imagenUrl || 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800'}
                  alt={pala1.modelo}
                  style={{ maxHeight: '90%', maxWidth: '90%', objectFit: 'contain' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {pala1.marcaNombre}
                </span>
                <Link
                  to={`/palas/${pala1.id}`}
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-serif)',
                    color: 'var(--text-primary)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>{pala1.modelo}</span>
                  <ExternalLink size={14} color="var(--text-muted)" />
                </Link>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                  <span className="badge badge-neutral" style={{ borderRadius: '0px', fontSize: '0.68rem' }}>
                    {pala1.forma}
                  </span>
                  <span className="badge badge-neutral" style={{ borderRadius: '0px', fontSize: '0.68rem' }}>
                    {pala1.anoLanzamiento}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Selector Pala 2 */}
        <div
          className="card-skeuomorphic"
          style={{
            padding: '20px',
            borderTop: '4px solid var(--padel-ball-yellow-vibrant)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            borderRadius: '0px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              className="badge"
              style={{
                borderRadius: '0px',
                background: 'rgba(163, 230, 53, 0.15)',
                color: 'var(--padel-ball-yellow-vibrant)',
                border: '1px solid rgba(163, 230, 53, 0.35)',
              }}
            >
              Pala B • Amarillo Volt
            </span>
            <button
              onClick={() => setSelectorOpenSlot(selectorOpenSlot === 2 ? null : 2)}
              style={{
                fontSize: '0.80rem',
                fontWeight: 700,
                color: 'var(--padel-ball-yellow-vibrant)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>Cambiar pala</span>
              <ChevronDown size={14} />
            </button>
          </div>

          {loading || !pala2 ? (
            <Skeleton height="80px" borderRadius="0px" />
          ) : (
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  background: 'radial-gradient(circle, var(--bg-card-hover) 0%, var(--bg-deep) 100%)',
                  borderRadius: '0px',
                  border: '1px solid var(--border-card)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                }}
              >
                <img
                  src={pala2.imagenUrl || 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800'}
                  alt={pala2.modelo}
                  style={{ maxHeight: '90%', maxWidth: '90%', objectFit: 'contain' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {pala2.marcaNombre}
                </span>
                <Link
                  to={`/palas/${pala2.id}`}
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-serif)',
                    color: 'var(--text-primary)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>{pala2.modelo}</span>
                  <ExternalLink size={14} color="var(--text-muted)" />
                </Link>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                  <span className="badge badge-neutral" style={{ borderRadius: '0px', fontSize: '0.68rem' }}>
                    {pala2.forma}
                  </span>
                  <span className="badge badge-neutral" style={{ borderRadius: '0px', fontSize: '0.68rem' }}>
                    {pala2.anoLanzamiento}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal / Desplegable de Selección de Pala */}
      {selectorOpenSlot && (
        <div
          className="card-skeuomorphic animate-fade-in"
          style={{
            padding: '20px',
            borderRadius: '0px',
            border: '2px solid var(--padel-court-blue-vibrant)',
            background: 'var(--bg-card-elevated)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-serif)' }}>
              Seleccionar pala para el Lado {selectorOpenSlot === 1 ? 'A (Azul Cancha)' : 'B (Amarillo Volt)'}
            </h3>
            <button
              onClick={() => setSelectorOpenSlot(null)}
              style={{ fontSize: '0.80rem', color: 'var(--text-muted)', fontWeight: 700 }}
            >
              Cerrar ✕
            </button>
          </div>

          <div style={{ position: 'relative', marginBottom: '14px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Buscar por marca, modelo o material..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '38px', borderRadius: '0px' }}
              autoFocus
            />
          </div>

          <div
            style={{
              maxHeight: '260px',
              overflowY: 'auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '10px',
            }}
          >
            {palasFiltradas.map((p) => {
              const isSelected = (selectorOpenSlot === 1 ? pala1?.id : pala2?.id) === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectPala(selectorOpenSlot, p.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    background: isSelected ? 'rgba(37, 99, 235, 0.2)' : 'var(--bg-input)',
                    border: isSelected ? '1px solid var(--padel-court-blue-vibrant)' : '1px solid var(--border-subtle)',
                    borderRadius: '0px',
                    textAlign: 'left',
                    color: 'var(--text-primary)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      {p.marcaNombre}
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.modelo}
                    </div>
                  </div>
                  {isSelected && <Check size={16} color="var(--padel-court-blue-vibrant)" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Gráfico Radar Dual Overlaid */}
      {pala1 && pala2 && (
        <div
          className="card-skeuomorphic"
          style={{
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '18px',
            borderRadius: '0px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SlidersHorizontal size={20} color="var(--padel-court-blue-vibrant)" />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-serif)' }}>
              Radar Comparativo de Sensaciones en Pista
            </h2>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '640px' }}>
            Superposición de los 6 ejes biomecánicos para identificar inmediatamente ventajas de pegada, zona de control y tolerancia al impacto.
          </p>

          <DualRadarChart
            data1={{
              potencia: pala1.potenciaPromedio,
              control: pala1.controlPromedio,
              salidaBola: pala1.salidaBolaPromedio,
              maniobrabilidad: pala1.maniobrabilidadPromedio,
              puntoDulce: pala1.puntoDulcePromedio,
              confort: pala1.confortPromedio,
            }}
            label1={`${pala1.marcaNombre} ${pala1.modelo}`}
            data2={{
              potencia: pala2.potenciaPromedio,
              control: pala2.controlPromedio,
              salidaBola: pala2.salidaBolaPromedio,
              maniobrabilidad: pala2.maniobrabilidadPromedio,
              puntoDulce: pala2.puntoDulcePromedio,
              confort: pala2.confortPromedio,
            }}
            label2={`${pala2.marcaNombre} ${pala2.modelo}`}
            size={380}
          />
        </div>
      )}

      {/* Tabla Comparativa de Especificaciones Técnicas Side-by-Side */}
      {pala1 && pala2 && (
        <div
          className="card-skeuomorphic"
          style={{
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            borderRadius: '0px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers size={20} color="var(--padel-turf-green)" />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-serif)' }}>
              Matriz Técnica de Materiales y Geometría
            </h2>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.88rem',
                fontFamily: 'var(--font-sans)',
              }}
            >
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-card)' }}>
                  <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted)', width: '30%' }}>
                    Especificación
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', color: '#2563EB', fontWeight: 800, width: '35%' }}>
                    {pala1.marcaNombre} {pala1.modelo}
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', color: '#A3E635', fontWeight: 800, width: '35%' }}>
                    {pala2.marcaNombre} {pala2.modelo}
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Formato */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Formato</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700 }}>{pala1.forma}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700 }}>{pala2.forma}</td>
                </tr>

                {/* Balance */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Balance Estático</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700 }}>{pala1.balanceMm} mm</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700 }}>{pala2.balanceMm} mm</td>
                </tr>

                {/* Rango de Peso */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Rango de Peso</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700 }}>{pala1.pesoMin} - {pala1.pesoMax} g</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700 }}>{pala2.pesoMin} - {pala2.pesoMax} g</td>
                </tr>

                {/* Material Caras */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Material Caras</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700 }}>{pala1.materialCaras}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700 }}>{pala2.materialCaras}</td>
                </tr>

                {/* Material Núcleo */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Material Núcleo</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700 }}>{pala1.materialNucleo}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700 }}>{pala2.materialNucleo}</td>
                </tr>

                {/* Superficie Rugosa */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Acabado Superficie</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700 }}>{pala1.superficieRugosa}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700 }}>{pala2.superficieRugosa}</td>
                </tr>

                {/* Dureza Percibida */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Dureza Percibida</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700 }}>
                    <span className="badge badge-amber" style={{ borderRadius: '0px' }}>
                      {pala1.durezaPromedio.toFixed(1)} / 10
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 700 }}>
                    <span className="badge badge-amber" style={{ borderRadius: '0px' }}>
                      {pala2.durezaPromedio.toFixed(1)} / 10
                    </span>
                  </td>
                </tr>

                {/* Potencia Ofensiva */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Potencia Ofensiva</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--accord-potencia)' }}>
                    {pala1.potenciaPromedio.toFixed(1)} / 10
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--accord-potencia)' }}>
                    {pala2.potenciaPromedio.toFixed(1)} / 10
                  </td>
                </tr>

                {/* Control & Precisión */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Control & Precisión</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--accord-control)' }}>
                    {pala1.controlPromedio.toFixed(1)} / 10
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--accord-control)' }}>
                    {pala2.controlPromedio.toFixed(1)} / 10
                  </td>
                </tr>

                {/* Precio Referencia */}
                <tr>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Precio Oficial Ref.</td>
                  <td style={{ padding: '12px 16px', fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                    {pala1.precioReferencia} {pala1.monedaPrecio || 'EUR'}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                    {pala2.precioReferencia} {pala2.monedaPrecio || 'EUR'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Veredicto Técnico & Conclusión Biomecánica */}
      {veredicto && pala1 && pala2 && (
        <div
          className="card-skeuomorphic"
          style={{
            padding: '28px 32px',
            borderLeft: '5px solid var(--padel-court-blue-vibrant)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            borderRadius: '0px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={22} color="var(--padel-court-blue-light)" />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-serif)' }}>
              Veredicto Técnico de Palantica
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>
            <p>
              • <strong>{pala1.marcaNombre} {pala1.modelo}:</strong> Diseñada para jugadores con {veredicto.perfilPala1}.
            </p>
            <p>
              • <strong>{pala2.marcaNombre} {pala2.modelo}:</strong> Optimizada para jugadores con {veredicto.perfilPala2}.
            </p>
            <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
              💡 {veredicto.comparacionClave}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
            <Link to={`/palas/${pala1.id}`} className="btn-secondary" style={{ borderRadius: '0px', fontSize: '0.85rem' }}>
              <span>Ficha Sagrada {pala1.modelo}</span>
            </Link>
            <Link to={`/palas/${pala2.id}`} className="btn-secondary" style={{ borderRadius: '0px', fontSize: '0.85rem' }}>
              <span>Ficha Sagrada {pala2.modelo}</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparadorPage;
