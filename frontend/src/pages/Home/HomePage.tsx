import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { palasApi } from '../../api/palas';
import { noticiasApi } from '../../api/noticias';
import type { Pala, Noticia } from '../../types';
import { PalaCard } from '../../components/ui/PalaCard';
import { PalaCardSkeleton, Skeleton } from '../../components/ui/Skeleton';
import { ArrowRight, Flame, Newspaper, Sparkles, ChevronRight, Award, Compass, ShieldCheck } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [palasDestacadas, setPalasDestacadas] = useState<Pala[]>([]);
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loadingPalas, setLoadingPalas] = useState(true);
  const [loadingNoticias, setLoadingNoticias] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const palasRes = await palasApi.getPalas({ pageSize: 4, orderBy: 'puntuacion' });
        setPalasDestacadas(palasRes.items);
      } catch (err) {
        console.error('Error cargando palas destacadas:', err);
      } finally {
        setLoadingPalas(false);
      }

      try {
        const noticiasRes = await noticiasApi.getNoticias(4);
        setNoticias(noticiasRes);
      } catch (err) {
        console.error('Error cargando noticias:', err);
      } finally {
        setLoadingNoticias(false);
      }
    }

    loadData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="animate-fade-in">
      {/* Hero Banner Deportivo Técnico */}
      <section
        style={{
          position: 'relative',
          padding: '40px 32px',
          background: 'radial-gradient(ellipse at top right, rgba(82, 183, 136, 0.14) 0%, var(--bg-card) 65%)',
          border: '1px solid var(--border-card-hover)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card-elevated)',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '680px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '5px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(82, 183, 136, 0.12)',
              border: '1px solid rgba(82, 183, 136, 0.35)',
              color: 'var(--color-primary-sage)',
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '16px',
            }}
          >
            <Sparkles size={14} />
            <span>Enciclopedia Técnica & Comparador Oficial de Pádel</span>
          </div>

          <h1
            style={{
              fontSize: '2.4rem',
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              marginBottom: '14px',
              color: 'var(--text-primary)',
            }}
          >
            Descubrí la pala perfecta para tu estilo de juego.
          </h1>

          <p
            style={{
              fontSize: '0.96rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.55,
              marginBottom: '28px',
            }}
          >
            Fichas técnicas sagradas, análisis de comportamiento térmico en pista, radar de atributos y motor de similitud vectorial para encontrar alternativas directas a cualquier pala del circuito.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
            <Link to="/catalogo" className="btn-primary">
              <span>Explorar Catálogo</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/padelgram" className="btn-secondary">
              <Compass size={16} />
              <span>Ver Padelgram</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Sección Noticias de Pádel */}
      <section>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Newspaper size={20} color="var(--color-primary-sage)" />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Actualidad & Noticias</h2>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Padel Tech Feed</span>
        </div>

        {loadingNoticias ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card-skeuomorphic" style={{ padding: '16px' }}>
                <Skeleton height="140px" borderRadius="var(--radius-sm)" style={{ marginBottom: '12px' }} />
                <Skeleton width="40%" height="16px" style={{ marginBottom: '8px' }} />
                <Skeleton width="90%" height="20px" style={{ marginBottom: '8px' }} />
                <Skeleton width="100%" height="14px" />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {noticias.map((item) => (
              <article
                key={item.id}
                className="card-skeuomorphic"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '16px',
                }}
              >
                {item.imagenUrl && (
                  <div
                    style={{
                      height: '140px',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      marginBottom: '12px',
                    }}
                  >
                    <img
                      src={item.imagenUrl}
                      alt={item.titulo}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className="badge badge-sage" style={{ fontSize: '0.65rem' }}>
                    {item.categoria}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {item.tiempoLecturaMinutos} min lectura
                  </span>
                </div>
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    lineHeight: 1.35,
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                  }}
                >
                  {item.titulo}
                </h3>
                <p
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.45,
                    flex: 1,
                    marginBottom: '12px',
                  }}
                >
                  {item.resumen}
                </p>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '8px',
                  }}
                >
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.fuente}</span>
                  {item.urlFuente && (
                    <a
                      href={item.urlFuente}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--color-primary-sage)',
                      }}
                    >
                      <span>Leer</span>
                      <ChevronRight size={14} />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Sección Palas Mejor Puntuadas */}
      <section>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Flame size={20} color="var(--color-accent-amber)" />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Palas Más Valoradas</h2>
          </div>
          <Link
            to="/catalogo"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--color-primary-sage)',
              fontSize: '0.85rem',
              fontWeight: 700,
            }}
          >
            <span>Ver catálogo completo</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        {loadingPalas ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <PalaCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {palasDestacadas.map((pala) => (
              <PalaCard key={pala.id} pala={pala} />
            ))}
          </div>
        )}
      </section>

      {/* Callout de Mi Paletero */}
      <section
        className="card-skeuomorphic"
        style={{
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          borderLeft: '4px solid var(--color-primary-sage)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={24} color="var(--color-primary-sage)" />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Armá tu Paletero Digital</h3>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: '720px' }}>
          Registrá la pala con la que competís actualmente, guardá tus palas de reserva y creá tu lista de deseos con notas técnicas personalizadas y comparativas directas.
        </p>
        <div style={{ marginTop: '4px' }}>
          <Link to="/paletero" className="btn-primary" style={{ padding: '9px 20px', fontSize: '0.88rem' }}>
            <Award size={16} />
            <span>Gestionar Mi Paletero</span>
          </Link>
        </div>
      </section>
    </div>
  );
};
