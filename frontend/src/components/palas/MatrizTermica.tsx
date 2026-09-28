import React from 'react';
import { Sun, Snowflake, CloudSun, Home, ThermometerSnowflake, ShieldCheck } from 'lucide-react';

interface MatrizTermicaProps {
  dureza: number; // 1 a 10
  estacionOptima: string; // Verano, Invierno, TodoAno
  totalVotos?: number;
}

export const MatrizTermica: React.FC<MatrizTermicaProps> = ({
  dureza,
  estacionOptima,
  totalVotos = 0,
}) => {
  const percentage = Math.min(Math.max((dureza - 1) / 9, 0), 1) * 100;

  const getDurezaTexto = (val: number) => {
    if (val <= 3.5) return 'Tacto Blando / Confort & Salida';
    if (val <= 6.0) return 'Tacto Medio / Polivalente Equilibrado';
    if (val <= 8.0) return 'Tacto Firme / Semiduro';
    return 'Tacto Seco / Máxima Potencia en Remate';
  };

  // Calcular aptitud climática basada en la dureza y estación óptima
  const estNorm = (estacionOptima || 'TodoAno').toLowerCase();
  const isVerano = estNorm.includes('verano');
  const isInvierno = estNorm.includes('invierno');

  const veranoScore = isVerano ? 92 : isInvierno ? 48 : 82;
  const inviernoScore = isInvierno ? 94 : isVerano ? 45 : 80;
  const indoorScore = dureza <= 6 ? 88 : 80;
  const outdoorScore = dureza >= 6 ? 90 : 78;

  return (
    <div
      className="card-skeuomorphic"
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ThermometerSnowflake size={18} color="var(--padel-amber-rating)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Comportamiento Térmico & Escala de Dureza</h3>
          </div>
          <p style={{ fontSize: '0.80rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Termodinámica de la goma EVA: respuesta según temperatura ambiental y tipo de pista
          </p>
        </div>
        <span className="badge badge-amber" style={{ fontSize: '0.70rem' }}>
          Clima Óptimo: {estacionOptima}
        </span>
      </div>

      {/* Escala de Dureza Graduada */}
      <div
        style={{
          background: 'var(--bg-input)',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            Dureza Percibida en Pista
          </span>
          <strong style={{ fontSize: '0.94rem', color: 'var(--text-primary)' }}>
            {getDurezaTexto(dureza)} ({dureza.toFixed(1)} / 10)
          </strong>
        </div>

        {/* Barra con gradiente físico de blando a duro */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '14px',
            borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(90deg, #38BDF8 0%, #10B981 40%, #F59E0B 75%, #EF4444 100%)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.35)',
            margin: '4px 0',
          }}
        >
          {/* Indicador Físico */}
          <div
            style={{
              position: 'absolute',
              top: '-5px',
              left: `calc(${percentage}% - 12px)`,
              width: '24px',
              height: '24px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-card)',
              border: '3px solid var(--padel-court-blue-vibrant)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.45), 0 0 8px var(--padel-court-blue-glow)',
              transition: 'left 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          <span>1 (FOAM / Extra Blando)</span>
          <span>5 (MultiEVA Densidad Media)</span>
          <span>10 (Black EVA / Tabla Dura)</span>
        </div>
      </div>

      {/* Matriz Térmica Estacional (Verano vs Invierno & Indoor vs Outdoor) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        {/* Verano */}
        <div
          style={{
            padding: '14px 16px',
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sun size={16} color="var(--padel-amber-rating)" />
              <span style={{ fontSize: '0.80rem', fontWeight: 700 }}>Calor / Verano (&gt;25°C)</span>
            </div>
            <strong style={{ fontSize: '0.82rem', color: 'var(--padel-amber-rating)' }}>{veranoScore}%</strong>
          </div>
          <div
            style={{
              width: '100%',
              height: '6px',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${veranoScore}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #F59E0B, #EA580C)',
                borderRadius: 'var(--radius-full)',
              }}
            />
          </div>
          <span style={{ fontSize: '0.70rem', color: 'var(--text-muted)' }}>
            {dureza >= 6 ? 'La rigidez resiste el calor sin perder pegada' : 'La goma se ablanda; mayor control pero menor pegada'}
          </span>
        </div>

        {/* Invierno */}
        <div
          style={{
            padding: '14px 16px',
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Snowflake size={16} color="var(--padel-court-blue-light)" />
              <span style={{ fontSize: '0.80rem', fontWeight: 700 }}>Frío / Invierno (&lt;15°C)</span>
            </div>
            <strong style={{ fontSize: '0.82rem', color: 'var(--padel-court-blue-light)' }}>{inviernoScore}%</strong>
          </div>
          <div
            style={{
              width: '100%',
              height: '6px',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${inviernoScore}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #38BDF8, #2563EB)',
                borderRadius: 'var(--radius-full)',
              }}
            />
          </div>
          <span style={{ fontSize: '0.70rem', color: 'var(--text-muted)' }}>
            {dureza >= 8 ? 'Sensación de tabla con bola fría; exige buena técnica' : 'Mantiene elasticidad y salida de bola con frío'}
          </span>
        </div>

        {/* Pista Cubierta (Indoor) */}
        <div
          style={{
            padding: '14px 16px',
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Home size={16} color="var(--padel-turf-green)" />
              <span style={{ fontSize: '0.80rem', fontWeight: 700 }}>Pista Cubierta (Indoor)</span>
            </div>
            <strong style={{ fontSize: '0.82rem', color: 'var(--padel-turf-green)' }}>{indoorScore}%</strong>
          </div>
          <div
            style={{
              width: '100%',
              height: '6px',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${indoorScore}%`,
                height: '100%',
                background: 'var(--padel-turf-green)',
                borderRadius: 'var(--radius-full)',
              }}
            />
          </div>
          <span style={{ fontSize: '0.70rem', color: 'var(--text-muted)' }}>
            Condiciones estables sin incidencia de viento ni sol directo
          </span>
        </div>

        {/* Pista Exterior (Outdoor) */}
        <div
          style={{
            padding: '14px 16px',
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CloudSun size={16} color="var(--padel-court-blue-light)" />
              <span style={{ fontSize: '0.80rem', fontWeight: 700 }}>Pista Exterior (Outdoor)</span>
            </div>
            <strong style={{ fontSize: '0.82rem', color: 'var(--padel-court-blue-light)' }}>{outdoorScore}%</strong>
          </div>
          <div
            style={{
              width: '100%',
              height: '6px',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${outdoorScore}%`,
                height: '100%',
                background: 'var(--padel-court-blue-light)',
                borderRadius: 'var(--radius-full)',
              }}
            />
          </div>
          <span style={{ fontSize: '0.70rem', color: 'var(--text-muted)' }}>
            Apta para variación de humedad y juego con brisa
          </span>
        </div>
      </div>

      {totalVotos > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
          <ShieldCheck size={14} color="var(--padel-turf-green)" />
          <span>Matriz calculada en base a {totalVotos} {totalVotos === 1 ? 'voto comunitario' : 'votos comunitarios'} de jugadores.</span>
        </div>
      )}
    </div>
  );
};
