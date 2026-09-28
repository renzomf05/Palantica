import React from 'react';

export interface DualRadarData {
  potencia: number;
  control: number;
  salidaBola: number;
  maniobrabilidad: number;
  puntoDulce: number;
  confort: number;
}

interface DualRadarChartProps {
  data1: DualRadarData;
  label1: string;
  data2?: DualRadarData | null;
  label2?: string;
  size?: number;
}

export const DualRadarChart: React.FC<DualRadarChartProps> = ({
  data1,
  label1,
  data2,
  label2,
  size = 360,
}) => {
  const center = size / 2;
  const radius = size / 2 - 50;

  const axesConfig = [
    { key: 'potencia' as const, label: 'Potencia' },
    { key: 'control' as const, label: 'Control' },
    { key: 'salidaBola' as const, label: 'Salida Bola' },
    { key: 'maniobrabilidad' as const, label: 'Maniobra' },
    { key: 'puntoDulce' as const, label: 'Pto. Dulce' },
    { key: 'confort' as const, label: 'Confort' },
  ];

  const totalAxes = axesConfig.length;
  const angleSlice = (Math.PI * 2) / totalAxes;

  // Niveles de referencia 2, 4, 6, 8, 10
  const levels = [2, 4, 6, 8, 10];

  // Cálculo poligonal de Pala 1 (Azul Cancha)
  const points1 = axesConfig
    .map((axis, i) => {
      const val = Math.min(Math.max(data1[axis.key] || 0, 0), 10) / 10;
      const r = val * radius;
      const angle = i * angleSlice - Math.PI / 2;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return `${x},${y}`;
    })
    .join(' ');

  // Cálculo poligonal de Pala 2 (Amarillo Volt)
  const points2 = data2
    ? axesConfig
        .map((axis, i) => {
          const val = Math.min(Math.max(data2[axis.key] || 0, 0), 10) / 10;
          const r = val * radius;
          const angle = i * angleSlice - Math.PI / 2;
          const x = center + r * Math.cos(angle);
          const y = center + r * Math.sin(angle);
          return `${x},${y}`;
        })
        .join(' ')
    : null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        userSelect: 'none',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ overflow: 'visible', maxWidth: '100%' }}
      >
        <defs>
          {/* Gradiente Azul Cancha */}
          <linearGradient id="gradPala1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.15" />
          </linearGradient>

          {/* Gradiente Amarillo Volt */}
          <linearGradient id="gradPala2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A3E635" stopOpacity="0.50" />
            <stop offset="100%" stopColor="#65A30D" stopOpacity="0.20" />
          </linearGradient>
        </defs>

        {/* Círculos concéntricos de referencia */}
        {levels.map((level) => {
          const levelRadius = (level / 10) * radius;
          const levelPoints = Array.from({ length: totalAxes })
            .map((_, i) => {
              const angle = i * angleSlice - Math.PI / 2;
              const x = center + levelRadius * Math.cos(angle);
              const y = center + levelRadius * Math.sin(angle);
              return `${x},${y}`;
            })
            .join(' ');

          return (
            <polygon
              key={level}
              points={levelPoints}
              fill="none"
              stroke="var(--border-card)"
              strokeWidth="1"
              strokeDasharray={level === 10 ? 'none' : '3 3'}
            />
          );
        })}

        {/* Ejes Radiales */}
        {axesConfig.map((axis, i) => {
          const angle = i * angleSlice - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);

          const labelDistance = radius + 26;
          const lx = center + labelDistance * Math.cos(angle);
          const ly = center + labelDistance * Math.sin(angle);

          const val1 = (data1[axis.key] || 0).toFixed(1);
          const val2 = data2 ? (data2[axis.key] || 0).toFixed(1) : null;

          return (
            <g key={axis.key}>
              <line
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="var(--border-subtle)"
                strokeWidth="1.2"
              />
              <text
                x={lx}
                y={ly - 5}
                textAnchor="middle"
                dominantBaseline="central"
                fill="var(--text-secondary)"
                fontSize="11"
                fontWeight="700"
                fontFamily="var(--font-sans)"
              >
                {axis.label}
              </text>
              <text
                x={lx}
                y={ly + 10}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="10"
                fontWeight="800"
                fontFamily="var(--font-sans)"
              >
                <tspan fill="#2563EB">{val1}</tspan>
                {val2 && (
                  <>
                    <tspan fill="var(--text-muted)"> | </tspan>
                    <tspan fill="#A3E635">{val2}</tspan>
                  </>
                )}
              </text>
            </g>
          );
        })}

        {/* Polígono 1 (Azul Cancha) */}
        <polygon
          points={points1}
          fill="url(#gradPala1)"
          stroke="#2563EB"
          strokeWidth="2.5"
          style={{ transition: 'all 0.3s ease' }}
        />

        {/* Polígono 2 (Amarillo Volt) */}
        {points2 && (
          <polygon
            points={points2}
            fill="url(#gradPala2)"
            stroke="#A3E635"
            strokeWidth="2.5"
            style={{ transition: 'all 0.3s ease' }}
          />
        )}

        {/* Vértices Pala 1 */}
        {axesConfig.map((axis, i) => {
          const val = Math.min(Math.max(data1[axis.key] || 0, 0), 10) / 10;
          const r = val * radius;
          const angle = i * angleSlice - Math.PI / 2;
          const x = center + r * Math.cos(angle);
          const y = center + r * Math.sin(angle);
          return (
            <circle
              key={`dot1-${axis.key}`}
              cx={x}
              cy={y}
              r="4"
              fill="#2563EB"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Vértices Pala 2 */}
        {data2 &&
          axesConfig.map((axis, i) => {
            const val = Math.min(Math.max(data2[axis.key] || 0, 0), 10) / 10;
            const r = val * radius;
            const angle = i * angleSlice - Math.PI / 2;
            const x = center + r * Math.cos(angle);
            const y = center + r * Math.sin(angle);
            return (
              <circle
                key={`dot2-${axis.key}`}
                cx={x}
                cy={y}
                r="4"
                fill="#A3E635"
                stroke="#0A1128"
                strokeWidth="1.5"
              />
            );
          })}
      </svg>

      {/* Leyenda Técnica */}
      <div
        style={{
          display: 'flex',
          gap: '24px',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '16px',
          padding: '8px 16px',
          background: 'var(--bg-input)',
          border: '1px solid var(--border-card)',
          borderRadius: '0px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '14px',
              height: '14px',
              background: '#2563EB',
              borderRadius: '0px',
              border: '1px solid #FFFFFF',
            }}
          />
          <span style={{ fontSize: '0.80rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {label1} (Azul Cancha)
          </span>
        </div>

        {label2 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '14px',
                height: '14px',
                background: '#A3E635',
                borderRadius: '0px',
                border: '1px solid #0A1128',
              }}
            />
            <span style={{ fontSize: '0.80rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {label2} (Amarillo Volt)
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
