import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { palasApi } from '../../api/palas';
import { resenasApi } from '../../api/resenas';
import { votacionesApi } from '../../api/votaciones';
import { paleteroApi } from '../../api/paletero';
import { useAuth } from '../../hooks/useAuth';
import type { PalaDetalle, Resena, CategoriaPaletero } from '../../types';
import { RadarChart } from '../../components/palas/RadarChart';
import { DurezaBar } from '../../components/palas/DurezaBar';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Star,
  Briefcase,
  Layers,
  Activity,
  Sliders,
  MessageSquarePlus,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  Tag,
  ShieldCheck
} from 'lucide-react';

export const PalaDetallePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const palaId = Number(id);
  const { isAuthenticated } = useAuth();

  const [pala, setPala] = useState<PalaDetalle | null>(null);
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingResenas, setLoadingResenas] = useState(true);

  // Modales
  const [showResenaModal, setShowResenaModal] = useState(false);
  const [showVotoModal, setShowVotoModal] = useState(false);
  const [showPaleteroModal, setShowPaleteroModal] = useState(false);

  // Formulario Reseña
  const [resenaPuntuacion, setResenaPuntuacion] = useState(5);
  const [resenaTitulo, setResenaTitulo] = useState('');
  const [resenaContenido, setResenaContenido] = useState('');
  const [resenaLado, setResenaLado] = useState('Reves');
  const [resenaTiempo, setResenaTiempo] = useState('1 mes');
  const [resenaEnviando, setResenaEnviando] = useState(false);
  const [resenaError, setResenaError] = useState<string | null>(null);

  // Formulario Voto Atributos
  const [votoDureza, setVotoDureza] = useState(7);
  const [votoPotencia, setVotoPotencia] = useState(8);
  const [votoControl, setVotoControl] = useState(8);
  const [votoSalidaBola, setVotoSalidaBola] = useState(7);
  const [votoManiobrabilidad, setVotoManiobrabilidad] = useState(8);
  const [votoPuntoDulce, setVotoPuntoDulce] = useState(8);
  const [votoConfort, setVotoConfort] = useState(8);
  const [votoEstacion, setVotoEstacion] = useState('TodoAno');
  const [votoEnviando, setVotoEnviando] = useState(false);

  // Paletero
  const [paleteroCat, setPaleteroCat] = useState<CategoriaPaletero>('Usando actualmente');
  const [paleteroNotas, setPaleteroNotas] = useState('');
  const [paleteroSuccess, setPaleteroSuccess] = useState(false);

  const cargarDatos = async () => {
    if (!palaId) return;
    try {
      const palaData = await palasApi.getPalaDetalle(palaId);
      setPala(palaData);

      setVotoDureza(Math.round(palaData.durezaPromedio));
      setVotoPotencia(Math.round(palaData.potenciaPromedio));
      setVotoControl(Math.round(palaData.controlPromedio));
      setVotoSalidaBola(Math.round(palaData.salidaBolaPromedio));
      setVotoManiobrabilidad(Math.round(palaData.maniobrabilidadPromedio));
      setVotoPuntoDulce(Math.round(palaData.puntoDulcePromedio));
      setVotoConfort(Math.round(palaData.confortPromedio));
    } catch (err) {
      console.error('Error cargando ficha de pala:', err);
    } finally {
      setLoading(false);
    }

    try {
      const resenasData = await resenasApi.getResenasPorPala(palaId, 1, 10);
      setResenas(resenasData.items);
    } catch (err) {
      console.error('Error cargando reseñas:', err);
    } finally {
      setLoadingResenas(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setLoadingResenas(true);
    cargarDatos();
  }, [palaId]);

  const handlePublicarResena = async (e: React.FormEvent) => {
    e.preventDefault();
    setResenaError(null);
    setResenaEnviando(true);
    try {
      await resenasApi.publicarResena(palaId, {
        puntuacion: resenaPuntuacion,
        titulo: resenaTitulo,
        contenido: resenaContenido,
        ladoPista: resenaLado,
        tiempoUso: resenaTiempo,
      });
      setShowResenaModal(false);
      setResenaTitulo('');
      setResenaContenido('');
      await cargarDatos();
    } catch (err: any) {
      setResenaError(err.message || 'Error al enviar la reseña');
    } finally {
      setResenaEnviando(false);
    }
  };

  const handleEmitirVoto = async (e: React.FormEvent) => {
    e.preventDefault();
    setVotoEnviando(true);
    try {
      await votacionesApi.emitirVoto(palaId, {
        durezaPercibida: votoDureza,
        potencia: votoPotencia,
        control: votoControl,
        salidaBola: votoSalidaBola,
        maniobrabilidad: votoManiobrabilidad,
        puntoDulce: votoPuntoDulce,
        confort: votoConfort,
        estacionRecomendada: votoEstacion,
      });
      setShowVotoModal(false);
      await cargarDatos();
    } catch (err) {
      console.error('Error al emitir voto:', err);
    } finally {
      setVotoEnviando(false);
    }
  };

  const handleAgregarPaletero = async () => {
    try {
      await paleteroApi.addItem({
        palaId,
        categoria: paleteroCat,
        notas: paleteroNotas || undefined,
      });
      setPaleteroSuccess(true);
      setTimeout(() => {
        setPaleteroSuccess(false);
        setShowPaleteroModal(false);
      }, 1500);
    } catch (err) {
      console.error('Error al agregar al paletero:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Skeleton height="360px" borderRadius="var(--radius-lg)" />
        <Skeleton height="40px" width="50%" />
        <Skeleton height="220px" borderRadius="var(--radius-md)" />
      </div>
    );
  }

  if (!pala) {
    return (
      <div className="card-skeuomorphic" style={{ padding: '48px', textAlign: 'center' }}>
        <h2>Pala no encontrada</h2>
        <Link to="/catalogo" className="btn-primary" style={{ marginTop: '16px' }}>
          Volver al Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', width: '100%' }}>
      {/* Botón Volver */}
      <Link
        to="/catalogo"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--text-secondary)',
          fontSize: '0.88rem',
          fontWeight: 700,
          width: 'fit-content',
        }}
      >
        <ArrowLeft size={16} />
        <span>Volver al Catálogo</span>
      </Link>

      {/* Contenedor Responsivo Desktop: 2 Columnas en PC */}
      <div className="pala-grid-layout">
        {/* ==========================================================
            COLUMNA IZQUIERDA: Visor de Producto, Precio & CTA
            ========================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <section
            className="card-skeuomorphic"
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {/* Pedestal 3D de la Pala */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '320px',
                background: 'radial-gradient(circle at 50% 35%, var(--bg-card-hover) 0%, var(--bg-input) 100%)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                position: 'relative',
                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.3)',
              }}
            >
              <img
                src={pala.imagenUrl || 'https://noxsport.es/cdn/shop/files/PALA_NOX_AT10_GENIUS_18K_BY_AGUSTIN_TAPIA_2025_01.png'}
                alt={pala.modelo}
                style={{
                  maxHeight: '90%',
                  maxWidth: '90%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 16px 28px rgba(0,0,0,0.65))',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '14px',
                  right: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: 'rgba(11, 15, 23, 0.85)',
                  backdropFilter: 'blur(8px)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  color: 'var(--color-accent-amber)',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <Star size={15} fill="var(--color-accent-amber)" />
                <span>{pala.puntuacionGeneral.toFixed(1)} / 5.0</span>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {pala.marcaNombre}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>•</span>
                <span style={{ fontSize: '0.80rem', color: 'var(--text-muted)' }}>{pala.marcaPais}</span>
                <span style={{ color: 'var(--text-muted)' }}>•</span>
                <span style={{ fontSize: '0.80rem', color: 'var(--text-muted)' }}>{pala.anoLanzamiento}</span>
              </div>

              <h1 style={{ fontSize: '1.9rem', fontWeight: 900, lineHeight: 1.15 }}>
                {pala.modelo}
              </h1>

              {pala.jugadorPro && (
                <p style={{ fontSize: '0.90rem', color: 'var(--color-primary-sage)', fontWeight: 700, marginTop: '6px' }}>
                  Empuñada en el circuito profesional por {pala.jugadorPro}
                </p>
              )}

              {pala.descripcion && (
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '12px' }}>
                  {pala.descripcion}
                </p>
              )}
            </div>

            {/* SECCIÓN DESTACADA: Precio Oficial y Fuente */}
            <div
              style={{
                padding: '16px',
                background: 'var(--bg-input)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Precio de Referencia Oficial
                </span>
                <span className="badge badge-sage">
                  <Tag size={11} />
                  <span>{pala.monedaPrecio || 'EUR'}</span>
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '1.9rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  {pala.precioReferencia.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <ShieldCheck size={14} color="var(--color-primary-sage)" />
                <span>Fuente: {pala.fuentePrecio || `PVP Oficial Recomendado ${pala.marcaNombre}`}</span>
              </div>
            </div>

            {/* Botones de Acción Táctiles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => (isAuthenticated ? setShowPaleteroModal(true) : alert('Iniciá sesión para guardar palas en tu paletero.'))}
                className="btn-primary"
                style={{ width: '100%' }}
              >
                <Briefcase size={16} />
                <span>Guardar en Mi Paletero</span>
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  onClick={() => (isAuthenticated ? setShowVotoModal(true) : alert('Iniciá sesión para votar atributos técnicos.'))}
                  className="btn-secondary"
                >
                  <Sliders size={15} />
                  <span>Votar Atributos</span>
                </button>

                <button
                  onClick={() => (isAuthenticated ? setShowResenaModal(true) : alert('Iniciá sesión para publicar una reseña técnica.'))}
                  className="btn-secondary"
                >
                  <MessageSquarePlus size={15} />
                  <span>Escribir Review</span>
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* ==========================================================
            COLUMNA DERECHA: Anatomía 3 Niveles, Radar, Dureza, Similares
            ========================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Anatomía Técnica de 3 Niveles */}
          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={19} color="var(--color-primary-sage)" />
              <span>Anatomía Técnica de 3 Niveles</span>
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              {/* Nivel 1: Macro (Geometría) */}
              <div className="card-skeuomorphic" style={{ padding: '16px' }}>
                <span className="badge badge-neutral" style={{ marginBottom: '8px' }}>Nivel 1: Geometría</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Formato:</span>
                    <strong>{pala.forma}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Balance:</span>
                    <strong>{pala.balanceMm} mm</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Peso:</span>
                    <strong>{pala.pesoMin} - {pala.pesoMax} g</strong>
                  </div>
                </div>
              </div>

              {/* Nivel 2: Mesodermo (Caras) */}
              <div className="card-skeuomorphic" style={{ padding: '16px' }}>
                <span className="badge badge-steel" style={{ marginBottom: '8px' }}>Nivel 2: Caras</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Material Caras:</span>
                    <strong>{pala.materialCaras}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Superficie:</span>
                    <strong>{pala.superficieRugosa}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Temporada:</span>
                    <strong>{pala.anoLanzamiento}</strong>
                  </div>
                </div>
              </div>

              {/* Nivel 3: Núcleo (Alma) */}
              <div className="card-skeuomorphic" style={{ padding: '16px' }}>
                <span className="badge badge-sage" style={{ marginBottom: '8px' }}>Nivel 3: Núcleo</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Goma Núcleo:</span>
                    <strong>{pala.materialNucleo}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Clima Recomendado:</span>
                    <strong>{pala.estacionOptima}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Dureza Escala:</span>
                    <strong style={{ color: 'var(--color-primary-sage)' }}>{pala.durezaPromedio.toFixed(1)} / 10</strong>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Radar de Sensaciones en Pista */}
          <section className="card-skeuomorphic" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={19} color="var(--color-primary-sage)" />
              <span>Matriz de Sensaciones en Pista (Radar de 6 Ejes)</span>
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              Evaluación sensorial y dinámica normalizada en escala de 1 a 10.
            </p>

            <RadarChart
              data={{
                potencia: pala.potenciaPromedio,
                control: pala.controlPromedio,
                salidaBola: pala.salidaBolaPromedio,
                maniobrabilidad: pala.maniobrabilidadPromedio,
                puntoDulce: pala.puntoDulcePromedio,
                confort: pala.confortPromedio,
              }}
              size={360}
            />
          </section>

          {/* Comportamiento Térmico y Dureza */}
          <DurezaBar
            dureza={pala.durezaPromedio}
            estacionOptima={pala.estacionOptima}
            totalVotos={pala.totalVotos}
          />

          {/* Motor de Similitud Vectorial ("Esta pala se siente como...") */}
          {pala.palasSimilares && pala.palasSimilares.length > 0 && (
            <section>
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={19} color="var(--color-primary-sage)" />
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Esta pala se siente como...</h2>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Alternativas directas calculadas algorítmicamente mediante distancia vectorial multicriterio.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                {pala.palasSimilares.map((sim) => (
                  <Link
                    key={sim.id}
                    to={`/palas/${sim.id}`}
                    className="card-skeuomorphic"
                    style={{
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      textDecoration: 'none',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-neutral">{sim.forma}</span>
                      <span className="badge badge-sage" style={{ fontWeight: 800 }}>
                        {sim.similitudPorcentaje}% Match
                      </span>
                    </div>

                    <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img
                        src={sim.imagenUrl || 'https://noxsport.es/cdn/shop/files/PALA_NOX_AT10_GENIUS_18K_BY_AGUSTIN_TAPIA_2025_01.png'}
                        alt={sim.modelo}
                        style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                      />
                    </div>

                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                        {sim.marcaNombre}
                      </span>
                      <h4 style={{ fontSize: '0.98rem', fontWeight: 800, marginTop: '2px' }}>{sim.modelo}</h4>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <span>Dureza: <strong style={{ color: 'var(--text-primary)' }}>{sim.durezaPromedio.toFixed(1)}/10</strong></span>
                      <span style={{ color: 'var(--color-primary-sage)', fontWeight: 700 }}>{sim.precioReferencia.toFixed(2)} €</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Reseñas de la Comunidad */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Reviews y Testimonios en Pista</h2>
                <span style={{ fontSize: '0.80rem', color: 'var(--text-muted)' }}>{pala.totalResenas} reseñas de jugadores</span>
              </div>
              <button
                onClick={() => (isAuthenticated ? setShowResenaModal(true) : alert('Iniciá sesión para publicar una reseña.'))}
                className="btn-primary"
                style={{ padding: '6px 14px', fontSize: '0.80rem' }}
              >
                <span>+ Escribir Review</span>
              </button>
            </div>

            {loadingResenas ? (
              <Skeleton height="100px" borderRadius="var(--radius-md)" />
            ) : resenas.length === 0 ? (
              <div className="card-skeuomorphic" style={{ padding: '28px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  Aún no hay reseñas registradas para este modelo. ¡Sé el primero en compartir tu experiencia en pista!
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {resenas.map((r) => (
                  <div key={r.id} className="card-skeuomorphic" style={{ padding: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <strong style={{ fontSize: '0.92rem' }}>{r.usuarioNombre}</strong>
                          <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>{r.usuarioNivelJuego}</span>
                          <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>Lado {r.ladoPista}</span>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tiempo de uso: {r.tiempoUso}</span>
                      </div>
                      <div style={{ display: 'flex', color: 'var(--color-accent-amber)' }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={13} fill={i < r.puntuacion ? 'var(--color-accent-amber)' : 'none'} />
                        ))}
                      </div>
                    </div>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 800, marginBottom: '6px' }}>{r.titulo}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>{r.contenido}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Modales */}
      {showResenaModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(11, 15, 23, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: '16px',
          }}
        >
          <div className="card-skeuomorphic animate-slide-up" style={{ width: '100%', maxWidth: '480px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '14px' }}>
              Publicar Review Técnica
            </h3>
            {resenaError && (
              <div style={{ padding: '10px', background: 'rgba(224, 122, 95, 0.15)', border: '1px solid var(--color-accent-terracotta)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.82rem', marginBottom: '12px' }}>
                {resenaError}
              </div>
            )}
            <form onSubmit={handlePublicarResena} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  Calificación en Pista
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setResenaPuntuacion(star)}
                      style={{ color: star <= resenaPuntuacion ? 'var(--color-accent-amber)' : 'var(--text-muted)' }}
                    >
                      <Star size={22} fill={star <= resenaPuntuacion ? 'var(--color-accent-amber)' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  Título del Review
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Toque seco y control milimétrico en víboras"
                  value={resenaTitulo}
                  onChange={(e) => setResenaTitulo(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  Sensaciones en Pista
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describí el comportamiento en fondo de pista, voleas, defensa y salida de pared..."
                  value={resenaContenido}
                  onChange={(e) => setResenaContenido(e.target.value)}
                  className="input-field"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                    Tu Posición en Pista
                  </label>
                  <select
                    value={resenaLado}
                    onChange={(e) => setResenaLado(e.target.value)}
                    className="input-field"
                  >
                    <option value="Reves">Revés</option>
                    <option value="Drive">Drive</option>
                    <option value="Indistinto">Indistinto</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                    Tiempo de Uso
                  </label>
                  <select
                    value={resenaTiempo}
                    onChange={(e) => setResenaTiempo(e.target.value)}
                    className="input-field"
                  >
                    <option value="1 semana">1 semana</option>
                    <option value="1 mes">1 mes</option>
                    <option value="3 meses">3 meses</option>
                    <option value="+6 meses">+6 meses</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowResenaModal(false)}
                  className="btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={resenaEnviando}
                  className="btn-primary"
                  style={{ flex: 1 }}
                >
                  {resenaEnviando ? 'Publicando...' : 'Publicar Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Votar Atributos */}
      {showVotoModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(11, 15, 23, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: '16px',
          }}
        >
          <div className="card-skeuomorphic animate-slide-up" style={{ width: '100%', maxWidth: '480px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px' }}>
              Votar Atributos Técnicos 📊
            </h3>
            <p style={{ fontSize: '0.80rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Tu voto recalcula de forma atómica la matriz comunitaria de Palantica.
            </p>

            <form onSubmit={handleEmitirVoto} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Dureza Percibida (1: Blanda -> 10: Tabla)', val: votoDureza, set: setVotoDureza },
                { label: 'Potencia', val: votoPotencia, set: setVotoPotencia },
                { label: 'Control', val: votoControl, set: setVotoControl },
                { label: 'Salida de Bola', val: votoSalidaBola, set: setVotoSalidaBola },
                { label: 'Maniobrabilidad', val: votoManiobrabilidad, set: setVotoManiobrabilidad },
                { label: 'Punto Dulce', val: votoPuntoDulce, set: setVotoPuntoDulce },
                { label: 'Confort de Brazo', val: votoConfort, set: setVotoConfort },
              ].map((item) => (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                    <span>{item.label}</span>
                    <strong style={{ color: 'var(--color-primary-sage)' }}>{item.val}/10</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={item.val}
                    onChange={(e) => item.set(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--color-primary-sage)' }}
                  />
                </div>
              ))}

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  Comportamiento Térmico Recomendado
                </label>
                <select
                  value={votoEstacion}
                  onChange={(e) => setVotoEstacion(e.target.value)}
                  className="input-field"
                >
                  <option value="TodoAno">Todo el Año</option>
                  <option value="Verano">Verano (&gt;25°C / Goma que no ablande)</option>
                  <option value="Invierno">Invierno (&lt;15°C / Goma que no endurezca)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowVotoModal(false)} className="btn-secondary" style={{ flex: 1 }}>
                  Cancelar
                </button>
                <button type="submit" disabled={votoEnviando} className="btn-primary" style={{ flex: 1 }}>
                  {votoEnviando ? 'Guardando...' : 'Registrar Voto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Paletero */}
      {showPaleteroModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(11, 15, 23, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: '16px',
          }}
        >
          <div className="card-skeuomorphic animate-slide-up" style={{ width: '100%', maxWidth: '420px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '12px' }}>
              Guardar en Mi Paletero 🎒
            </h3>

            {paleteroSuccess ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-primary-sage)' }}>
                <CheckCircle2 size={40} style={{ margin: '0 auto 10px' }} />
                <p style={{ fontWeight: 700 }}>¡Pala guardada en tu paletero con éxito!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                    Compartimento / Estado
                  </label>
                  <select
                    value={paleteroCat}
                    onChange={(e) => setPaleteroCat(e.target.value as CategoriaPaletero)}
                    className="input-field"
                  >
                    <option value="Usando actualmente">🎾 Usando actualmente (Pala titular)</option>
                    <option value="En el paletero">🎒 En el paletero (Suplente / Reserva)</option>
                    <option value="Palas que quiero">⭐ Palas que quiero (Wishlist)</option>
                    <option value="Palas que tuve">📜 Palas que tuve (Historial)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                    Notas Personales (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Con protector rugoso y 2 overgrips"
                    value={paleteroNotas}
                    onChange={(e) => setPaleteroNotas(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button onClick={() => setShowPaleteroModal(false)} className="btn-secondary" style={{ flex: 1 }}>
                    Cancelar
                  </button>
                  <button onClick={handleAgregarPaletero} className="btn-primary" style={{ flex: 1 }}>
                    Guardar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .pala-grid-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        @media (min-width: 992px) {
          .pala-grid-layout {
            grid-template-columns: 440px 1fr;
            align-items: start;
          }
        }
      `}</style>
    </div>
  );
};
