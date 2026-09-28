import React from 'react';

interface RadarData {
  potencia: number;
  control: number;
  salidaBola: number;
  maniobrabilidad: number;
  puntoDulce: number;
  confort: number;
}

interface RadarChartProps {
  data: RadarData;
  size?: number;
}

export const RadarChart: React.FC<RadarChartProps> = ({ data, size = 320 }) => {
  const center = size / 2;
  const radius = (size / 2) - 45;

  const axes = [
    { label: 'Potencia', value: data.potencia },
    { label: 'Control', value: data.control },
    { label: 'Salida Bola', value: data.salidaBola },
    { label: 'Maniobra', value: data.maniobrabilidad },
    { label: 'Pto. Dulce', value: data.puntoDulce },
    { label: 'Confort', value: data.confort },
  ];

  const totalAxes = axes.length;
  const angleSlice = (Math.PI * 2) / totalAxes;

  // Círculos concéntricos de referencia (niveles 2, 4, 6, 8, 10)
  const levels = [2, 4, 6, 8, 10];

  // Cálculo de puntos poligonales de los datos
  const points = axes.map((axis, i) => {
    const normalizedValue = Math.min(Math.max(axis.value, 0), 10) / 10;
    const r = normalizedValue * radius;
    const angle = i * angleSlice - Math.PI / 2;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

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
        style={{ overflow: 'visible' }}
      >
        <defs>
          <radialGradient id="radarSageGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(82, 183, 136, 0.40)" />
            <stop offset="100%" stopColor="rgba(82, 183, 136, 0.04)" />
          </radialGradient>
        </defs>

        {/* Círculos / Polígonos de Nivel de Fondo */}
        {levels.map((level) => {
          const levelRadius = (level / 10) * radius;
          const levelPoints = Array.from({ length: totalAxes }).map((_, i) => {
            const angle = i * angleSlice - Math.PI / 2;
            const x = center + levelRadius * Math.cos(angle);
            const y = center + levelRadius * Math.sin(angle);
            return `${x},${y}`;
          }).join(' ');

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
        {axes.map((axis, i) => {
          const angle = i * angleSlice - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);

          // Posición de etiquetas de texto
          const labelDistance = radius + 22;
          const lx = center + labelDistance * Math.cos(angle);
          const ly = center + labelDistance * Math.sin(angle);

          return (
            <g key={axis.label}>
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
                y={ly}
                textAnchor="middle"
                dominantBaseline="central"
                fill="var(--text-secondary)"
                fontSize="11"
                fontWeight="600"
                fontFamily="var(--font-sans)"
              >
                {axis.label}
              </text>
              <text
                x={lx}
                y={ly + 13}
                textAnchor="middle"
                dominantBaseline="central"
                fill="var(--color-primary-sage)"
                fontSize="10"
                fontWeight="800"
              >
                {axis.value.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* Polígono de Datos con Relleno de Iluminación Suave */}
        <polygon
          points={points}
          fill="url(#radarSageGlow)"
          stroke="var(--color-primary-sage)"
          strokeWidth="2.5"
          style={{
            filter: 'drop-shadow(0 2px 10px rgba(82, 183, 136, 0.35))',
            transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />

        {/* Vértices con Nódulos Táctiles */}
        {axes.map((axis, i) => {
          const normalizedValue = Math.min(Math.max(axis.value, 0), 10) / 10;
          const r = normalizedValue * radius;
          const angle = i * angleSlice - Math.PI / 2;
          const x = center + r * Math.cos(angle);
          const y = center + r * Math.sin(angle);

          return (
            <circle
              key={axis.label}
              cx={x}
              cy={y}
              r="4.5"
              fill="var(--bg-card)"
              stroke="var(--color-primary-sage)"
              strokeWidth="2.5"
            />
          );
        })}
      </svg>
    </div>
  );
};
