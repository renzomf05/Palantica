import React from 'react';
import { Link } from 'react-router-dom';
import type { Pala } from '../../types';
import { Star, Layers, Disc, Zap, Shield } from 'lucide-react';

interface PalaCardProps {
  pala: Pala;
}

export const PalaCard: React.FC<PalaCardProps> = ({ pala }) => {
  return (
    <Link
      to={`/palas/${pala.id}`}
      className="card-skeuomorphic animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '16px',
        textDecoration: 'none',
        height: '100%',
        userSelect: 'none',
      }}
    >
      {/* Contenedor de Imagen de Producto con Iluminación Superior y Pedestal */}
      <div
        style={{
          width: '100%',
          height: '220px',
          background: 'radial-gradient(ellipse at 50% 30%, var(--bg-card-hover) 0%, var(--bg-input) 100%)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '14px',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        }}
      >
        <img
          src={pala.imagenUrl || 'https://noxsport.es/cdn/shop/files/PALA_NOX_AT10_GENIUS_18K_BY_AGUSTIN_TAPIA_2025_01.png'}
          alt={pala.modelo}
          loading="lazy"
          style={{
            maxWidth: '82%',
            maxHeight: '82%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 12px 18px rgba(0,0,0,0.5))',
            transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06) rotate(-2deg)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1) rotate(0deg)')}
        />

        {/* Badges Superiores */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            display: 'flex',
            gap: '6px',
          }}
        >
          <span className="badge badge-neutral">{pala.forma}</span>
          {pala.jugadorPro && (
            <span className="badge badge-sage" style={{ fontSize: '0.65rem' }}>
              PRO
            </span>
          )}
        </div>

        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(11, 15, 23, 0.85)',
              backdropFilter: 'blur(8px)',
              padding: '4px 8px',
              borderRadius: 'var(--radius-full)',
              color: 'var(--color-accent-amber)',
              fontSize: '0.80rem',
              fontWeight: 800,
              border: '1px solid var(--border-subtle)',
            }}
          >
            <Star size={12} fill="var(--color-accent-amber)" />
            <span>{pala.puntuacionGeneral.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Fabricante y Modelo */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            {pala.marcaNombre}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {pala.anoLanzamiento}
          </span>
        </div>

        <h3
          style={{
            fontSize: '1.08rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            marginTop: '3px',
            lineHeight: 1.25,
          }}
        >
          {pala.modelo}
        </h3>

        {pala.jugadorPro ? (
          <span style={{ fontSize: '0.75rem', color: 'var(--color-primary-sage)', fontWeight: 600, marginTop: '2px' }}>
            Empuñada por {pala.jugadorPro}
          </span>
        ) : (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Balance {pala.balanceMm} mm • {pala.pesoMin}-{pala.pesoMax}g
          </span>
        )}

        {/* Especificación de Materiales de Caras y Núcleo */}
        <div
          style={{
            marginTop: '12px',
            padding: '10px 12px',
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', overflow: 'hidden' }}>
            <Layers size={13} color="var(--color-accent-steel)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              Caras:
            </span>
            <strong
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {pala.materialCaras}
            </strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', overflow: 'hidden' }}>
            <Disc size={13} color="var(--color-primary-sage)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              Núcleo:
            </span>
            <strong
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {pala.materialNucleo}
            </strong>
          </div>
        </div>

        {/* Métricas Rápidas y Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 'auto',
            paddingTop: '12px',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
              <Zap size={12} color="var(--color-primary-sage)" />
              <span style={{ color: 'var(--text-muted)' }}>Pot:</span>
              <strong>{pala.potenciaPromedio.toFixed(1)}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
              <Shield size={12} color="var(--color-accent-steel)" />
              <span style={{ color: 'var(--text-muted)' }}>Ctrl:</span>
              <strong>{pala.controlPromedio.toFixed(1)}</strong>
            </div>
          </div>

          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {pala.totalResenas} {pala.totalResenas === 1 ? 'review' : 'reviews'}
          </span>
        </div>
      </div>
    </Link>
  );
};
