import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { palasApi } from '../../api/palas';
import { noticiasApi } from '../../api/noticias';
import { padelgramApi } from '../../api/padelgram';
import type { Pala, Noticia, PadelgramPost } from '../../types';
import { PalaCard } from '../../components/ui/PalaCard';
import { PalaCardSkeleton, Skeleton } from '../../components/ui/Skeleton';
import { PalaFinderModal } from '../../components/palas/PalaFinderModal';
import {
  ArrowRight,
  ArrowLeftRight,
  Flame,
  Newspaper,
  Sparkles,
  ChevronRight,
  Award,
  Compass,
  ShieldCheck,
  Camera,
  Search
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const [palasDestacadas, setPalasDestacadas] = useState<Pala[]>([]);
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [padelgramPosts, setPadelgramPosts] = useState<PadelgramPost[]>([]);
  const [heroSearch, setHeroSearch] = useState('');
  const [showFinder, setShowFinder] = useState(false);
  const [loadingPalas, setLoadingPalas] = useState(true);
  const [loadingNoticias, setLoadingNoticias] = useState(true);
  const [loadingPadelgram, setLoadingPadelgram] = useState(true);

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

      try {
        const padelgramRes = await padelgramApi.getFeed(1, 4);
        setPadelgramPosts(padelgramRes.items);
      } catch (err) {
        console.error('Error cargando Padelgram posts:', err);
      } finally {
        setLoadingPadelgram(false);
      }
    }

    loadData();
  }, []);

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/catalogo?search=${encodeURIComponent(heroSearch.trim())}`);
    } else {
      navigate('/catalogo');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px', width: '100%' }} className="animate-fade-in">
      {/* Hero Banner Revista Deportiva Full-Width */}
      <section
        style={{
          position: 'relative',
          padding: '48px 36px',
          background: 'radial-gradient(ellipse at top right, rgba(37, 99, 235, 0.22) 0%, var(--bg-card) 70%)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card-elevated)',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '780px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(37, 99, 235, 0.15)',
              border: '1px solid var(--border-accent)',
              color: 'var(--padel-court-blue-light)',
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '18px',
            }}
          >
            <Sparkles size={14} />
            <span>Palantica • La Enciclopedia Técnica y Sensorial del Pádel</span>
          </div>

          <h1
            style={{
              fontSize: '2.6rem',
              fontWeight: 900,
              lineHeight: 1.12,
              letterSpacing: '-0.03em',
              marginBottom: '14px',
              color: 'var(--text-primary)',
            }}
          >
            Descubrí la pala ideal para tu personalidad en pista.
          </h1>

          <p
            style={{
              fontSize: '0.98rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: '28px',
              maxWidth: '680px',
            }}
          >
            Fichas técnicas sagradas, pirámide de construcción de materiales, acuerdos sensoriales apilados, comportamiento térmico y similitud vectorial entre palas del circuito.
          </p>

          {/* Buscador Rápido Integrado en Hero */}
          <form
            onSubmit={handleHeroSearchSubmit}
            style={{
              display: 'flex',
              gap: '10px',
              maxWidth: '560px',
              marginBottom: '24px',
            }}
          >
            <div style={{ position: 'relative', flex: 1 }}>
              <Search
                size={18}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                placeholder="Buscar por modelo, carbono, goma o jugador pro..."
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                className="input-field"
                style={{
                  paddingLeft: '44px',
                  height: '46px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.90rem',
                }}
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              style={{
                padding: '0 24px',
                height: '46px',
                borderRadius: 'var(--radius-full)',
                flexShrink: 0,
              }}
            >
              <span>Buscar</span>
              <ArrowRight size={15} />
            </button>
          </form>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setShowFinder(true)}
              className="btn-primary"
              style={{ borderRadius: '0px', padding: '11px 20px' }}
            >
              <Sparkles size={16} />
              <span>Pala Finder • Quiz Sensorial</span>
            </button>
            <Link to="/comparador" className="btn-secondary" style={{ borderRadius: '0px', padding: '11px 18px' }}>
              <ArrowLeftRight size={16} />
              <span>Comparador A/B</span>
            </Link>
            <Link to="/catalogo" className="btn-secondary" style={{ borderRadius: '0px', padding: '11px 18px' }}>
              <Compass size={16} />
              <span>Ver Catálogo</span>
            </Link>
            <Link to="/padelgram" className="btn-secondary" style={{ borderRadius: '0px', padding: '11px 18px' }}>
              <Camera size={16} />
              <span>Muro Padelgram</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Sección 1: Noticias & Análisis Técnico de Material (Fotografía Auténtica) */}
      <section>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '18px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Newspaper size={20} color="var(--padel-court-blue-vibrant)" />
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>Actualidad & Análisis de Laboratorio</h2>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Padel Tech Feed</span>
        </div>

        {loadingNoticias ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card-skeuomorphic" style={{ padding: '16px' }}>
                <Skeleton height="150px" borderRadius="var(--radius-sm)" style={{ marginBottom: '12px' }} />
                <Skeleton width="40%" height="16px" style={{ marginBottom: '8px' }} />
                <Skeleton width="90%" height="20px" style={{ marginBottom: '8px' }} />
                <Skeleton width="100%" height="14px" />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
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
                      height: '160px',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      marginBottom: '12px',
                      border: '1px solid var(--border-subtle)',
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="badge badge-steel" style={{ fontSize: '0.68rem' }}>
                    {item.categoria}
                  </span>
                  <span style={{ fontSize: '0.70rem', color: 'var(--text-muted)' }}>
                    {item.tiempoLecturaMinutos} min lectura
                  </span>
                </div>
                <h3
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    lineHeight: 1.35,
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                  }}
                >
                  {item.titulo}
                </h3>
                <p
                  style={{
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                    flex: 1,
                    marginBottom: '14px',
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
                    paddingTop: '10px',
                  }}
                >
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.fuente}</span>
                  {item.urlFuente && (
                    <a
                      href={item.urlFuente}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        color: 'var(--padel-court-blue-vibrant)',
                      }}
                    >
                      <span>Leer artículo</span>
                      <ChevronRight size={14} />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Sección 2: Palas Más Valoradas por la Comunidad */}
      <section>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '18px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Flame size={20} color="var(--padel-amber-rating)" />
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>Palas Más Valoradas</h2>
          </div>
          <Link
            to="/catalogo"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--padel-court-blue-vibrant)',
              fontSize: '0.85rem',
              fontWeight: 700,
            }}
          >
            <span>Ver catálogo completo</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        {loadingPalas ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <PalaCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {palasDestacadas.map((pala) => (
              <PalaCard key={pala.id} pala={pala} />
            ))}
          </div>
        )}
      </section>

      {/* Sección 3: Muro Padelgram en Pista (Social Feed) */}
      {padelgramPosts.length > 0 && (
        <section>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '18px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Camera size={20} color="var(--padel-turf-green)" />
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>Padelgram: La Comunidad en Pista</h2>
            </div>
            <Link
              to="/padelgram"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--padel-turf-green)',
                fontSize: '0.85rem',
                fontWeight: 700,
              }}
            >
              <span>Explorar Padelgram</span>
              <ChevronRight size={16} />
            </Link>
          </div>

          {loadingPadelgram ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card-skeuomorphic" style={{ padding: '12px' }}>
                  <Skeleton height="180px" borderRadius="var(--radius-sm)" />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
              {padelgramPosts.map((post) => (
              <div
                key={post.id}
                className="card-skeuomorphic"
                style={{
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div
                  style={{
                    height: '180px',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <img
                    src={post.imagenUrl}
                    alt={post.palaModelo}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: '6px 10px',
                      background: 'linear-gradient(transparent, rgba(10, 17, 40, 0.9))',
                      color: '#FFFFFF',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                    }}
                  >
                    @{post.usuarioNombre} • {post.palaModelo}
                  </div>
                </div>

                {post.descripcion && (
                  <p style={{ fontSize: '0.80rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    "{post.descripcion}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    )}

      {/* Sección 4: Callout de Mi Paletero Digital */}
      <section
        className="card-skeuomorphic"
        style={{
          padding: '28px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          borderLeft: '5px solid var(--padel-turf-green)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={26} color="var(--padel-turf-green)" />
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Armá tu Paletero Digital</h3>
        </div>
        <p style={{ fontSize: '0.90rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '780px' }}>
          Registrá tu pala titular de competición, organizá tus reservas en el paletero y construí tu lista de deseos con notas técnicas personalizadas, telemetría de rendimiento y comparativa instantánea.
        </p>
        <div style={{ marginTop: '6px' }}>
          <Link to="/paletero" className="btn-primary" style={{ padding: '10px 22px', fontSize: '0.90rem', borderRadius: '0px' }}>
            <Award size={16} />
            <span>Gestionar Mi Paletero</span>
          </Link>
        </div>
      </section>

      <PalaFinderModal isOpen={showFinder} onClose={() => setShowFinder(false)} />
    </div>
  );
};
