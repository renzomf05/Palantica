import React from 'react';
import { Zap, Crosshair, Wind, Feather, Activity, CircleDot, SlidersHorizontal } from 'lucide-react';

interface AcordesDeJuegoProps {
  potencia: number;
  control: number;
  salidaBola: number;
  maniobrabilidad: number;
  puntoDulce: number;
  confort: number;
}

interface AccordItem {
  id: string;
  nombre: string;
  descripcion: string;
  valor: number;
  color: string;
  textColor: string;
  icon: React.ComponentType<{ size?: number; color?: string; style?: React.CSSProperties }>;
}

export const AcordesDeJuego: React.FC<AcordesDeJuegoProps> = ({
  potencia,
  control,
  salidaBola,
  maniobrabilidad,
  puntoDulce,
  confort,
}) => {
  // Configuración de acordes con colores técnicos de la paleta
  const accords: AccordItem[] = [
    {
      id: 'potencia',
      nombre: 'Potencia Ofensiva',
      descripcion: 'Velocidad de bola en remates, víboras y juego aéreo',
      valor: Math.max(0, Math.min(10, potencia || 0)),
      color: 'var(--accord-potencia)',
      textColor: '#FFFFFF',
      icon: Zap,
    },
    {
      id: 'control',
      nombre: 'Control & Precisión',
      descripcion: 'Milimetría en colocación, chiquitas y globos defensivos',
      valor: Math.max(0, Math.min(10, control || 0)),
      color: 'var(--accord-control)',
      textColor: '#FFFFFF',
      icon: Crosshair,
    },
    {
      id: 'salida',
      nombre: 'Salida de Bola Rápida',
      descripcion: 'Rebote pasivo inmediato al bloquear en red y fondo',
      valor: Math.max(0, Math.min(10, salidaBola || 0)),
      color: 'var(--accord-salida)',
      textColor: '#0A1128',
      icon: Wind,
    },
    {
      id: 'confort',
      nombre: 'Confort & Amortiguación',
      descripcion: 'Absorción de vibraciones y protección de codo/articulaciones',
      valor: Math.max(0, Math.min(10, confort || 0)),
      color: 'var(--accord-confort)',
      textColor: '#FFFFFF',
      icon: Feather,
    },
    {
      id: 'maniobra',
      nombre: 'Manejabilidad en Red',
      descripcion: 'Agilidad en transiciones rápidas de volea y duelos reflejos',
      valor: Math.max(0, Math.min(10, maniobrabilidad || 0)),
      color: 'var(--accord-maniobra)',
      textColor: '#FFFFFF',
      icon: Activity,
    },
    {
      id: 'puntodulce',
      nombre: 'Punto Dulce Amplio',
      descripcion: 'Tolerancia al impacto descentrado en situaciones comprometidas',
      valor: Math.max(0, Math.min(10, puntoDulce || 0)),
      color: 'var(--accord-puntodulce)',
      textColor: '#0A1128',
      icon: CircleDot,
    },
  ];

  // Ordenar de mayor a menor valor según dominancia sensorial en pista
  const sortedAccords = [...accords].sort((a, b) => b.valor - a.valor);

  return (
    <div
      className="card-skeuomorphic"
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SlidersHorizontal size={18} color="var(--padel-court-blue-vibrant)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Sensaciones Principales en Pista</h3>
          </div>
          <p style={{ fontSize: '0.80rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Acordes de juego comunitarios apilados por orden de dominancia sensorial
          </p>
        </div>
        <span className="badge badge-steel" style={{ fontSize: '0.70rem' }}>
          Sensaciones en Pista
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
        {sortedAccords.map((accord) => {
          const Icon = accord.icon;
          // Ancho proporcional con mínimo del 25% para legibilidad del texto
          const relativeWidthPercent = Math.max(28, (accord.valor / 10) * 100);

          return (
            <div key={accord.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '36px',
                  background: 'var(--bg-input)',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.15)',
                }}
              >
                {/* Barra horizontal animada */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: `${relativeWidthPercent}%`,
                    background: accord.color,
                    borderRadius: 'var(--radius-sm) 0 0 var(--radius-sm)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.3)',
                    transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 12px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: accord.textColor,
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      letterSpacing: '0.02em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Icon size={15} color={accord.textColor} />
                    <span>{accord.nombre}</span>
                  </div>

                  <span
                    style={{
                      color: accord.textColor,
                      fontWeight: 900,
                      fontSize: '0.82rem',
                    }}
                  >
                    {accord.valor.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
