import React from 'react';
import { Tag, ShieldCheck, HelpCircle } from 'lucide-react';

interface PrecioReferenciaBoxProps {
  precioReferencia: number;
  monedaPrecio?: string;
  fuentePrecio?: string;
  marcaNombre?: string;
}

export const PrecioReferenciaBox: React.FC<PrecioReferenciaBoxProps> = ({
  precioReferencia,
  monedaPrecio = 'EUR',
  fuentePrecio,
  marcaNombre = 'Fabricante Oficial',
}) => {
  const getSymbol = (moneda: string) => {
    switch (moneda.toUpperCase()) {
      case 'EUR':
        return '€';
      case 'USD':
        return 'USD $';
      case 'ARS':
        return 'ARS $';
      default:
        return moneda;
    }
  };

  const formattedPrice = precioReferencia.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const fuente = fuentePrecio || `PVP Oficial Recomendado ${marcaNombre}`;

  return (
    <div
      style={{
        padding: '18px 20px',
        background: 'var(--bg-card-subtle)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-card)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Tag size={14} color="var(--padel-court-blue-light)" />
          <span
            style={{
              fontSize: '0.74rem',
              fontWeight: 800,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
            }}
          >
            Precio de Referencia Oficial
          </span>
        </div>

        <span className="badge badge-steel" style={{ fontSize: '0.70rem', fontWeight: 800 }}>
          {monedaPrecio.toUpperCase()}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <span
          style={{
            fontSize: '2.1rem',
            fontWeight: 900,
            fontFamily: 'var(--font-serif)',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          {formattedPrice} {getSymbol(monedaPrecio)}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border-card)',
          paddingTop: '10px',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
          <ShieldCheck size={15} color="var(--padel-turf-green)" style={{ flexShrink: 0 }} />
          <span>
            Fuente: <strong style={{ color: 'var(--text-primary)' }}>{fuente}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.70rem', color: 'var(--text-muted)' }}>
          <HelpCircle size={13} />
          <span>PVP técnico homologado</span>
        </div>
      </div>
    </div>
  );
};
