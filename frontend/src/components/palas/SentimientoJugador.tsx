import React, { useState } from 'react';
import { Heart, ThumbsUp, MinusCircle, AlertTriangle, ThumbsDown, MessageSquareHeart, CheckCircle2 } from 'lucide-react';

interface SentimientoJugadorProps {
  palaId: number;
  puntuacionGeneral?: number;
  totalVotos?: number;
  onVotoSentimiento?: (sentimiento: string) => void;
}

interface SentimentOption {
  id: string;
  label: string;
  descripcion: string;
  icon: React.ComponentType<{ size?: number; color?: string; style?: React.CSSProperties }>;
  color: string;
  bgColor: string;
  porcentaje: number;
  conteo: number;
}

export const SentimientoJugador: React.FC<SentimientoJugadorProps> = ({
  palaId: _palaId,
  puntuacionGeneral = 4.8,
  totalVotos = 34,
  onVotoSentimiento,
}) => {
  const [selectedSentiment, setSelectedSentiment] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  // Opciones comunitarias de Sentimiento del Jugador en 5 niveles biomecánicos (sin emojis)
  const initialSentiments: SentimentOption[] = [
    {
      id: 'amor',
      label: 'Amor a Primer Smash',
      descripcion: 'La pala definitiva de mi juego; conexión total desde el primer golpe',
      icon: Heart,
      color: '#A3E635',
      bgColor: 'rgba(163, 230, 53, 0.14)',
      porcentaje: 62,
      conteo: Math.round(totalVotos * 0.62),
    },
    {
      id: 'gran-pala',
      label: 'Gran Pala',
      descripcion: 'Rendimiento sólido y confiable; excelente herramienta competitiva',
      icon: ThumbsUp,
      color: '#38BDF8',
      bgColor: 'rgba(56, 189, 248, 0.14)',
      porcentaje: 24,
      conteo: Math.round(totalVotos * 0.24),
    },
    {
      id: 'correcta',
      label: 'Correcta',
      descripcion: 'Cumple sin destacar; le falta personalidad en momentos clave',
      icon: MinusCircle,
      color: '#94A3B8',
      bgColor: 'rgba(148, 163, 184, 0.14)',
      porcentaje: 8,
      conteo: Math.round(totalVotos * 0.08),
    },
    {
      id: 'exigente',
      label: 'Exigente / Difícil',
      descripcion: 'Punto dulce estrecho o balance muy cabezón; exige brazo entrenado',
      icon: AlertTriangle,
      color: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.14)',
      porcentaje: 4,
      conteo: Math.round(totalVotos * 0.04),
    },
    {
      id: 'no-recomendada',
      label: 'No Recomendada',
      descripcion: 'Tacto sordo, vibración molesta o desbalance estructural',
      icon: ThumbsDown,
      color: '#EF4444',
      bgColor: 'rgba(239, 68, 68, 0.14)',
      porcentaje: 2,
      conteo: Math.round(totalVotos * 0.02),
    },
  ];

  const [sentiments, setSentiments] = useState(initialSentiments);

  const handleVote = (sentimentId: string) => {
    if (hasVoted) return;

    setSelectedSentiment(sentimentId);
    setHasVoted(true);

    setSentiments((prev) =>
      prev.map((s) => {
        if (s.id === sentimentId) {
          return { ...s, conteo: s.conteo + 1, porcentaje: Math.min(100, s.porcentaje + 1) };
        }
        return s;
      })
    );

    if (onVotoSentimiento) {
      onVotoSentimiento(sentimentId);
    }
  };

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquareHeart size={18} color="var(--padel-turf-green)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Sentimiento del Jugador</h3>
          </div>
          <p style={{ fontSize: '0.80rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Votación comunitaria de rendimiento: ¿cómo responde esta pala en tus manos? ({puntuacionGeneral.toFixed(1)} / 5)
          </p>
        </div>

        {hasVoted && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--padel-turf-green)', fontSize: '0.78rem', fontWeight: 700 }}>
            <CheckCircle2 size={16} />
            <span>¡Voto registrado!</span>
          </div>
        )}
      </div>

      {/* Botones de Votación Rápida */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
        {sentiments.map((s) => {
          const Icon = s.icon;
          const isSelected = selectedSentiment === s.id;

          return (
            <button
              key={s.id}
              onClick={() => handleVote(s.id)}
              disabled={hasVoted}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 8px',
                borderRadius: 'var(--radius-sm)',
                background: isSelected ? s.bgColor : 'var(--bg-input)',
                border: isSelected ? `2px solid ${s.color}` : '1px solid var(--border-subtle)',
                color: isSelected ? s.color : 'var(--text-primary)',
                cursor: hasVoted ? 'default' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? `0 0 14px ${s.bgColor}` : 'none',
              }}
              onMouseEnter={(e) => {
                if (!hasVoted) e.currentTarget.style.borderColor = s.color;
              }}
              onMouseLeave={(e) => {
                if (!hasVoted && !isSelected) e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
            >
              <Icon size={20} color={s.color} />
              <span style={{ fontSize: '0.74rem', fontWeight: 800, textAlign: 'center', lineHeight: 1.2 }}>
                {s.label}
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                {s.porcentaje}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Barras de Desglose Porcentual Comunitario */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
        {sentiments.map((s) => {
          const Icon = s.icon;

          return (
            <div key={s.id} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Icon size={12} color={s.color} />
                  <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{s.label}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', color: 'var(--text-muted)' }}>
                  <span>{s.conteo} votos</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{s.porcentaje}%</strong>
                </div>
              </div>

              <div
                style={{
                  width: '100%',
                  height: '6px',
                  background: 'var(--bg-input)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  style={{
                    width: `${s.porcentaje}%`,
                    height: '100%',
                    background: s.color,
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 0.6s ease',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
