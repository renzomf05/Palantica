import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { palasApi } from '../../api/palas';
import { resenasApi } from '../../api/resenas';
import { votacionesApi } from '../../api/votaciones';
import { paleteroApi } from '../../api/paletero';
import { padelgramApi } from '../../api/padelgram';
import { useAuth } from '../../hooks/useAuth';
import type { PalaDetalle, Resena, CategoriaPaletero, PadelgramPost } from '../../types';
import { RadarChart } from '../../components/palas/RadarChart';
import { AcordesDeJuego } from '../../components/palas/AcordesDeJuego';
import { PiramideMateriales } from '../../components/palas/PiramideMateriales';
import { MatrizTermica } from '../../components/palas/MatrizTermica';
import { SentimientoJugador } from '../../components/palas/SentimientoJugador';
import { PrecioReferenciaBox } from '../../components/palas/PrecioReferenciaBox';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Star,
  Briefcase,
  Activity,
  Sliders,
  MessageSquarePlus,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  ArrowLeftRight,
  Camera,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

export const PalaDetallePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const palaId = Number(id);
  const { isAuthenticated } = useAuth();

  const [pala, setPala] = useState<PalaDetalle | null>(null);
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [padelgramPosts, setPadelgramPosts] = useState<PadelgramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingResenas, setLoadingResenas] = useState(true);

  // Validación comunitaria de similitud ("¿Se siente igual en pista?")
  const [similarVotes, setSimilarVotes] = useState<Record<number, 'yes' | 'no'>>({});

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

  const cargarDatos = React.useCallback(async () => {
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

    try {
      const padelgramData = await padelgramApi.getFeed(1, 6, palaId);
      setPadelgramPosts(padelgramData.items);
    } catch (err) {
      console.error('Error cargando Padelgram reel:', err);
    }
  }, [palaId]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => {
      cargarDatos();
    }, 0);
    return () => clearTimeout(timer);
  }, [cargarDatos]);

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

  const handleVoteSimilar = (similarId: number, type: 'yes' | 'no') => {
    setSimilarVotes((prev) => ({
      ...prev,
      [similarId]: type,
    }));
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

      {/* Contenedor Responsivo Desktop: Layout Asimétrico 2 Columnas */}
      <div className="pala-grid-layout">
        {/* ==========================================================
            COLUMNA IZQUIERDA (Sticky): Pedestal, Título, Precio & CTA
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
            {/* Pedestal Deportivo con Iluminación Superior */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '330px',
                background: 'radial-gradient(circle at 50% 35%, var(--bg-card-hover) 0%, var(--bg-input) 100%)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                position: 'relative',
                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.25)',
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
                  background: 'var(--bg-glass-card)',
                  backdropFilter: 'blur(8px)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  color: 'var(--padel-amber-rating)',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <Star size={15} fill="var(--padel-amber-rating)" />
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

              <h1 style={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1.15 }}>
                {pala.modelo}
              </h1>

              {pala.jugadorPro && (
                <p style={{ fontSize: '0.90rem', color: 'var(--padel-turf-green)', fontWeight: 700, marginTop: '6px' }}>
                  Empuñada en el circuito profesional por {pala.jugadorPro}
                </p>
              )}

              {pala.descripcion && (
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginTop: '12px' }}>
                  {pala.descripcion}
                </p>
              )}
            </div>

            {/* CAJA TÉCNICA DE PRECIO OFICIAL DE REFERENCIA (Requisito planesProyecto.md) */}
            <PrecioReferenciaBox
              precioReferencia={pala.precioReferencia}
              monedaPrecio={pala.monedaPrecio || 'EUR'}
              fuentePrecio={pala.fuentePrecio}
              marcaNombre={pala.marcaNombre}
            />

            {/* Botones de Acción Primaria */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => (isAuthenticated ? setShowPaleteroModal(true) : alert('Iniciá sesión para guardar palas en tu paletero.'))}
                className="btn-primary"
                style={{ width: '100%', borderRadius: '0px' }}
              >
                <Briefcase size={16} />
                <span>Guardar en Mi Paletero</span>
              </button>

              <Link
                to={`/comparador?pala1=${pala.id}`}
                className="btn-secondary"
                style={{ width: '100%', borderRadius: '0px' }}
              >
                <ArrowLeftRight size={15} />
                <span>Comparar A/B con otra pala</span>
              </Link>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  onClick={() => (isAuthenticated ? setShowVotoModal(true) : alert('Iniciá sesión para votar atributos técnicos.'))}
                  className="btn-secondary"
                  style={{ borderRadius: '0px' }}
                >
                  <Sliders size={15} />
                  <span>Votar Atributos</span>
                </button>

                <button
                  onClick={() => (isAuthenticated ? setShowResenaModal(true) : alert('Iniciá sesión para publicar una reseña técnica.'))}
                  className="btn-secondary"
                  style={{ borderRadius: '0px' }}
                >
                  <MessageSquarePlus size={15} />
                  <span>Escribir Review</span>
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* ==========================================================
            COLUMNA DERECHA: Componentes Enciclopédicos de Palantica
            ========================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
          {/* 1. Sensaciones Principales en Pista */}
          <AcordesDeJuego
            potencia={pala.potenciaPromedio}
            control={pala.controlPromedio}
            salidaBola={pala.salidaBolaPromedio}
            maniobrabilidad={pala.maniobrabilidadPromedio}
            puntoDulce={pala.puntoDulcePromedio}
            confort={pala.confortPromedio}
          />

          {/* 2. Pirámide de Construcción Técnica (3 Niveles: Caras, Núcleo, Chasis) */}
          <PiramideMateriales
            materialCaras={pala.materialCaras}
            superficieRugosa={pala.superficieRugosa}
            materialNucleo={pala.materialNucleo}
            forma={pala.forma}
            balanceMm={pala.balanceMm}
            pesoMin={pala.pesoMin}
            pesoMax={pala.pesoMax}
            anoLanzamiento={pala.anoLanzamiento}
          />

          {/* 3. Matriz de Sensaciones en Pista (Radar de 6 Ejes) */}
          <section className="card-skeuomorphic" style={{ padding: '24px' }}>
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={19} color="var(--padel-court-blue-vibrant)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Matriz de Sensaciones en Pista (Radar de 6 Ejes)</h3>
              </div>
              <p style={{ fontSize: '0.80rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Polígono de rendimiento normalizado en laboratorio según telemetría de impactos
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
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
            </div>
          </section>

          {/* 4. Comportamiento Térmico & Escala de Dureza */}
          <MatrizTermica
            dureza={pala.durezaPromedio}
            estacionOptima={pala.estacionOptima}
            totalVotos={pala.totalVotos}
          />

          {/* 5. Sentimiento de la Comunidad (5 Estados sin emojis) */}
          <SentimientoJugador
            palaId={pala.id}
            puntuacionGeneral={pala.puntuacionGeneral}
            totalVotos={pala.totalVotos}
          />

          {/* 6. "Esta pala se siente como..." (Palas Gemelas / Similitud Vectorial) */}
          {pala.palasSimilares && pala.palasSimilares.length > 0 && (
            <section
              className="card-skeuomorphic"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={19} color="var(--padel-ball-yellow-vibrant)" />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Esta pala se siente como...</h3>
                </div>
                <p style={{ fontSize: '0.80rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Modelos equivalentes calculados por proximidad vectorial en balance, dureza de caras y densidad de núcleo
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                {pala.palasSimilares.map((sim) => {
                  const userVote = similarVotes[sim.id];

                  return (
                    <div
                      key={sim.id}
                      style={{
                        padding: '16px',
                        background: 'var(--bg-input)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-card)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="badge badge-neutral">{sim.forma}</span>
                        <span className="badge badge-steel" style={{ fontWeight: 800 }}>
                          {sim.similitudPorcentaje}% Match
                        </span>
                      </div>

                      <Link
                        to={`/palas/${sim.id}`}
                        style={{
                          height: '140px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textDecoration: 'none',
                        }}
                      >
                        <img
                          src={sim.imagenUrl || 'https://noxsport.es/cdn/shop/files/PALA_NOX_AT10_GENIUS_18K_BY_AGUSTIN_TAPIA_2025_01.png'}
                          alt={sim.modelo}
                          style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                        />
                      </Link>

                      <div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                          {sim.marcaNombre}
                        </span>
                        <Link to={`/palas/${sim.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <h4 style={{ fontSize: '0.98rem', fontWeight: 800, marginTop: '2px' }}>{sim.modelo}</h4>
                        </Link>
                      </div>

                      {/* Materiales de la pala gemela */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Caras:</span>
                          <strong style={{ color: 'var(--text-primary)' }}>{sim.materialCaras}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Núcleo:</span>
                          <strong style={{ color: 'var(--text-primary)' }}>{sim.materialNucleo}</strong>
                        </div>
                      </div>

                      {/* Botón de Validación Comunitaria de Similitud */}
                      <div
                        style={{
                          borderTop: '1px solid var(--border-subtle)',
                          paddingTop: '10px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                        }}
                      >
                        <span style={{ fontSize: '0.70rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                          ¿Se siente igual en pista?
                        </span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handleVoteSimilar(sim.id, 'yes')}
                            style={{
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                              padding: '6px 8px',
                              borderRadius: 'var(--radius-xs)',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              background: userVote === 'yes' ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-card)',
                              border: userVote === 'yes' ? '1px solid var(--padel-turf-green)' : '1px solid var(--border-subtle)',
                              color: userVote === 'yes' ? 'var(--padel-turf-green)' : 'var(--text-primary)',
                            }}
                          >
                            <ThumbsUp size={12} />
                            <span>Sí, gemelas</span>
                          </button>

                          <button
                            onClick={() => handleVoteSimilar(sim.id, 'no')}
                            style={{
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                              padding: '6px 8px',
                              borderRadius: '0px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              background: userVote === 'no' ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-card)',
                              border: userVote === 'no' ? '1px solid var(--accord-potencia)' : '1px solid var(--border-subtle)',
                              color: userVote === 'no' ? 'var(--accord-potencia)' : 'var(--text-muted)',
                            }}
                          >
                            <ThumbsDown size={12} />
                            <span>Diferente</span>
                          </button>
                        </div>

                        <Link
                          to={`/comparador?pala1=${pala.id}&pala2=${sim.id}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            padding: '5px 8px',
                            borderRadius: '0px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background: 'rgba(37, 99, 235, 0.10)',
                            border: '1px solid rgba(37, 99, 235, 0.35)',
                            color: 'var(--padel-court-blue-light)',
                            marginTop: '4px',
                          }}
                        >
                          <ArrowLeftRight size={12} />
                          <span>Comparar A/B</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* 7. Galería Padelgram en Pista */}
          {padelgramPosts.length > 0 && (
            <section
              className="card-skeuomorphic"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Camera size={19} color="var(--padel-court-blue-vibrant)" />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Padelgram Reel en Pista</h3>
                </div>
                <Link to="/padelgram" className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                  <span>Ver Feed Social</span>
                </Link>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
                {padelgramPosts.map((post) => (
                  <div
                    key={post.id}
                    style={{
                      height: '140px',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      position: 'relative',
                      border: '1px solid var(--border-subtle)',
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
                        padding: '4px 6px',
                        background: 'linear-gradient(transparent, rgba(10, 17, 40, 0.85))',
                        fontSize: '0.68rem',
                        color: '#FFFFFF',
                        fontWeight: 700,
                      }}
                    >
                      {post.usuarioNombre}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 8. Reseñas Técnicas de la Comunidad */}
          <section
            className="card-skeuomorphic"
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Reviews y Testimonios en Pista</h3>
                <span style={{ fontSize: '0.80rem', color: 'var(--text-muted)' }}>{pala.totalResenas} reseñas de jugadores verificadas</span>
              </div>
              <button
                onClick={() => (isAuthenticated ? setShowResenaModal(true) : alert('Iniciá sesión para publicar una reseña.'))}
                className="btn-primary"
                style={{ padding: '7px 14px', fontSize: '0.80rem' }}
              >
                <span>+ Escribir Review</span>
              </button>
            </div>

            {loadingResenas ? (
              <Skeleton height="100px" borderRadius="var(--radius-md)" />
            ) : resenas.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  Aún no hay reseñas registradas para este modelo. ¡Sé el primero en compartir tus impresiones en pista!
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {resenas.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      padding: '16px',
                      background: 'var(--bg-input)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <strong style={{ fontSize: '0.92rem' }}>{r.usuarioNombre}</strong>
                          <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>{r.usuarioNivelJuego}</span>
                          <span className="badge badge-steel" style={{ fontSize: '0.65rem' }}>Lado {r.ladoPista}</span>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tiempo de uso: {r.tiempoUso}</span>
                      </div>
                      <div style={{ display: 'flex', color: 'var(--padel-amber-rating)' }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={13} fill={i < r.puntuacion ? 'var(--padel-amber-rating)' : 'none'} />
                        ))}
                      </div>
                    </div>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 800 }}>{r.titulo}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>{r.contenido}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Modal Reseña */}
      {showResenaModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 17, 40, 0.88)',
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
              <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--accord-potencia)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.82rem', marginBottom: '12px' }}>
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
                      style={{ color: star <= resenaPuntuacion ? 'var(--padel-amber-rating)' : 'var(--text-muted)' }}
                    >
                      <Star size={22} fill={star <= resenaPuntuacion ? 'var(--padel-amber-rating)' : 'none'} />
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

      {/* Modal Votar Atributos (Sin emojis) */}
      {showVotoModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 17, 40, 0.88)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: '16px',
          }}
        >
          <div className="card-skeuomorphic animate-slide-up" style={{ width: '100%', maxWidth: '480px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Sliders size={20} color="var(--padel-court-blue-vibrant)" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                Votar Atributos Técnicos
              </h3>
            </div>
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
                    <strong style={{ color: 'var(--padel-court-blue-vibrant)' }}>{item.val}/10</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={item.val}
                    onChange={(e) => item.set(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--padel-court-blue-vibrant)' }}
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

      {/* Modal Paletero (Sin emojis) */}
      {showPaleteroModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 17, 40, 0.88)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: '16px',
          }}
        >
          <div className="card-skeuomorphic animate-slide-up" style={{ width: '100%', maxWidth: '420px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Briefcase size={20} color="var(--padel-turf-green)" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                Guardar en Mi Paletero
              </h3>
            </div>

            {paleteroSuccess ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--padel-turf-green)' }}>
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
                    <option value="Usando actualmente">Usando actualmente (Pala titular)</option>
                    <option value="En el paletero">En el paletero (Suplente / Reserva)</option>
                    <option value="Palas que quiero">Palas que quiero (Wishlist)</option>
                    <option value="Palas que tuve">Palas que tuve (Historial)</option>
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
    </div>
  );
};
