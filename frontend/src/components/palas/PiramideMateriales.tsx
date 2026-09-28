import React from 'react';
import { Layers, Disc, Box, Maximize2, Scale, Calendar } from 'lucide-react';

interface PiramideMaterialesProps {
  materialCaras: string;
  superficieRugosa: string;
  materialNucleo: string;
  forma: string;
  balanceMm: number;
  pesoMin: number;
  pesoMax: number;
  anoLanzamiento: number;
}

export const PiramideMateriales: React.FC<PiramideMaterialesProps> = ({
  materialCaras,
  superficieRugosa,
  materialNucleo,
  forma,
  balanceMm,
  pesoMin,
  pesoMax,
  anoLanzamiento,
}) => {
  return (
    <div
      className="card-skeuomorphic"
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} color="var(--padel-court-blue-vibrant)" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Pirámide de Construcción Técnica</h3>
        </div>
        <p style={{ fontSize: '0.80rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
          Anatomía de materiales escalonada: Caras (Salida), Núcleo (Corazón) y Geometría (Fondo)
        </p>
      </div>

      {/* Estructura Piramidal Escalonada de 3 Niveles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center', width: '100%' }}>
        {/* Nivel 1 (Superior): Mesodermo & Caras */}
        <div
          style={{
            width: '100%',
            maxWidth: '640px',
            background: 'linear-gradient(180deg, var(--bg-card-hover) 0%, var(--bg-card) 100%)',
            border: '1px solid var(--border-steel-highlight)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            boxShadow: 'var(--shadow-card)',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={16} color="var(--padel-court-blue-light)" />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--padel-court-blue-light)' }}>
                Nivel Superior • Mesodermo (Caras)
              </span>
            </div>
            <span className="badge badge-steel" style={{ fontSize: '0.68rem' }}>
              Impacto Inicial
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tejido de Carbono / Fibra:</span>
              <div style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                {materialCaras}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Acabado Superficial:</span>
              <div style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--padel-court-blue-light)', marginTop: '2px' }}>
                {superficieRugosa || 'Liso de Alto Brillo'}
              </div>
            </div>
          </div>
        </div>

        {/* Nivel 2 (Central): Alma & Núcleo */}
        <div
          style={{
            width: '100%',
            maxWidth: '780px',
            background: 'linear-gradient(180deg, var(--bg-card-hover) 0%, var(--bg-card) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Disc size={16} color="var(--padel-turf-green)" />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--padel-turf-green)' }}>
                Nivel Central • Alma (Núcleo Elástico)
              </span>
            </div>
            <span className="badge badge-sage" style={{ fontSize: '0.68rem' }}>
              Absorción & Rebote
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Composición de la Goma:</span>
              <div style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                {materialNucleo}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Respuesta Mecánica:</span>
              <div style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--padel-turf-green)', marginTop: '2px' }}>
                Recuperación Dinámica & Memoria
              </div>
            </div>
          </div>
        </div>

        {/* Nivel 3 (Base): Macro & Chasis */}
        <div
          style={{
            width: '100%',
            background: 'linear-gradient(180deg, var(--bg-card-hover) 0%, var(--bg-card) 100%)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Box size={16} color="var(--padel-amber-rating)" />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--padel-amber-rating)' }}>
                Nivel Base • Macro & Chasis (Estructura)
              </span>
            </div>
            <span className="badge badge-amber" style={{ fontSize: '0.68rem' }}>
              Geometría & Inercia
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Maximize2 size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: '0.70rem', color: 'var(--text-muted)' }}>Molde:</span>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {forma}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Scale size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: '0.70rem', color: 'var(--text-muted)' }}>Balance / Inercia:</span>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {balanceMm} mm
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Scale size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: '0.70rem', color: 'var(--text-muted)' }}>Rango de Peso:</span>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {pesoMin}-{pesoMax} g
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: '0.70rem', color: 'var(--text-muted)' }}>Colección:</span>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {anoLanzamiento}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
