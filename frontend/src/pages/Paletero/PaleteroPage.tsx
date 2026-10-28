import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { paleteroApi } from '../../api/paletero';
import { useAuth } from '../../hooks/useAuth';
import type { MiPaleteroGrouped, PaleteroItem } from '../../types';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Briefcase,
  Trash2,
  Star,
  Award,
  Compass,
  LogIn,
  Plus,
  MessageSquare,
  ShieldAlert,
  ArrowLeftRight,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
} from 'lucide-react';

interface TelemetryState {
  horasUso: number;
  overgrips: number;
  protector: boolean;
}

const DEFAULT_TELEMETRY: TelemetryState = {
  horasUso: 24,
  overgrips: 1,
  protector: true,
};

export const PaleteroPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [paletero, setPaletero] = useState<MiPaleteroGrouped | null>(null);
  const [loading, setLoading] = useState(true);
  const [telemetriaMap, setTelemetriaMap] = useState<Record<number, TelemetryState>>({});
  const [expandedTelemetry, setExpandedTelemetry] = useState<Record<number, boolean>>({});

  // Carga de paletero
  const cargarPaletero = React.useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      const data = await paleteroApi.getMiPaletero();
      setPaletero(data);

      // Cargar configuraciones de telemetría desde localStorage
      const savedTelemetry: Record<number, TelemetryState> = {};
      const allItems = [
        ...data.usandoActualmente,
        ...data.enElPaletero,
        ...data.palasQueTuve,
        ...data.palasQueQuiero,
      ];

      allItems.forEach((item) => {
        const raw = localStorage.getItem(`palantica_telemetria_${item.id}`);
        if (raw) {
          try {
            savedTelemetry[item.id] = JSON.parse(raw);
          } catch {
            savedTelemetry[item.id] = DEFAULT_TELEMETRY;
          }
        } else {
          savedTelemetry[item.id] = {
            ...DEFAULT_TELEMETRY,
            horasUso: item.categoria === 'Usando actualmente' ? 42 : 18,
          };
        }
      });
      setTelemetriaMap(savedTelemetry);
    } catch (err) {
      console.error('Error cargando paletero:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const timer = setTimeout(() => {
      cargarPaletero();
    }, 0);
    return () => clearTimeout(timer);
  }, [cargarPaletero]);

  const handleEliminar = async (palaId: number, categoria: string) => {
    if (!confirm('¿Deseás quitar esta pala de este compartimento?')) return;
    try {
      await paleteroApi.removeItem(palaId, categoria);
      await cargarPaletero();
    } catch (err) {
      console.error('Error al eliminar ítem:', err);
    }
  };

  const updateTelemetry = (itemId: number, patch: Partial<TelemetryState>) => {
    setTelemetriaMap((prev) => {
      const current = prev[itemId] || DEFAULT_TELEMETRY;
      const updated = { ...current, ...patch };
      localStorage.setItem(`palantica_telemetria_${itemId}`, JSON.stringify(updated));
      return { ...prev, [itemId]: updated };
    });
  };

  const toggleTelemetryAccordion = (itemId: number) => {
    setExpandedTelemetry((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  if (!isAuthenticated) {
    return (
      <div
        className="card-skeuomorphic animate-fade-in"
        style={{
          padding: '48px 24px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          borderRadius: '0px',
        }}
      >
        <Briefcase size={48} color="var(--padel-turf-green)" />
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-serif)' }}>
          Mi Paletero Digital
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', fontSize: '0.92rem', lineHeight: 1.5 }}>
          Iniciá sesión para organizar tu paletero técnico, monitorear la fatiga del núcleo EVA, personalizar el balance con overgrips y registrar horas de juego.
        </p>
        <Link to="/login" className="btn-primary" style={{ marginTop: '8px', borderRadius: '0px' }}>
          <LogIn size={16} />
          <span>Iniciar Sesión</span>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Skeleton height="140px" borderRadius="0px" />
        <Skeleton height="200px" borderRadius="0px" />
      </div>
    );
  }

  const renderCompartimento = (
    titulo: string,
    icono: React.ReactNode,
    items: PaleteroItem[],
    esTitular = false
  ) => (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {icono}
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-serif)' }}>
          {titulo}
        </h3>
        <span className="badge badge-neutral" style={{ marginLeft: 'auto', borderRadius: '0px' }}>
          {items.length} {items.length === 1 ? 'pala' : 'palas'}
        </span>
      </div>

      {items.length === 0 ? (
        <div
          className="card-skeuomorphic"
          style={{
            padding: '28px',
            textAlign: 'center',
            background: 'var(--bg-card)',
            borderStyle: 'dashed',
            borderRadius: '0px',
          }}
        >
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            No tenés ninguna pala guardada en este compartimento.
          </p>
          <Link
            to="/catalogo"
            style={{
              fontSize: '0.82rem',
              color: 'var(--color-primary-sage)',
              fontWeight: 700,
              marginTop: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Plus size={14} />
            <span>Explorar catálogo para agregar</span>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {items.map((item) => {
            const tel = telemetriaMap[item.id] || DEFAULT_TELEMETRY;
            const isAccordionOpen = !!expandedTelemetry[item.id];

            // Cálculo de Fatiga del Material / Salud del Núcleo
            // La goma colapsa tras ~120h intensivas
            const saludNucleo = Math.max(0, Math.min(100, Math.round(100 - (tel.horasUso / 120) * 100)));

            let saludColor = '#10B981'; // Verde
            let saludDesc = 'Memoria elástica óptima';
            if (saludNucleo < 40) {
              saludColor = '#EF4444'; // Rojo
              saludDesc = 'Goma colapsada / Salida atenuada 15%';
            } else if (saludNucleo < 70) {
              saludColor = '#F59E0B'; // Ámbar
              saludDesc = 'Pérdida moderada de reactividad';
            }

            // Cálculo de Personalización Biomecánica
            const pesoBase = 365;
            const balanceBase = 265;
            const pesoEfectivo = pesoBase + tel.overgrips * 5 + (tel.protector ? 6 : 0);
            const balanceEfectivo = balanceBase - tel.overgrips * 3 + (tel.protector ? 4 : 0);

            let balanceCarácter = 'Balance Medio (Polivalente)';
            if (balanceEfectivo > 268) {
              balanceCarácter = 'Balance Alto (Pegador Ofensivo)';
            } else if (balanceEfectivo < 262) {
              balanceCarácter = 'Balance Bajo (Control Quirúrgico)';
            }

            return (
              <div
                key={item.id}
                className="card-skeuomorphic"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  borderRadius: '0px',
                  border: esTitular ? '1px solid var(--border-card-hover)' : '1px solid var(--border-card)',
                  background: esTitular
                    ? 'linear-gradient(135deg, rgba(82,183,136,0.08) 0%, var(--bg-card) 100%)'
                    : 'var(--bg-card)',
                }}
              >
                {/* Badge de Categoría */}
                {esTitular && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="badge badge-sage" style={{ borderRadius: '0px', fontSize: '0.68rem' }}>
                      <Award size={12} /> Pala Titular de Competición
                    </span>
                  </div>
                )}

                {/* Info Principal */}
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '74px',
                      height: '74px',
                      background: 'var(--pedestal-gradient)',
                      borderRadius: '0px',
                      border: '1px solid var(--border-card)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={item.palaImagenUrl || 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800'}
                      alt={item.palaModelo}
                      style={{ maxHeight: '88%', maxWidth: '88%', objectFit: 'contain' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {item.palaMarca}
                    </span>
                    <Link
                      to={`/palas/${item.palaId}`}
                      style={{
                        fontSize: '1.15rem',
                        fontWeight: 800,
                        fontFamily: 'var(--font-serif)',
                        color: 'var(--text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.palaModelo}
                    </Link>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                      <span className="badge badge-neutral" style={{ borderRadius: '0px', fontSize: '0.66rem' }}>
                        {item.palaForma}
                      </span>
                      <span className="badge badge-neutral" style={{ borderRadius: '0px', fontSize: '0.66rem' }}>
                        Dureza {item.palaDurezaPromedio.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {item.notas && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.80rem',
                      color: 'var(--text-secondary)',
                      background: 'var(--bg-input)',
                      padding: '8px 12px',
                      borderRadius: '0px',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <MessageSquare size={13} color="var(--padel-court-blue-vibrant)" />
                    <span>{item.notas}</span>
                  </div>
                )}

                {/* Resumen Compacto de Telemetría */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    padding: '10px 12px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '0px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.70rem', color: 'var(--text-muted)' }}>Horas de Uso</div>
                    <div style={{ fontSize: '0.90rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {tel.horasUso} h
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.70rem', color: 'var(--text-muted)' }}>Salud del Núcleo</div>
                    <div style={{ fontSize: '0.90rem', fontWeight: 800, color: saludColor }}>
                      {saludNucleo}%
                    </div>
                  </div>
                </div>

                {/* Botón Desplegable para Telemetría y Personalización */}
                <button
                  onClick={() => toggleTelemetryAccordion(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: isAccordionOpen ? 'rgba(37, 99, 235, 0.15)' : 'var(--bg-input)',
                    border: '1px solid var(--border-card)',
                    borderRadius: '0px',
                    color: isAccordionOpen ? 'var(--padel-court-blue-light)' : 'var(--text-primary)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <SlidersHorizontal size={14} />
                    <span>Telemetría de Desgaste & Setup Biomecánico</span>
                  </div>
                  {isAccordionOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {/* Panel Interactivo de Telemetría Expandible */}
                {isAccordionOpen && (
                  <div
                    className="animate-fade-in"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      padding: '14px',
                      background: 'var(--bg-card-elevated)',
                      border: '1px solid var(--border-card-hover)',
                      borderRadius: '0px',
                    }}
                  >
                    {/* 1. Medidor de Fatiga */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          Horas de Juego Acumuladas
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            onClick={() => updateTelemetry(item.id, { horasUso: Math.max(0, tel.horasUso - 5) })}
                            style={{
                              padding: '2px 8px',
                              background: 'var(--bg-input)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: '0px',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              color: 'var(--text-primary)',
                            }}
                          >
                            -5h
                          </button>
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, minWidth: '40px', textAlign: 'center' }}>
                            {tel.horasUso}h
                          </span>
                          <button
                            onClick={() => updateTelemetry(item.id, { horasUso: Math.min(200, tel.horasUso + 5) })}
                            style={{
                              padding: '2px 8px',
                              background: 'var(--bg-input)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: '0px',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              color: 'var(--text-primary)',
                            }}
                          >
                            +5h
                          </button>
                        </div>
                      </div>

                      {/* Barra de Fatiga */}
                      <div style={{ width: '100%', height: '6px', background: 'var(--bg-input)', borderRadius: '0px', marginTop: '6px' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${saludNucleo}%`,
                            background: saludColor,
                            borderRadius: '0px',
                            transition: 'all 0.3s ease',
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        <span>Salud: {saludNucleo}%</span>
                        <span style={{ color: saludColor, fontWeight: 700 }}>{saludDesc}</span>
                      </div>

                      {/* Alerta Preventiva */}
                      {tel.horasUso >= 80 && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '8px',
                            padding: '8px 10px',
                            background: 'rgba(239, 68, 68, 0.12)',
                            border: '1px solid var(--accord-potencia)',
                            borderRadius: '0px',
                            marginTop: '8px',
                            fontSize: '0.74rem',
                            color: '#FFFFFF',
                            lineHeight: 1.4,
                          }}
                        >
                          <ShieldAlert size={16} color="var(--accord-potencia)" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span>
                            Alerta preventiva: Superadas las 80 horas de juego; la salida de bola y la elasticidad del núcleo EVA pueden atenuarse hasta un 15%.
                          </span>
                        </div>
                      )}
                    </div>

                    {/* 2. Bitácora de Personalización Biomecánica */}
                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                      <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Personalización del Setup
                      </span>

                      {/* Overgrips */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)' }}>Overgrips instalados</span>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>+5g y -3mm balance por grip</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            onClick={() => updateTelemetry(item.id, { overgrips: Math.max(0, tel.overgrips - 1) })}
                            style={{
                              padding: '2px 8px',
                              background: 'var(--bg-input)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: '0px',
                              fontWeight: 800,
                              color: 'var(--text-primary)',
                            }}
                          >
                            -
                          </button>
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, minWidth: '24px', textAlign: 'center' }}>
                            {tel.overgrips}
                          </span>
                          <button
                            onClick={() => updateTelemetry(item.id, { overgrips: Math.min(4, tel.overgrips + 1) })}
                            style={{
                              padding: '2px 8px',
                              background: 'var(--bg-input)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: '0px',
                              fontWeight: 800,
                              color: 'var(--text-primary)',
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Protector */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)' }}>Protector de marco</span>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>+6g y +4mm balance en cabeza</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={tel.protector}
                          onChange={(e) => updateTelemetry(item.id, { protector: e.target.checked })}
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                      </div>

                      {/* Métricas Dinámicas Resultantes */}
                      <div
                        style={{
                          marginTop: '10px',
                          padding: '8px 10px',
                          background: 'var(--bg-input)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '0px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Peso Total Efectivo:</span>
                          <strong style={{ color: 'var(--text-primary)' }}>{pesoEfectivo} g</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Balance Dinámico:</span>
                          <strong style={{ color: 'var(--padel-court-blue-light)' }}>{balanceEfectivo} mm</strong>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--padel-turf-green)', fontWeight: 700, marginTop: '2px' }}>
                          {balanceCarácter}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer de Acciones */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '10px',
                    marginTop: 'auto',
                  }}
                >
                  <Link
                    to={`/palas/${item.palaId}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.76rem',
                      color: 'var(--padel-turf-green)',
                      fontWeight: 700,
                    }}
                  >
                    <span>Ver Ficha Técnica</span>
                  </Link>

                  <button
                    onClick={() => handleEliminar(item.palaId, item.categoria)}
                    style={{
                      color: 'var(--color-accent-terracotta)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                    }}
                  >
                    <Trash2 size={13} />
                    <span>Quitar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="animate-fade-in">
      {/* Header */}
      <div
        className="card-skeuomorphic"
        style={{
          padding: '24px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          borderRadius: '0px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 900, fontFamily: 'var(--font-serif)' }}>
            Mi Paletero Digital
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Gestión técnica clasificada, telemetría de fatiga del núcleo y personalización biomecánica de balance.
          </p>
        </div>

        <Link
          to="/comparador"
          className="btn-secondary"
          style={{ borderRadius: '0px', padding: '8px 16px', fontSize: '0.84rem' }}
        >
          <ArrowLeftRight size={15} />
          <span>Abrir Comparador A/B</span>
        </Link>
      </div>

      {paletero && (
        <>
          {renderCompartimento(
            'Usando Actualmente',
            <Award size={22} color="var(--color-primary-sage)" />,
            paletero.usandoActualmente,
            true
          )}

          {renderCompartimento(
            'En el Paletero (Reserva)',
            <Briefcase size={22} color="var(--color-accent-steel)" />,
            paletero.enElPaletero
          )}

          {renderCompartimento(
            'Palas que Quiero (Wishlist)',
            <Star size={22} color="var(--color-accent-amber)" />,
            paletero.palasQueQuiero
          )}

          {renderCompartimento(
            'Palas que Tuve (Historial)',
            <Compass size={22} color="var(--text-secondary)" />,
            paletero.palasQueTuve
          )}
        </>
      )}
    </div>
  );
};

export default PaleteroPage;
