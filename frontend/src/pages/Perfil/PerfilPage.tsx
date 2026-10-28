import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { resenasApi, type ResenaConPala } from '../../api/resenas';
import { useAuth } from '../../hooks/useAuth';
import type { PerfilUsuario } from '../../types';
import { Skeleton } from '../../components/ui/Skeleton';
import { PerfilPaleteroSection } from '../../components/perfil/PerfilPaleteroSection';
import {
  User,
  LogOut,
  Star,
  Sliders,
  Briefcase,
  Camera,
  LogIn,
  MessageSquare,
  ExternalLink,
  Layers,
  Send,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  KeyRound,
  QrCode,
  X
} from 'lucide-react';
import { reportesApi } from '../../api/reportes';

export const PerfilPage: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [misResenas, setMisResenas] = useState<ResenaConPala[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingResenas, setLoadingResenas] = useState(true);

  // Estados para reporte y feedback
  const [reporteAsunto, setReporteAsunto] = useState('');
  const [reporteMensaje, setReporteMensaje] = useState('');
  const [enviandoReporte, setEnviandoReporte] = useState(false);
  const [reporteExito, setReporteExito] = useState(false);
  const [reporteError, setReporteError] = useState('');

  // Estados para ÉPICA 3: Autenticación en 2 Pasos (2FA)
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState<{ secret: string; qrUri: string } | null>(null);
  const [twoFactorInputCode, setTwoFactorInputCode] = useState('');
  const [activando2FA, setActivando2FA] = useState(false);
  const [twoFactorSuccess, setTwoFactorSuccess] = useState('');
  const [twoFactorError, setTwoFactorError] = useState('');
  const [showDesactivar2FAModal, setShowDesactivar2FAModal] = useState(false);
  const [desactivarPassword, setDesactivarPassword] = useState('');
  const [desactivando2FA, setDesactivando2FA] = useState(false);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    async function loadPerfil() {
      if (!isAuthenticated) {
        setLoading(false);
        setLoadingResenas(false);
        return;
      }
      try {
        const data = await authApi.getPerfil();
        setPerfil(data);
      } catch (err) {
        console.error('Error cargando perfil:', err);
      } finally {
        setLoading(false);
      }

      try {
        const resenasData = await resenasApi.getMisResenas();
        setMisResenas(resenasData || []);
      } catch (err) {
        console.error('Error cargando reseñas del usuario:', err);
      } finally {
        setLoadingResenas(false);
      }
    }
    loadPerfil();
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handlePaleteroUpdate = React.useCallback((totalCount: number) => {
    setPerfil((prev) => {
      if (!prev || prev.totalPaletero === totalCount) return prev;
      return { ...prev, totalPaletero: totalCount };
    });
  }, []);

  const handleEnviarReporte = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reporteAsunto.trim() || !reporteMensaje.trim()) {
      setReporteError('Por favor completa tanto el Asunto como el Mensaje.');
      return;
    }
    setEnviandoReporte(true);
    setReporteError('');
    setReporteExito(false);
    try {
      await reportesApi.crearReporte(reporteAsunto.trim(), reporteMensaje.trim());
      setReporteExito(true);
      setReporteAsunto('');
      setReporteMensaje('');
    } catch (err: any) {
      setReporteError(err.message || 'Error al enviar el reporte. Inténtalo nuevamente.');
    } finally {
      setEnviandoReporte(false);
    }
  };

  const handleIniciarConfiguracion2FA = async () => {
    setTwoFactorError('');
    setTwoFactorSuccess('');
    try {
      const data = await authApi.configurar2FA();
      setTwoFactorData(data);
      setShow2FAModal(true);
    } catch (err: any) {
      setTwoFactorError(err.message || err.error || 'No se pudo generar la configuración de 2FA.');
    }
  };

  const handleConfirmarActivar2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorData || twoFactorInputCode.length !== 6) return;
    setActivando2FA(true);
    setTwoFactorError('');
    try {
      await authApi.activar2FA(twoFactorData.secret, twoFactorInputCode);
      setPerfil(prev => prev ? { ...prev, twoFactorEnabled: true } : null);
      setTwoFactorSuccess('¡Autenticación en 2 pasos activada con éxito!');
      setShow2FAModal(false);
      setTwoFactorInputCode('');
      setTwoFactorData(null);
    } catch (err: any) {
      setTwoFactorError(err.message || err.error || 'Código incorrecto. Verifica la hora de tu app autenticadora.');
    } finally {
      setActivando2FA(false);
    }
  };

  const handleConfirmarDesactivar2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desactivarPassword) return;
    setDesactivando2FA(true);
    setTwoFactorError('');
    try {
      await authApi.desactivar2FA(desactivarPassword);
      setPerfil(prev => prev ? { ...prev, twoFactorEnabled: false } : null);
      setTwoFactorSuccess('Autenticación en 2 pasos desactivada.');
      setShowDesactivar2FAModal(false);
      setDesactivarPassword('');
    } catch (err: any) {
      setTwoFactorError(err.message || err.error || 'Contraseña incorrecta.');
    } finally {
      setDesactivando2FA(false);
    }
  };

  const handleCopiarClave = () => {
    if (!twoFactorData) return;
    navigator.clipboard.writeText(twoFactorData.secret);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  if (!isAuthenticated) {
    return (
      <div
        className="card-skeuomorphic animate-fade-in"
        style={{
          padding: '48px 24px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <User size={48} color="var(--color-primary-sage)" />
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Perfil de Jugador</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', fontSize: '0.92rem', lineHeight: 1.5 }}>
          Accedé a tu perfil para consultar tus estadísticas de comunidad, votos térmicos y palas activas.
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Skeleton height="160px" borderRadius="var(--radius-lg)" />
        <Skeleton height="200px" borderRadius="var(--radius-md)" />
      </div>
    );
  }

  if (!perfil) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      {/* Tarjeta de Identidad del Jugador (Sin Pala Titular en la tarjeta personal) */}
      <section
        className="card-skeuomorphic"
        style={{
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          background: 'radial-gradient(ellipse at top left, rgba(82, 183, 136, 0.12) 0%, var(--bg-card) 70%)',
          border: '1px solid var(--border-card-hover)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, var(--color-primary-sage) 0%, var(--color-primary-sage-dim) 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '1.8rem',
              fontFamily: 'var(--font-serif)',
              boxShadow: '0 4px 16px var(--color-primary-sage-glow)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            {perfil.nombre.charAt(0).toUpperCase()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900 }}>{perfil.nombre}</h1>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{perfil.email}</span>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <span className="badge badge-sage">{perfil.nivelJuego}</span>
              <span className="badge badge-neutral">Lado {perfil.ladoPistaPreferido}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sección Mi Paletero: 4 Compartimentos con pestañas */}
      <PerfilPaleteroSection
        onPaleteroUpdate={handlePaleteroUpdate}
      />

      {/* Grid de Estadísticas Comunitarias */}
      <section>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '14px' }}>
          Actividad en Palantica
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          <div className="card-skeuomorphic" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary-sage)' }}>
              <Star size={16} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Reviews</span>
            </div>
            <span style={{ fontSize: '1.8rem', fontWeight: 900 }}>
              {Math.max(perfil.totalResenas, misResenas.length)}
            </span>
          </div>

          <div className="card-skeuomorphic" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-accent-steel)' }}>
              <Sliders size={16} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Votos</span>
            </div>
            <span style={{ fontSize: '1.8rem', fontWeight: 900 }}>{perfil.totalVotos}</span>
          </div>

          <div className="card-skeuomorphic" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-accent-amber)' }}>
              <Briefcase size={16} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Paletero</span>
            </div>
            <span style={{ fontSize: '1.8rem', fontWeight: 900 }}>{perfil.totalPaletero}</span>
          </div>

          <div className="card-skeuomorphic" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-accent-terracotta)' }}>
              <Camera size={16} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Padelgram</span>
            </div>
            <span style={{ fontSize: '1.8rem', fontWeight: 900 }}>{perfil.totalPadelgramPosts}</span>
          </div>
        </div>
      </section>

      {/* Sección al fondo del perfil: Reseñas realizadas por el usuario */}
      <section className="bg-[var(--bg-surface)] border border-zinc-200 dark:border-white/10 rounded-3xl p-5 sm:p-7 shadow-lg flex flex-col gap-5 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <MessageSquare size={20} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight m-0">
                Mis Reseñas Publicadas
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 m-0 mt-0.5">
                Historial técnico y valoraciones en pista que compartiste con la comunidad.
              </p>
            </div>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[var(--bg-card-subtle)] text-[var(--text-primary)] border border-zinc-200 dark:border-white/10 self-start sm:self-auto">
            {misResenas.length} {misResenas.length === 1 ? 'reseña' : 'reseñas'}
          </span>
        </div>

        {loadingResenas ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton height="140px" borderRadius="1rem" />
            <Skeleton height="140px" borderRadius="1rem" />
          </div>
        ) : misResenas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
            {misResenas.map((resena) => (
              <div
                key={resena.id}
                className="p-5 rounded-2xl bg-[var(--bg-card)] border border-zinc-200 dark:border-white/10 hover:border-emerald-500/40 transition-all flex flex-col justify-between gap-3 shadow-sm hover:shadow-md"
              >
                <div>
                  {/* Encabezado de la reseña: Pala y Estrellas */}
                  <div className="flex items-start justify-between gap-3 border-b border-zinc-200/60 dark:border-white/5 pb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 flex items-center justify-center p-1 flex-shrink-0">
                        {resena.palaImagenUrl ? (
                          <img
                            src={resena.palaImagenUrl}
                            alt={resena.palaModelo || 'Pala'}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <Layers size={20} className="text-zinc-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block truncate">
                          {resena.palaMarca || 'Pala Técnica'}
                        </span>
                        <h4 className="text-sm font-bold text-[var(--text-primary)] truncate m-0">
                          {resena.palaModelo || `Pala #${resena.palaId}`}
                        </h4>
                      </div>
                    </div>

                    {/* Estrellas */}
                    <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20 flex-shrink-0">
                      <Star size={13} className="text-amber-500 fill-amber-500" />
                      <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                        {resena.puntuacion}/5
                      </span>
                    </div>
                  </div>

                  {/* Título y Contenido */}
                  <div className="pt-3">
                    <h5 className="text-sm font-extrabold text-[var(--text-primary)] m-0 mb-1">
                      {resena.titulo}
                    </h5>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed m-0">
                      {resena.contenido}
                    </p>
                  </div>
                </div>

                {/* Pie de la card: Badges y Ficha Técnica */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-200/60 dark:border-white/5 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <div className="flex items-center gap-2 flex-wrap">
                    {resena.ladoPista && (
                      <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold">
                        Lado {resena.ladoPista}
                      </span>
                    )}
                    {resena.tiempoUso && (
                      <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold">
                        Uso: {resena.tiempoUso}
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/palas/${resena.palaId}`}
                    className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex-shrink-0 text-xs"
                  >
                    <span>Ver Pala</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Estado Vacío de Reseñas */
          <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-zinc-300 dark:border-white/10 bg-[var(--bg-card-subtle)] gap-3 animate-fade-in transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
              <MessageSquare size={24} />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-[var(--text-primary)] m-0">
                Aún no has publicado reseñas técnicas
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 m-0 mt-1 max-w-sm">
                Probá tus palas en pista y compartí tus sensaciones de potencia, control y salida de bola con la comunidad de Palantica.
              </p>
            </div>
            <Link
              to="/paletas"
              className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs transition-colors"
            >
              <ExternalLink size={14} />
              <span>Explorar Paletas para Reseñar</span>
            </Link>
          </div>
        )}
      </section>

      {/* Sección: Enviar Reporte o Mensaje a los Administradores */}
      <section className="card-skeuomorphic p-6 sm:p-7 flex flex-col gap-5 rounded-3xl bg-[var(--bg-surface)] border border-zinc-200 dark:border-white/10 shadow-lg transition-colors">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-[var(--text-primary)] m-0">
                Centro de Soporte & Reportes
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 m-0 mt-0.5">
                Reporta un bug, sugiere mejoras o envía consultas directas a los administradores de Palantica.
              </p>
            </div>
          </div>
        </div>

        {reporteExito && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-600 dark:text-emerald-400 text-sm font-bold animate-fade-in">
            <CheckCircle2 size={20} className="flex-shrink-0" />
            <span>¡Tu mensaje de reporte fue enviado con éxito a los administradores! Lo revisaremos a la brevedad.</span>
          </div>
        )}

        {reporteError && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-500 text-sm font-bold animate-fade-in">
            <AlertTriangle size={20} className="flex-shrink-0" />
            <span>{reporteError}</span>
          </div>
        )}

        <form onSubmit={handleEnviarReporte} className="flex flex-col gap-4">
          {/* Chips de Asunto Rápido */}
          <div>
            <label className="block text-xs font-black uppercase text-zinc-500 dark:text-zinc-400 mb-2 tracking-wider">
              Asunto:
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {['Reporte de Bug', 'Error en Ficha Técnica', 'Sugerencia de Mejora', 'Consulta General'].map((chip) => (
                <button
                  type="button"
                  key={chip}
                  onClick={() => setReporteAsunto(chip)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    reporteAsunto === chip
                      ? 'bg-emerald-500 text-zinc-950 font-black shadow-sm'
                      : 'bg-[var(--bg-card-subtle)] hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/80 dark:border-white/5'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={reporteAsunto}
              onChange={(e) => setReporteAsunto(e.target.value)}
              placeholder="Ej: Error al cargar el balance en la pala Nox AT10..."
              required
              className="w-full px-4 py-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-zinc-200 dark:border-white/10 text-sm text-[var(--text-primary)] placeholder-zinc-400 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-zinc-500 dark:text-zinc-400 mb-2 tracking-wider">
              Mensaje:
            </label>
            <textarea
              value={reporteMensaje}
              onChange={(e) => setReporteMensaje(e.target.value)}
              rows={4}
              placeholder="Describe detalladamente el bug, la pala afectada o tu mensaje para el equipo de administración..."
              required
              className="w-full px-4 py-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-zinc-200 dark:border-white/10 text-sm text-[var(--text-primary)] placeholder-zinc-400 focus:outline-none focus:border-emerald-500 transition-colors resize-y leading-relaxed"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={enviandoReporte}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-sm shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Send size={16} />
              <span>{enviandoReporte ? 'Enviando...' : 'Enviar Reporte al Administrador'}</span>
            </button>
          </div>
        </form>
      </section>

      {/* ========================================================
          ÉPICA 3: SEGURIDAD & AUTENTICACIÓN EN 2 PASOS (2FA)
          ======================================================== */}
      <section
        className="card-skeuomorphic p-6 rounded-3xl flex flex-col gap-5 border border-zinc-200/80 dark:border-white/10 shadow-sm"
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              perfil.twoFactorEnabled
                ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                : 'bg-zinc-500/10 text-zinc-400 border border-zinc-200 dark:border-white/10'
            }`}>
              {perfil.twoFactorEnabled ? <ShieldCheck size={22} /> : <ShieldAlert size={22} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-[var(--text-primary)]">
                  Autenticación en 2 Pasos (2FA)
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  perfil.twoFactorEnabled
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border border-zinc-300 dark:border-white/10'
                }`}>
                  {perfil.twoFactorEnabled ? 'Activado' : 'Desactivado'}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {perfil.twoFactorEnabled
                  ? 'Tu cuenta está protegida con código de autenticación TOTP de 6 dígitos.'
                  : 'Añadí una capa extra de seguridad usando Google Authenticator, Authy o 1Password.'}
              </p>
            </div>
          </div>

          <div>
            {perfil.twoFactorEnabled ? (
              <button
                type="button"
                onClick={() => setShowDesactivar2FAModal(true)}
                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
              >
                Desactivar 2FA
              </button>
            ) : (
              <button
                type="button"
                onClick={handleIniciarConfiguracion2FA}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-black shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                Activar 2FA
              </button>
            )}
          </div>
        </div>

        {twoFactorSuccess && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 size={16} />
            <span>{twoFactorSuccess}</span>
          </div>
        )}

        {twoFactorError && !show2FAModal && !showDesactivar2FAModal && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <AlertTriangle size={16} />
            <span>{twoFactorError}</span>
          </div>
        )}

        {/* Modal de Activación de 2FA */}
        {show2FAModal && twoFactorData && (
          <div className="p-5 rounded-2xl bg-[var(--bg-card-subtle)] border border-emerald-500/30 flex flex-col gap-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode size={18} className="text-emerald-500" />
                <h4 className="text-sm font-black text-[var(--text-primary)]">Configurar aplicación autenticadora</h4>
              </div>
              <button
                type="button"
                onClick={() => setShow2FAModal(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4 items-center">
              {/* Código QR renderizado */}
              <div className="flex justify-center p-3 bg-white rounded-2xl shadow-sm border border-zinc-200">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(twoFactorData.qrUri)}`}
                  alt="Código QR 2FA"
                  className="w-40 h-40 object-contain"
                />
              </div>

              <div className="flex flex-col gap-3">
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  1. Escaneá el código QR con tu app de autenticación (Google Authenticator, Microsoft Authenticator o Authy).
                </p>

                <div>
                  <span className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    O ingresá la clave secreta manualmente:
                  </span>
                  <div className="flex items-center gap-2">
                    <code className="px-3 py-1.5 rounded-xl bg-black/30 border border-white/10 text-emerald-400 font-mono text-xs tracking-wider select-all">
                      {twoFactorData.secret}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopiarClave}
                      className="p-1.5 rounded-lg bg-[var(--bg-input)] hover:bg-zinc-700 text-zinc-300 transition-colors"
                      title="Copiar clave secreta"
                    >
                      {copiado ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <form onSubmit={handleConfirmarActivar2FA} className="flex flex-col gap-2 mt-1">
                  <label className="text-xs font-bold text-[var(--text-primary)]">
                    2. Ingresá el código de 6 dígitos que muestra tu app:
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="000000"
                        value={twoFactorInputCode}
                        onChange={(e) => setTwoFactorInputCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-input)] border border-white/10 text-center font-mono font-bold text-base tracking-widest text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                      />
                      <KeyRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    </div>
                    <button
                      type="submit"
                      disabled={activando2FA || twoFactorInputCode.length !== 6}
                      className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs transition-all disabled:opacity-50 cursor-pointer whitespace-nowrap"
                    >
                      {activando2FA ? 'Verificando...' : 'Confirmar & Activar'}
                    </button>
                  </div>
                  {twoFactorError && (
                    <span className="text-xs text-rose-500 font-semibold">{twoFactorError}</span>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Desactivación de 2FA */}
        {showDesactivar2FAModal && (
          <form
            onSubmit={handleConfirmarDesactivar2FA}
            className="p-5 rounded-2xl bg-[var(--bg-card-subtle)] border border-rose-500/30 flex flex-col gap-3 animate-fade-in"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-rose-500 flex items-center gap-2">
                <ShieldAlert size={16} />
                <span>Confirmar desactivación de 2FA</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowDesactivar2FAModal(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Por tu seguridad, ingresá tu contraseña para deshabilitar la autenticación en 2 pasos de tu cuenta.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="password"
                required
                placeholder="Tu contraseña actual"
                value={desactivarPassword}
                onChange={(e) => setDesactivarPassword(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--bg-input)] border border-white/10 text-sm text-[var(--text-primary)] focus:outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                disabled={desactivando2FA || !desactivarPassword}
                className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs transition-all disabled:opacity-50 cursor-pointer whitespace-nowrap"
              >
                {desactivando2FA ? 'Desactivando...' : 'Desactivar 2FA'}
              </button>
            </div>
            {twoFactorError && (
              <span className="text-xs text-rose-500 font-semibold">{twoFactorError}</span>
            )}
          </form>
        )}
      </section>

      {/* Botón de Logout */}
      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <button
          onClick={handleLogout}
          className="btn-secondary"
          style={{
            color: 'var(--color-accent-terracotta)',
            borderColor: 'rgba(224, 122, 95, 0.3)',
            marginTop: '12px',
          }}
        >
          <LogOut size={16} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};
