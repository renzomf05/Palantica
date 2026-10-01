import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { padelgramApi } from '../../api/padelgram';
import { palasApi } from '../../api/palas';
import { useAuth } from '../../hooks/useAuth';
import type { PadelgramPost, Pala } from '../../types';
import { Skeleton } from '../../components/ui/Skeleton';
import { Heart, Camera, MapPin, Tag, Plus, X } from 'lucide-react';

export const PadelgramPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<PadelgramPost[]>([]);
  const [palas, setPalas] = useState<Pala[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Formulario
  const [selectedPalaId, setSelectedPalaId] = useState<number>(1);
  const [imagenUrl, setImagenUrl] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

  const cargarFeed = React.useCallback(async () => {
    try {
      const response = await padelgramApi.getFeed(1, 24);
      setPosts(response.items);
    } catch (err) {
      console.error('Error cargando feed de Padelgram:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      cargarFeed();
    }, 0);
    async function loadPalasSelector() {
      try {
        const res = await palasApi.getPalas({ pageSize: 50 });
        setPalas(res.items);
        if (res.items.length > 0) setSelectedPalaId(res.items[0].id);
      } catch (err) {
        console.error('Error cargando selector de palas:', err);
      }
    }
    loadPalasSelector();
    return () => clearTimeout(timer);
  }, [cargarFeed]);

  const handleLike = async (postId: number) => {
    if (likedPosts.has(postId)) return;

    try {
      const res = await padelgramApi.darLike(postId);
      setLikedPosts((prev) => new Set(prev).add(postId));
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, likesCount: res.likesCount } : p))
      );
    } catch (err) {
      console.error('Error al dar like:', err);
    }
  };

  const handleCrearPost = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setEnviando(true);

    try {
      await padelgramApi.crearPost({
        palaId: selectedPalaId,
        imagenUrl,
        descripcion: descripcion || undefined,
        ubicacion: ubicacion || undefined,
      });
      setShowModal(false);
      setImagenUrl('');
      setDescripcion('');
      setUbicacion('');
      await cargarFeed();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al publicar en Padelgram');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      {/* Header Padelgram */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Camera size={26} color="var(--color-primary-sage)" />
            <h1 style={{ fontSize: '1.9rem', fontWeight: 900 }}>Padelgram</h1>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Fotos en pista, personalización y equipamiento real compartido por jugadores y la comunidad.
          </p>
        </div>

        <button
          onClick={() => (isAuthenticated ? setShowModal(true) : alert('Iniciá sesión para publicar en Padelgram.'))}
          className="btn-primary"
          style={{ padding: '9px 18px', fontSize: '0.88rem' }}
        >
          <Plus size={16} />
          <span>Publicar Foto</span>
        </button>
      </div>

      {/* Grid Fotográfico */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card-skeuomorphic" style={{ padding: '16px' }}>
              <Skeleton height="220px" borderRadius="var(--radius-md)" style={{ marginBottom: '12px' }} />
              <Skeleton width="60%" height="16px" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="card-skeuomorphic" style={{ padding: '48px', textAlign: 'center' }}>
          <Camera size={48} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h3>No hay publicaciones aún en Padelgram</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>
            ¡Sé el primero en compartir tu pala en acción!
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {posts.map((post) => (
            <article
              key={post.id}
              className="card-skeuomorphic"
              style={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                padding: '0',
              }}
            >
              {/* Header Post con Usuario */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: 'rgba(0,0,0,0.1)' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-card-hover)',
                    border: '1px solid var(--border-steel-highlight)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    color: 'var(--color-accent-steel)',
                  }}
                >
                  {post.usuarioNombre.charAt(0).toUpperCase()}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>{post.usuarioNombre}</strong>
                  {post.ubicacion && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <MapPin size={11} />
                      <span>{post.ubicacion}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Imagen Fotográfica */}
              <div style={{ width: '100%', height: '260px', background: '#090D14', overflow: 'hidden', position: 'relative' }}>
                <img
                  src={post.imagenUrl}
                  alt={post.palaModelo}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Contenido y Pala Taggeada */}
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Tag de la Pala */}
                <Link
                  to={`/palas/${post.palaId}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(82, 183, 136, 0.12)',
                    border: '1px solid rgba(82, 183, 136, 0.30)',
                    color: 'var(--color-primary-sage)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    width: 'fit-content',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Tag size={12} />
                  <span>{post.palaMarca} • {post.palaModelo}</span>
                </Link>

                {post.descripcion && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    {post.descripcion}
                  </p>
                )}

                {/* Footer Likes */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', marginTop: '2px' }}>
                  <button
                    onClick={() => handleLike(post.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: likedPosts.has(post.id) ? 'var(--color-accent-terracotta)' : 'var(--text-secondary)',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Heart size={16} fill={likedPosts.has(post.id) ? 'var(--color-accent-terracotta)' : 'none'} />
                    <span>{post.likesCount}</span>
                  </button>

                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {new Date(post.fechaPublicacion).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal Nueva Publicación */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.82)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: '16px',
          }}
        >
          <div className="card-skeuomorphic animate-slide-up" style={{ width: '100%', maxWidth: '460px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={20} color="var(--padel-court-blue-vibrant)" />
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                  Nueva Foto en Padelgram
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {errorMsg && (
              <div style={{ padding: '8px 12px', background: 'rgba(224, 122, 95, 0.2)', border: '1px solid var(--color-accent-terracotta)', color: '#FFFFFF', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)', marginBottom: '12px' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCrearPost} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Pala que utilizás en la foto
                </label>
                <select
                  value={selectedPalaId}
                  onChange={(e) => setSelectedPalaId(Number(e.target.value))}
                  className="input-field"
                >
                  {palas.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.marcaNombre} {p.modelo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  URL de la Fotografía (JPG / WebP)
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={imagenUrl}
                  onChange={(e) => setImagenUrl(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Ubicación / Club (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Club Los Naranjos, Mar del Plata"
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Pie de foto / Sensaciones
                </label>
                <textarea
                  rows={3}
                  placeholder="Contá cómo respondió en el partido..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="input-field"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary" style={{ flex: 1 }}>
                  Cancelar
                </button>
                <button type="submit" disabled={enviando} className="btn-primary" style={{ flex: 1 }}>
                  {enviando ? 'Subiendo...' : 'Publicar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
