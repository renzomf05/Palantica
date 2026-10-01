import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { HiloForo, RespuestaForo, CategoriaForo } from '../../types';
import {
  MessagesSquare,
  MessageSquare,
  Search,
  Plus,
  ThumbsUp,
  Quote,
  Flag,
  Clock,
  ChevronRight,
  ArrowLeft,
  X,
  Lock,
  Send,
  CheckCircle2
} from 'lucide-react';

export const ForoPage: React.FC = () => {
  const { isAuthenticated, usuario } = useAuth();

  const [hilos, setHilos] = useState<HiloForo[]>(initialHilos);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('Todas');
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState<'reciente' | 'comentado' | 'votado'>('reciente');

  // Hilo actualmente abierto para ver respuestas y debatir
  const [hiloAbierto, setHiloAbierto] = useState<HiloForo | null>(null);

  // Modales
  const [mostrarCrearModal, setMostrarCrearModal] = useState(false);
  const [mostrarAuthModal, setMostrarAuthModal] = useState(false);
  const [reporteExitoso, setReporteExitoso] = useState<string | null>(null);

  // Formulario nuevo hilo
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevaCategoria, setNuevaCategoria] = useState<CategoriaForo>('Paletas y equipamiento');
  const [nuevoContenido, setNuevoContenido] = useState('');

  // Formulario respuesta a hilo
  const [respuestaTexto, setRespuestaTexto] = useState('');
  const [citaActiva, setCitaActiva] = useState<{ id: string; texto: string; autor: string } | null>(null);

  const categorias: (CategoriaForo | 'Todas')[] = [
    'Todas',
    'Paletas y equipamiento',
    'Técnica y táctica',
    'Torneos y circuito',
    'Comunidad',
  ];

  const handleRequireAuth = (callback: () => void) => {
    if (!isAuthenticated) {
      setMostrarAuthModal(true);
    } else {
      callback();
    }
  };

  // Crear nuevo hilo
  const handleCrearHilo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoTitulo.trim() || !nuevoContenido.trim() || !usuario) return;

    const newThread: HiloForo = {
      id: `hilo-${Date.now()}`,
      titulo: nuevoTitulo.trim(),
      categoria: nuevaCategoria,
      autor: {
        id: usuario.id,
        nombre: usuario.nombre,
        avatarUrl: usuario.avatarUrl || undefined,
        nivelJuego: usuario.nivelJuego || 'Intermedio',
      },
      fechaCreacion: 'Justo ahora',
      cantidadRespuestas: 0,
      ultimaActividad: 'Justo ahora',
      contenidoInicial: nuevoContenido.trim(),
      votos: 1,
      userHasVoted: true,
      respuestas: [],
    };

    setHilos([newThread, ...hilos]);
    setNuevoTitulo('');
    setNuevoContenido('');
    setMostrarCrearModal(false);
    setHiloAbierto(newThread);
  };

  // Responder en hilo
  const handleEnviarRespuesta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!respuestaTexto.trim() || !hiloAbierto || !usuario) return;

    const nuevaRespuesta: RespuestaForo = {
      id: `resp-${Date.now()}`,
      hiloId: hiloAbierto.id,
      autor: {
        id: usuario.id,
        nombre: usuario.nombre,
        avatarUrl: usuario.avatarUrl || undefined,
        nivelJuego: usuario.nivelJuego,
      },
      fecha: 'Justo ahora',
      contenido: respuestaTexto.trim(),
      votos: 0,
      userHasVoted: false,
      citaId: citaActiva?.id,
      citaTexto: citaActiva?.texto,
      citaAutor: citaActiva?.autor,
    };

    const updatedThread: HiloForo = {
      ...hiloAbierto,
      cantidadRespuestas: hiloAbierto.cantidadRespuestas + 1,
      ultimaActividad: 'Justo ahora',
      respuestas: [...(hiloAbierto.respuestas || []), nuevaRespuesta],
    };

    setHiloAbierto(updatedThread);
    setHilos((prev) => prev.map((h) => (h.id === updatedThread.id ? updatedThread : h)));
    setRespuestaTexto('');
    setCitaActiva(null);
  };

  // Votar respuesta
  const handleVotarRespuesta = (respId: string) => {
    handleRequireAuth(() => {
      if (!hiloAbierto) return;
      const updatedReplies = (hiloAbierto.respuestas || []).map((r) => {
        if (r.id === respId) {
          const voted = !r.userHasVoted;
          return {
            ...r,
            userHasVoted: voted,
            votos: voted ? r.votos + 1 : Math.max(0, r.votos - 1),
          };
        }
        return r;
      });

      const updatedThread = { ...hiloAbierto, respuestas: updatedReplies };
      setHiloAbierto(updatedThread);
      setHilos((prev) => prev.map((h) => (h.id === updatedThread.id ? updatedThread : h)));
    });
  };

  // Reportar respuesta
  const handleReportar = (_respId: string) => {
    handleRequireAuth(() => {
      setReporteExitoso(`Respuesta reportada para revisión de moderación.`);
      setTimeout(() => setReporteExitoso(null), 3000);
    });
  };

  // Filtrado y ordenamiento de hilos
  const hilosFiltrados = hilos
    .filter((h) => {
      if (categoriaSeleccionada !== 'Todas' && h.categoria !== categoriaSeleccionada) {
        return false;
      }
      if (busqueda.trim()) {
        const query = busqueda.toLowerCase();
        return (
          h.titulo.toLowerCase().includes(query) ||
          h.contenidoInicial.toLowerCase().includes(query) ||
          h.autor.nombre.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (orden === 'comentado') return b.cantidadRespuestas - a.cantidadRespuestas;
      if (orden === 'votado') return b.votos - a.votos;
      return 0; // 'reciente'
    });

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 animate-fade-in pb-16">
      {/* Notificación de reporte */}
      {reporteExitoso && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={16} />
          <span>{reporteExitoso}</span>
        </div>
      )}

      {/* SI HAY UN HILO ABIERTO: VISTA DE DEBATE EN DETALLE */}
      {hiloAbierto ? (
        <div className="flex flex-col gap-6 animate-fade-in">
          {/* Botón Volver */}
          <button
            type="button"
            onClick={() => {
              setHiloAbierto(null);
              setCitaActiva(null);
            }}
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors self-start"
          >
            <ArrowLeft size={16} />
            <span>Volver a la lista de debates</span>
          </button>

          {/* Tarjeta del Tema Principal */}
          <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-white/10 shadow-xl flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {hiloAbierto.categoria}
              </span>
              <span className="text-xs text-zinc-400 font-medium">
                Iniciado {hiloAbierto.fechaCreacion}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight m-0">
              {hiloAbierto.titulo}
            </h1>

            {/* Autor original */}
            <div className="flex items-center gap-3 py-2 border-b border-white/5">
              {hiloAbierto.autor.avatarUrl ? (
                <img
                  src={hiloAbierto.autor.avatarUrl}
                  alt={hiloAbierto.autor.nombre}
                  className="w-10 h-10 rounded-full object-cover border border-white/10"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center">
                  {hiloAbierto.autor.nombre.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white text-sm">
                    {hiloAbierto.autor.nombre}
                  </span>
                  {hiloAbierto.autor.nivelJuego && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-300">
                      {hiloAbierto.autor.nivelJuego}
                    </span>
                  )}
                </div>
                <span className="text-xs text-zinc-400">Creador del debate</span>
              </div>
            </div>

            {/* Contenido del Hilo */}
            <div className="text-sm sm:text-base text-zinc-200 leading-relaxed font-normal whitespace-pre-line py-2">
              {hiloAbierto.contenidoInicial}
            </div>

            {/* Botón para responder rápidamente */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-medium">
                {hiloAbierto.cantidadRespuestas} respuestas registradas
              </span>
              <button
                type="button"
                onClick={() =>
                  handleRequireAuth(() => {
                    const formEl = document.getElementById('form-respuesta');
                    formEl?.scrollIntoView({ behavior: 'smooth' });
                  })
                }
                className="px-4 py-2 rounded-full bg-emerald-500 text-zinc-950 font-bold text-xs hover:bg-emerald-400 transition-colors"
              >
                Responder a este hilo
              </button>
            </div>
          </div>

          {/* LISTA DE RESPUESTAS ANIDADAS */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-black tracking-tight text-white m-0">
              Respuestas del debate ({hiloAbierto.respuestas?.length || 0})
            </h3>

            {hiloAbierto.respuestas && hiloAbierto.respuestas.length > 0 ? (
              hiloAbierto.respuestas.map((resp) => (
                <div
                  key={resp.id}
                  className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-white/10 shadow-md flex flex-col gap-3"
                >
                  {/* Autor de la respuesta */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {resp.autor.avatarUrl ? (
                        <img
                          src={resp.autor.avatarUrl}
                          alt={resp.autor.nombre}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-700 text-white font-bold text-xs flex items-center justify-center">
                          {resp.autor.nombre.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <span className="font-extrabold text-white text-xs block">
                          {resp.autor.nombre}
                        </span>
                        <span className="text-[11px] text-zinc-400">{resp.fecha}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleReportar(resp.id)}
                      className="text-zinc-500 hover:text-rose-400 text-xs flex items-center gap-1 transition-colors"
                      title="Reportar respuesta inapropiada"
                    >
                      <Flag size={12} />
                      <span className="hidden sm:inline">Reportar</span>
                    </button>
                  </div>

                  {/* Texto citado si existe */}
                  {resp.citaTexto && (
                    <div className="p-3 rounded-2xl bg-zinc-900/90 border-l-4 border-emerald-500 text-xs text-zinc-300 italic flex flex-col gap-1">
                      <span className="font-bold text-emerald-400 not-italic">
                        En respuesta a {resp.citaAutor || 'jugador'}:
                      </span>
                      <span>"{resp.citaTexto}"</span>
                    </div>
                  )}

                  {/* Contenido de la respuesta */}
                  <p className="text-sm text-zinc-200 leading-relaxed font-normal whitespace-pre-line m-0">
                    {resp.contenido}
                  </p>

                  {/* Acciones: Votar y Citar */}
                  <div className="flex items-center gap-4 pt-2 border-t border-white/5 text-xs text-zinc-400">
                    <button
                      type="button"
                      onClick={() => handleVotarRespuesta(resp.id)}
                      className={`flex items-center gap-1.5 font-bold transition-colors ${
                        resp.userHasVoted
                          ? 'text-emerald-400'
                          : 'hover:text-white text-zinc-400'
                      }`}
                    >
                      <ThumbsUp size={14} className={resp.userHasVoted ? 'fill-emerald-400' : ''} />
                      <span>{resp.votos} Votos</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleRequireAuth(() => {
                          setCitaActiva({
                            id: resp.id,
                            texto: resp.contenido.slice(0, 140) + '...',
                            autor: resp.autor.nombre,
                          });
                          document.getElementById('form-respuesta')?.scrollIntoView({ behavior: 'smooth' });
                        });
                      }}
                      className="flex items-center gap-1.5 hover:text-white font-bold transition-colors"
                    >
                      <Quote size={14} />
                      <span>Citar</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center rounded-3xl bg-[var(--bg-surface)] border border-dashed border-white/10 text-zinc-400 text-xs">
                Aún no hay respuestas en este debate. Sé el primero en compartir tu opinión táctica o experiencia.
              </div>
            )}
          </div>

          {/* FORMULARIO DE RESPUESTA */}
          <div
            id="form-respuesta"
            className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-white/10 shadow-xl flex flex-col gap-3"
          >
            <h4 className="text-base font-black text-white tracking-tight m-0">
              Escribir una respuesta técnica
            </h4>

            {citaActiva && (
              <div className="p-3 rounded-2xl bg-zinc-900 border border-emerald-500/30 flex items-center justify-between text-xs text-zinc-300">
                <div className="flex items-center gap-2 truncate">
                  <Quote size={14} className="text-emerald-400 flex-shrink-0" />
                  <span className="truncate">
                    Citando a <strong>{citaActiva.autor}</strong>: "{citaActiva.texto}"
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCitaActiva(null)}
                  className="text-zinc-400 hover:text-white ml-2"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {isAuthenticated ? (
              <form onSubmit={handleEnviarRespuesta} className="flex flex-col gap-3">
                <textarea
                  value={respuestaTexto}
                  onChange={(e) => setRespuestaTexto(e.target.value)}
                  placeholder="Fundamenta tu punto de vista, comparte datos de tu pala o consejos de juego..."
                  rows={4}
                  className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-zinc-500 outline-none focus:border-emerald-500 resize-none font-medium"
                />
                <button
                  type="submit"
                  disabled={!respuestaTexto.trim()}
                  className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-zinc-950 font-extrabold text-xs self-end flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20"
                >
                  <Send size={13} />
                  <span>Publicar Respuesta</span>
                </button>
              </form>
            ) : (
              <div className="p-4 bg-zinc-900/60 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-zinc-300">
                  Debes iniciar sesión con tu cuenta de jugador para responder a los debates.
                </span>
                <Link
                  to="/login"
                  className="px-5 py-2 rounded-full bg-emerald-500 text-zinc-950 font-extrabold text-xs hover:bg-emerald-400 transition-colors whitespace-nowrap"
                >
                  Iniciar Sesión
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* VISTA DE LISTA DE HILOS DEL FORO */
        <div className="flex flex-col gap-6 animate-fade-in">
          {/* Header del Foro */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-2">
                <MessagesSquare size={13} />
                <span>Debate Exclusivo</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white m-0">
                Foro de Pádel
              </h1>
              <p className="text-zinc-400 text-sm mt-1 max-w-xl">
                Espacio de debate técnico, táctico y de material entre jugadores. Pregunta dudas, compara palas y comparte tus tácticas de pista.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleRequireAuth(() => setMostrarCrearModal(true))}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all self-start sm:self-auto"
            >
              <Plus size={16} />
              <span>Crear Nuevo Hilo</span>
            </button>
          </div>

          {/* Categorías del Foro */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {categorias.map((cat) => {
              const isSel = categoriaSeleccionada === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoriaSeleccionada(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold tracking-tight whitespace-nowrap transition-all ${
                    isSel
                      ? 'bg-emerald-500 text-zinc-950 font-black shadow-sm'
                      : 'bg-zinc-900 text-zinc-400 border border-white/5 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Buscador dentro del foro y ordenamiento */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-96">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
              />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar dentro del foro..."
                className="w-full h-10 pl-10 pr-4 rounded-2xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto text-xs font-bold text-zinc-400">
              <span>Ordenar por:</span>
              <select
                value={orden}
                onChange={(e) => setOrden(e.target.value as 'reciente' | 'comentado' | 'votado')}
                className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 text-white outline-none cursor-pointer"
              >
                <option value="reciente">Más reciente</option>
                <option value="comentado">Más comentado</option>
                <option value="votado">Más votado</option>
              </select>
            </div>
          </div>

          {/* Lista de Hilos */}
          <div className="flex flex-col gap-3">
            {hilosFiltrados.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-[var(--bg-surface)] border border-dashed border-white/10 text-zinc-400 text-sm">
                No se encontraron hilos de debate con ese criterio de búsqueda.
              </div>
            ) : (
              hilosFiltrados.map((hilo) => (
                <div
                  key={hilo.id}
                  onClick={() => setHiloAbierto(hilo)}
                  className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-white/10 hover:border-emerald-500/50 shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="flex flex-col gap-2 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {hilo.categoria}
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        por <strong className="text-zinc-200">{hilo.autor.nombre}</strong> • {hilo.fechaCreacion}
                      </span>
                    </div>

                    <h2 className="text-base sm:text-lg font-black text-white tracking-tight group-hover:text-emerald-300 transition-colors m-0">
                      {hilo.titulo}
                    </h2>

                    <p className="text-xs text-zinc-400 line-clamp-2 font-normal m-0">
                      {hilo.contenidoInicial}
                    </p>
                  </div>

                  {/* Métricas del hilo */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0 flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-xs font-bold text-zinc-300">
                        <MessageSquare size={14} className="text-cyan-400" />
                        {hilo.cantidadRespuestas}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-bold text-zinc-300">
                        <ThumbsUp size={14} className="text-emerald-400" />
                        {hilo.votos}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                      <Clock size={12} />
                      <span>{hilo.ultimaActividad}</span>
                      <ChevronRight size={14} className="text-emerald-400 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal para Crear Hilo */}
      {mostrarCrearModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-xl p-6 rounded-3xl bg-zinc-900 border border-white/10 shadow-2xl flex flex-col gap-4 relative">
            <button
              type="button"
              onClick={() => setMostrarCrearModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2">
              <MessagesSquare className="text-emerald-400" size={22} />
              <h3 className="text-xl font-black text-white m-0">
                Iniciar Nuevo Hilo de Debate
              </h3>
            </div>

            <form onSubmit={handleCrearHilo} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                  Categoría
                </label>
                <select
                  value={nuevaCategoria}
                  onChange={(e) => setNuevaCategoria(e.target.value as CategoriaForo)}
                  className="w-full h-10 px-3 rounded-xl bg-zinc-800 border border-white/10 text-xs text-white outline-none focus:border-emerald-500"
                >
                  <option value="Paletas y equipamiento">Paletas y equipamiento</option>
                  <option value="Técnica y táctica">Técnica y táctica</option>
                  <option value="Torneos y circuito">Torneos y circuito</option>
                  <option value="Comunidad">Comunidad</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                  Título del Debate
                </label>
                <input
                  type="text"
                  required
                  value={nuevoTitulo}
                  onChange={(e) => setNuevoTitulo(e.target.value)}
                  placeholder="Ej: ¿Vale la pena el carbono 18K frente al 12K para jugadores intermedios?"
                  className="w-full h-11 px-4 rounded-xl bg-zinc-800 border border-white/10 text-sm text-white placeholder-zinc-500 outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                  Planteamiento y Argumentos
                </label>
                <textarea
                  required
                  value={nuevoContenido}
                  onChange={(e) => setNuevoContenido(e.target.value)}
                  placeholder="Explica detalladamente la duda o punto a debatir para que la comunidad pueda fundamentar sus respuestas..."
                  rows={5}
                  className="w-full bg-zinc-800 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-zinc-500 outline-none focus:border-emerald-500 resize-none font-medium"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMostrarCrearModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!nuevoTitulo.trim() || !nuevoContenido.trim()}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 text-zinc-950 font-extrabold text-xs hover:bg-emerald-400 disabled:opacity-40"
                >
                  Crear Hilo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              Debates reservados para usuarios registrados
            </h3>
            <p className="text-zinc-300 text-xs leading-relaxed">
              Para crear hilos, responder a argumentos y votar en el Foro de Palantica necesitas acceder con tu usuario verificado.
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

// Hilos iniciales representativos del debate de pádel
const initialHilos: HiloForo[] = [
  {
    id: 'h1',
    titulo: '¿Cómo afecta la temperatura de 35°C a una pala de tacto blando (Foam / Polietileno)?',
    categoria: 'Paletas y equipamiento',
    autor: {
      id: 201,
      nombre: 'Gonzalo Fernández',
      nivelJuego: 'Avanzado',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    },
    fechaCreacion: 'Hace 4 horas',
    cantidadRespuestas: 14,
    ultimaActividad: 'Hace 12 min',
    contenidoInicial:
      'He notado que en verano en pistas techadas o con mucho bochorno mi pala blanda pierde todo el control en los remates y despide como un trampolín descontrolado. ¿Recomiendan cambiar a goma Black EVA o MultiEVA sólo para los meses cálidos?',
    votos: 28,
    userHasVoted: false,
    respuestas: [
      {
        id: 'r1',
        hiloId: 'h1',
        autor: {
          id: 202,
          nombre: 'Matías L.',
          nivelJuego: 'Competición',
        },
        fecha: 'Hace 3 horas',
        contenido:
          'Totalmente. El polímero de Foam y EVA Soft tiene una pérdida de rigidez elástica notable a partir de los 28°C. Si rematas fuerte, la bola se te "hunde" demasiado en la cara y pierdes aceleración final. Para calor siempre es mejor una pala con tacto medio-duro.',
        votos: 12,
        userHasVoted: false,
      },
      {
        id: 'r2',
        hiloId: 'h1',
        autor: {
          id: 203,
          nombre: 'Esteban B.',
          nivelJuego: 'Avanzado',
        },
        fecha: 'Hace 1 hora',
        contenido:
          'Coincido con Matías. En Argentina usamos mucho la teoría de la "pala de invierno" vs "pala de verano". En verano necesitas carbono 12K/18K con núcleo firme para que la bola salga disparada limpia.',
        votos: 8,
        userHasVoted: false,
      },
    ],
  },
  {
    id: 'h2',
    titulo: 'Bandeja vs Víbora en lado del revés: ¿Cuándo optar por profundidad antes que velocidad?',
    categoria: 'Técnica y táctica',
    autor: {
      id: 204,
      nombre: 'Valeria Rossi',
      nivelJuego: 'Competición',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    },
    fechaCreacion: 'Ayer',
    cantidadRespuestas: 22,
    ultimaActividad: 'Hace 45 min',
    contenidoInicial:
      'Abro debate táctico para jugadores de revés: cuando los rivales retroceden rápido a defender las esquinas, ¿suelen jugar víbora agresiva al medio o bandeja lánguida a la reja para recuperar la red con calma?',
    votos: 35,
    userHasVoted: false,
    respuestas: [],
  },
  {
    id: 'h3',
    titulo: 'Análisis del nuevo calendario Premier Padel 2026: ¿Demasiados torneos P1 en Medio Oriente?',
    categoria: 'Torneos y circuito',
    autor: {
      id: 205,
      nombre: 'Lucas M.',
      nivelJuego: 'Intermedio',
    },
    fechaCreacion: 'Hace 2 días',
    cantidadRespuestas: 19,
    ultimaActividad: 'Hace 2 h',
    contenidoInicial:
      'Se confirmó el fixture con 25 paradas. Muchos jugadores se quejan del desgaste físico y los viajes largos seguidos entre Europa, América y Asia. ¿Creen que bajará el nivel en los Majors por lesiones?',
    votos: 17,
    userHasVoted: false,
    respuestas: [],
  },
  {
    id: 'h4',
    titulo: '¿Cada cuánto tiempo cambian de overgrip para no perder adherencia?',
    categoria: 'Comunidad',
    autor: {
      id: 206,
      nombre: 'Damián K.',
      nivelJuego: 'Iniciación',
    },
    fechaCreacion: 'Hace 3 días',
    cantidadRespuestas: 31,
    ultimaActividad: 'Hace 3 h',
    contenidoInicial:
      'Juego 2 veces por semana y me transpira bastante la palma. Noto que al tercer partido el overgrip ya patina en el revés. ¿Qué marcas usan? ¿Wilson Pro Comfort o Siux absorción?',
    votos: 21,
    userHasVoted: false,
    respuestas: [],
  },
];
