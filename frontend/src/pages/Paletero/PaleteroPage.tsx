import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { paleteroApi } from '../../api/paletero';
import { useAuth } from '../../hooks/useAuth';
import type { MiPaleteroGrouped, PaleteroItem } from '../../types';
import { Skeleton } from '../../components/ui/Skeleton';
import { Briefcase, Trash2, Star, Award, Compass, LogIn, Plus } from 'lucide-react';

export const PaleteroPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [paletero, setPaletero] = useState<MiPaleteroGrouped | null>(null);
  const [loading, setLoading] = useState(true);

  const cargarPaletero = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      const data = await paleteroApi.getMiPaletero();
      setPaletero(data);
    } catch (err) {
      console.error('Error cargando paletero:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPaletero();
  }, [isAuthenticated]);

  const handleEliminar = async (palaId: number, categoria: string) => {
    if (!confirm('¿Deseás quitar esta pala de este compartimento?')) return;
    try {
      await paleteroApi.removeItem(palaId, categoria);
      await cargarPaletero();
    } catch (err) {
      console.error('Error al eliminar ítem:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="card-skeuomorphic animate-fade-in" style={{ padding: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <Briefcase size={48} color="var(--color-primary-sage)" />
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Mi Paletero Digital 🎒</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', fontSize: '0.92rem', lineHeight: 1.5 }}>
          Iniciá sesión para organizar tu paletero técnico, clasificar tus palas de torneo y gestionar tu historial de modelos con especificaciones detalladas.
        </p>
        <Link to="/login" className="btn-primary" style={{ marginTop: '8px' }}>
          <LogIn size={16} />
          <span>Iniciar Sesión</span>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Skeleton height="140px" borderRadius="var(--radius-lg)" />
        <Skeleton height="200px" borderRadius="var(--radius-md)" />
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
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{titulo}</h3>
        <span className="badge badge-neutral" style={{ marginLeft: 'auto' }}>
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
          }}
        >
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            No tenés ninguna pala guardada en este compartimento.
          </p>
          <Link to="/catalogo" style={{ fontSize: '0.82rem', color: 'var(--color-primary-sage)', fontWeight: 700, marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Plus size={14} />
            <span>Explorar catálogo para agregar</span>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {items.map((item) => (
            <div
              key={item.id}
              className="card-skeuomorphic"
              style={{
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                border: esTitular ? '1px solid var(--border-card-hover)' : '1px solid var(--border-card)',
                background: esTitular ? 'linear-gradient(135deg, rgba(82,183,136,0.08) 0%, var(--bg-card) 100%)' : 'var(--bg-card)',
              }}
            >
              {esTitular && (
                <span className="badge badge-sage" style={{ alignSelf: 'flex-start', fontSize: '0.68rem' }}>
                  ⭐ Pala Activa de Torneo
                </span>
              )}

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div
                  style={{
                    width: '74px',
                    height: '74px',
                    background: 'radial-gradient(circle, var(--bg-card-hover) 0%, var(--bg-deep) 100%)',
                    borderRadius: 'var(--radius-sm)',
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
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {item.palaMarca}
                  </span>
                  <Link to={`/palas/${item.palaId}`} style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.palaModelo}
                  </Link>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.palaForma}</span>
                </div>
              </div>

              {item.notas && (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', background: 'var(--bg-input)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                  💬 {item.notas}
                </p>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', marginTop: 'auto' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Guardada: {new Date(item.fechaRegistro).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleEliminar(item.palaId, item.categoria)}
                  style={{ color: 'var(--color-accent-terracotta)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 600 }}
                >
                  <Trash2 size={14} />
                  <span>Quitar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="animate-fade-in">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.9rem', fontWeight: 900 }}>Mi Paletero 🎒</h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
          Gestión técnica clasificada de tus palas titulares, suplentes, historial de modelos y lista de deseos.
        </p>
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
