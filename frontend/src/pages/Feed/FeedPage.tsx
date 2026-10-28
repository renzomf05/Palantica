import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { padelgramApi } from '../../api/padelgram';
import { palasApi } from '../../api/palas';
import type { Publicacion, ComentarioPublicacion, Pala } from '../../types';
import {
  Heart,
  MessageCircle,
  Share2,
  Tag,
  Send,
  Lock,
  X,
  TrendingUp,
  Clock,
  Users
} from 'lucide-react';

export const FeedPage: React.FC = () => {
  const { isAuthenticated, usuario } = useAuth();

  const [posts, setPosts] = useState<Publicacion[]>([]);
  const [palas, setPalas] = useState<Pala[]>([]);
  const [filtro, setFiltro] = useState<'recientes' | 'populares' | 'siguiendo'>('recientes');

  // Formulario nuevo post
  const [nuevoTexto, setNuevoTexto] = useState('');
  const [nuevaImagen, setNuevaImagen] = useState('');
  const [palaSeleccionadaId, setPalaSeleccionadaId] = useState<number | ''>('');
  const [mostrarAuthModal, setMostrarAuthModal] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Estados de comentarios expandidos
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Cargar publicaciones y palas
  useEffect(() => {
    async function loadData() {
      try {
        const palasRes = await palasApi.getPalas({ pageSize: 30 });
        setPalas(palasRes.items || []);
      } catch (err) {
        console.error('Error cargando palas:', err);
      }

      try {
        const feedRes = await padelgramApi.getFeed(1, 20);
        if (feedRes.items && feedRes.items.length > 0) {
          const mapped: Publicacion[] = feedRes.items.map((item) => ({
            id: String(item.id),
            autor: {
              id: item.usuarioId,
              nombre: item.usuarioNombre,
              avatarUrl: item.usuarioAvatarUrl || undefined,
              nivelJuego: 'Avanzado',
            },
            fechaPublicacion: 'Hace 2 horas',
            texto: item.descripcion || `Sensaciones en pista con mi ${item.palaModelo}`,
            imagenes: item.imagenUrl ? [item.imagenUrl] : [],
            paletaEtiquetada: {
              id: item.palaId,
              modelo: item.palaModelo,
              marca: item.palaMarca,
              imagenUrl: item.imagenUrl,
            },
            likesCount: item.likesCount || 12,
            userHasLiked: false,
            comentariosCount: item.likesCount ? Math.round(item.likesCount * 0.4) : 0,
            comentarios: [],
          }));
          setPosts(mapped);
        } else {
          setPosts([]);
        }
      } catch {
        setPosts([]);
      }
    }

    loadData();
  }, []);

  // Manejar interacciones restringidas
  const handleRequireAuth = (actionCallback: () => void) => {
    if (!isAuthenticated) {
      setMostrarAuthModal(true);
    } else {
      actionCallback();
    }
  };

  // Crear publicación
  const handleCrearPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoTexto.trim()) return;

    if (!isAuthenticated || !usuario) {
      setMostrarAuthModal(true);
      return;
    }

    setEnviando(true);
    try {
      const palaTag = palas.find((p) => p.id === Number(palaSeleccionadaId));

      const newPost: Publicacion = {
        id: `local-${Date.now()}`,
        autor: {
          id: usuario.id,
          nombre: usuario.nombre,
          avatarUrl: usuario.avatarUrl || undefined,
          nivelJuego: usuario.nivelJuego || 'Intermedio',
        },
        fechaPublicacion: 'Justo ahora',
        texto: nuevoTexto.trim(),
        imagenes: nuevaImagen.trim() ? [nuevaImagen.trim()] : undefined,
        paletaEtiquetada: palaTag
          ? {
              id: palaTag.id,
              modelo: palaTag.modelo,
              marca: palaTag.marcaNombre,
              imagenUrl: palaTag.imagenUrl || null,
            }
          : undefined,
        likesCount: 0,
        userHasLiked: false,
        comentariosCount: 0,
        comentarios: [],
      };

      setPosts([newPost, ...posts]);
      setNuevoTexto('');
      setNuevaImagen('');
      setPalaSeleccionadaId('');
    } finally {
      setEnviando(false);
    }
  };

  // Dar like
  const handleToggleLike = (postId: string) => {
    handleRequireAuth(() => {
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id === postId) {
            const hasLiked = !post.userHasLiked;
            return {
              ...post,
              userHasLiked: hasLiked,
              likesCount: hasLiked ? post.likesCount + 1 : Math.max(0, post.likesCount - 1),
            };
          }
          return post;
        })
      );
    });
  };

  // Agregar comentario
  const handleAgregarComentario = (postId: string) => {
    handleRequireAuth(() => {
      const texto = commentInputs[postId]?.trim();
      if (!texto || !usuario) return;

      const nuevoComentario: ComentarioPublicacion = {
        id: `com-${Date.now()}`,
        publicacionId: postId,
        autor: {
          id: usuario.id,
          nombre: usuario.nombre,
          avatarUrl: usuario.avatarUrl || undefined,
        },
        fecha: 'Justo ahora',
        texto,
      };

      setPosts((prev) =>
        prev.map((post) => {
          if (post.id === postId) {
            const currentComments = post.comentarios || [];
            return {
              ...post,
              comentariosCount: post.comentariosCount + 1,
              comentarios: [...currentComments, nuevoComentario],
            };
          }
          return post;
        })
      );

      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    });
  };

  // Compartir post
  const handleCompartir = (postId: string) => {
    const url = `${window.location.origin}/feed#post-${postId}`;
    navigator.clipboard?.writeText(url);
    setCopiedId(postId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Filtrado de publicaciones
  const filteredPosts = [...posts].sort((a, b) => {
    if (filtro === 'populares') return b.likesCount - a.likesCount;
    return 0; // 'recientes' ya viene en orden descendente
  });

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 animate-fade-in pb-16">
      {/* Cabecera del Feed */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-white/10 pb-4 transition-colors">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)] m-0">
            Feed de la Comunidad
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm mt-0.5">
            Muro social de jugadores registrados. Consejos, fotos en pista y experiencias de juego.
          </p>
        </div>

        {/* Filtros de Feed */}
        <div className="flex items-center gap-1 bg-[var(--bg-card-subtle)] p-1 rounded-2xl border border-zinc-200 dark:border-white/10 self-start sm:self-auto transition-colors">
          {(
            [
              { id: 'recientes', label: 'Recientes', icon: Clock },
              { id: 'populares', label: 'Populares', icon: TrendingUp },
              { id: 'siguiendo', label: 'Siguiendo', icon: Users },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            const isSel = filtro === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setFiltro(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isSel
                    ? 'bg-emerald-500 text-zinc-950 font-black shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                }`}
              >
                <Icon size={13} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Caja de Creación de Publicación */}
      <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-zinc-200 dark:border-white/10 shadow-md shadow-zinc-900/5 dark:shadow-xl flex flex-col gap-3 transition-colors">
        {isAuthenticated ? (
          <form onSubmit={handleCrearPost} className="flex flex-col gap-3">
            <div className="flex gap-3 items-start">
              {usuario?.avatarUrl ? (
                <img
                  src={usuario.avatarUrl}
                  alt={usuario.nombre}
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {usuario?.nombre?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <textarea
                value={nuevoTexto}
                onChange={(e) => setNuevoTexto(e.target.value)}
                placeholder="¿Qué probaste en tu último partido? Comparte sensaciones o equipamiento..."
                rows={3}
                className="w-full bg-[var(--bg-input)] border border-zinc-300 dark:border-white/10 rounded-2xl p-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-emerald-500 resize-none font-medium transition-colors"
              />
            </div>

            {/* Opciones adjuntas: Imagen y Etiquetar Pala */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-200 dark:border-white/5">
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={nuevaImagen}
                  onChange={(e) => setNuevaImagen(e.target.value)}
                  placeholder="URL de foto en pista (opcional)..."
                  className="h-8 px-3 rounded-xl bg-[var(--bg-input)] border border-zinc-300 dark:border-white/10 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none w-48 sm:w-64 transition-colors"
                />

                <select
                  value={palaSeleccionadaId}
                  onChange={(e) => setPalaSeleccionadaId(e.target.value ? Number(e.target.value) : '')}
                  className="h-8 px-3 rounded-xl bg-[var(--bg-input)] border border-zinc-300 dark:border-white/10 text-xs text-[var(--text-primary)] outline-none cursor-pointer max-w-[180px] truncate transition-colors"
                >
                  <option value="" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Etiquetar pala...</option>
                  {palas.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
                      {p.marcaNombre} {p.modelo}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={enviando || !nuevoTexto.trim()}
                className="px-5 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
              >
                <Send size={13} />
                <span>{enviando ? 'Publicando...' : 'Publicar'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[var(--bg-card-subtle)] rounded-2xl border border-dashed border-zinc-300 dark:border-white/10 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                <Lock size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)] m-0">Únete a la comunidad de Palantica</h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                  Inicia sesión para publicar tus reviews, fotos de pala y debatir con otros jugadores.
                </p>
              </div>
            </div>
            <Link
              to="/login"
              className="px-5 py-2 rounded-full bg-emerald-500 text-zinc-950 font-extrabold text-xs hover:bg-emerald-400 transition-colors whitespace-nowrap"
            >
              Iniciar Sesión
            </Link>
          </div>
        )}
      </div>

      {/* Lista de Publicaciones */}
      <div className="flex flex-col gap-6">
        {filteredPosts.map((post) => (
          <article
            key={post.id}
            id={`post-${post.id}`}
            className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-zinc-200 dark:border-white/10 shadow-md shadow-zinc-900/5 dark:shadow-lg flex flex-col gap-4 transition-colors"
          >
            {/* Cabecera del Post: Autor, Nivel y Fecha */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {post.autor.avatarUrl ? (
                  <img
                    src={post.autor.avatarUrl}
                    alt={post.autor.nombre}
                    className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-white/10"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
                    {post.autor.nombre.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-[var(--text-primary)] text-sm">
                      {post.autor.nombre}
                    </span>
                    {post.autor.nivelJuego && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--bg-card-subtle)] text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/10">
                        {post.autor.nivelJuego}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                    {post.fechaPublicacion}
                  </span>
                </div>
              </div>
            </div>

            {/* Texto de la publicación */}
            <p className="text-sm sm:text-base text-zinc-800 dark:text-zinc-200 leading-relaxed font-normal whitespace-pre-line">
              {post.texto}
            </p>

            {/* Paleta etiquetada opcional */}
            {post.paletaEtiquetada && (
              <Link
                to={`/paletas/${post.paletaEtiquetada.id}`}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-emerald-500/30 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors self-start"
              >
                <Tag size={13} />
                <span>
                  {post.paletaEtiquetada.marca} {post.paletaEtiquetada.modelo}
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-normal">
                  • Ver ficha técnica
                </span>
              </Link>
            )}

            {/* Imágenes opcionales */}
            {post.imagenes && post.imagenes.length > 0 && (
              <div className="w-full rounded-2xl overflow-hidden border border-zinc-200 dark:border-white/10 bg-zinc-950 max-h-96">
                <img
                  src={post.imagenes[0]}
                  alt="Foto en pista"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Fila de interacciones: Like, Comentarios, Compartir */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-white/5 text-xs text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => handleToggleLike(post.id)}
                  className={`flex items-center gap-1.5 font-bold transition-colors ${
                    post.userHasLiked
                      ? 'text-rose-500'
                      : 'hover:text-zinc-950 dark:hover:text-white text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  <Heart
                    size={16}
                    className={post.userHasLiked ? 'fill-rose-500 text-rose-500' : ''}
                  />
                  <span>{post.likesCount}</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setExpandedComments((prev) => ({
                      ...prev,
                      [post.id]: !prev[post.id],
                    }))
                  }
                  className="flex items-center gap-1.5 hover:text-zinc-950 dark:hover:text-white font-bold transition-colors"
                >
                  <MessageCircle size={16} className="text-cyan-500" />
                  <span>{post.comentariosCount} comentarios</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleCompartir(post.id)}
                className="flex items-center gap-1 hover:text-zinc-950 dark:hover:text-white transition-colors"
              >
                <Share2 size={15} />
                <span>{copiedId === post.id ? '¡Enlace copiado!' : 'Compartir'}</span>
              </button>
            </div>

            {/* Caja de Comentarios desplegable */}
            {expandedComments[post.id] && (
              <div className="flex flex-col gap-3 pt-3 border-t border-zinc-200 dark:border-white/10 animate-fade-in">
                {/* Lista de comentarios */}
                <div className="flex flex-col gap-2.5">
                  {post.comentarios && post.comentarios.length > 0 ? (
                    post.comentarios.map((c) => (
                      <div
                        key={c.id}
                        className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-zinc-200/80 dark:border-white/5 flex flex-col gap-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[var(--text-primary)]">
                            {c.autor.nombre}
                          </span>
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{c.fecha}</span>
                        </div>
                        <p className="text-zinc-700 dark:text-zinc-300 font-normal m-0">{c.texto}</p>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-500 py-1">
                      Sé el primero en comentar esta publicación.
                    </span>
                  )}
                </div>

                {/* Input para agregar comentario */}
                <div className="flex gap-2 items-center mt-1">
                  <input
                    type="text"
                    value={commentInputs[post.id] || ''}
                    onChange={(e) =>
                      setCommentInputs((prev) => ({
                        ...prev,
                        [post.id]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAgregarComentario(post.id);
                      }
                    }}
                    placeholder={
                      isAuthenticated
                        ? 'Escribe una respuesta...'
                        : 'Inicia sesión para comentar...'
                    }
                    className="flex-1 h-9 px-3.5 rounded-xl bg-[var(--bg-input)] border border-zinc-300 dark:border-white/10 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => handleAgregarComentario(post.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs"
                  >
                    Enviar
                  </button>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>

      {/* Modal de Advertencia de Login */}
      {mostrarAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-zinc-900 border border-white/10 shadow-2xl flex flex-col items-center text-center gap-4 relative">
            <button
              type="button"
              onClick={() => setMostrarAuthModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Lock size={26} />
            </div>

            <h3 className="text-xl font-black text-white m-0">
              Inicia sesión para interactuar
            </h3>
            <p className="text-zinc-300 text-xs leading-relaxed">
              Para dar like, comentar y publicar en el Feed de la comunidad de Palantica necesitas tener una cuenta registrada.
            </p>

            <div className="flex gap-3 w-full mt-2">
              <Link
                to="/login"
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-zinc-950 font-extrabold text-xs text-center"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/registro"
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-white font-extrabold text-xs text-center border border-white/10"
              >
                Registrarme
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


