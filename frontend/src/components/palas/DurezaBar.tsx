import React from 'react';
import { Sun, Snowflake, Calendar } from 'lucide-react';

interface DurezaBarProps {
  dureza: number; // 1 a 10
  estacionOptima: string; // Verano, Invierno, TodoAno
  totalVotos?: number;
}

export const DurezaBar: React.FC<DurezaBarProps> = ({ dureza, estacionOptima, totalVotos = 0 }) => {
  const percentage = Math.min(Math.max((dureza - 1) / 9, 0), 1) * 100;

  const getDurezaTexto = (val: number) => {
    if (val <= 3.5) return 'Tacto Blando / Confort & Salida';
    if (val <= 6.0) return 'Tacto Medio / Polivalente';
    if (val <= 8.0) return 'Tacto Firme / Semiduro';
    return 'Tacto Seco / Máxima Potencia';
  };

  const getEstacionIcon = (estacion: string) => {
    const e = estacion.toLowerCase();
    if (e.includes('verano')) return <Sun size={14} color="var(--color-accent-amber)" />;
    if (e.includes('invierno')) return <Snowflake size={14} color="var(--color-accent-steel)" />;
    return <Calendar size={14} color="var(--color-primary-sage)" />;
  };

  return (
    <div
      className="card-skeuomorphic"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        padding: '20px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Escala de Dureza & Sensación de Núcleo
          </span>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
            {getDurezaTexto(dureza)} ({dureza.toFixed(1)} / 10)
          </h4>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {getEstacionIcon(estacionOptima)}
          <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
            Clima {estacionOptima}
          </span>
        </div>
      </div>

      {/* Barra de Rango con Gradiente Técnico Sobrio */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '14px',
          borderRadius: 'var(--radius-full)',
          background: 'linear-gradient(90deg, #60A5FA 0%, #52B788 45%, #F59E0B 75%, #E07A5F 100%)',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)',
          margin: '6px 0',
        }}
      >
        {/* Marcador Indicador Físico */}
        <div
          style={{
            position: 'absolute',
            top: '-5px',
            left: `calc(${percentage}% - 12px)`,
            width: '24px',
            height: '24px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-card)',
            border: '3px solid var(--color-primary-sage)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4), 0 0 6px var(--color-primary-sage-glow)',
            transition: 'left 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>

      {/* Rótulos de Extremos */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
        <span>1 (Foam / Blando)</span>
        <span>5 (MultiEVA)</span>
        <span>10 (Black EVA / Duro)</span>
      </div>

      {totalVotos > 0 && (
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'right', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
          Basado en {totalVotos} {totalVotos === 1 ? 'voto comunitario verificado' : 'votos comunitarios verificados'}
        </span>
      )}
    </div>
  );
};
