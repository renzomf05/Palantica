import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin';
import type { AdminUsuario, Reporte, AdminEstadisticas } from '../../types';
import {
  ShieldCheck,
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  Mail,
  Search
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'usuarios' | 'reportes'>('usuarios');
  const [usuarios, setUsuarios] = useState<AdminUsuario[]>([]);
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [stats, setStats] = useState<AdminEstadisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchUser, setSearchUser] = useState('');
  const [filtroEstadoReporte, setFiltroEstadoReporte] = useState<'TODOS' | 'Pendiente' | 'Resuelto'>('TODOS');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [usersData, reportesData, statsData] = await Promise.all([
        adminApi.getUsuarios().catch(() => []),
        adminApi.getReportes().catch(() => []),
        adminApi.getEstadisticas().catch(() => null),
      ]);
      setUsuarios(usersData || []);
      setReportes(reportesData || []);
      setStats(statsData);
    } catch (err) {
      console.error('Error cargando datos de administración:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleResolverReporte = async (reporteId: number, estadoActual: string) => {
    setActionLoadingId(reporteId);
    try {
      const nuevoEstado = estadoActual === 'Resuelto' ? 'Pendiente' : 'Resuelto';
      const actualizado = await adminApi.actualizarEstadoReporte(reporteId, nuevoEstado);
      setReportes((prev) =>
        prev.map((r) => (r.id === reporteId ? { ...r, estado: actualizado.estado, fechaResolucion: actualizado.fechaResolucion } : r))
      );
      // Actualizar stats
      if (stats) {
        setStats({
          ...stats,
          reportesPendientes: nuevoEstado === 'Resuelto' ? Math.max(0, stats.reportesPendientes - 1) : stats.reportesPendientes + 1,
        });
      }
    } catch (err) {
      console.error('Error actualizando reporte:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleRol = async (userId: number, rolActual: string) => {
    const nuevoRol = rolActual === 'Admin' ? 'Usuario' : 'Admin';
    const confirm = window.confirm(`¿Seguro que deseas cambiar el rol de este usuario a '${nuevoRol}'?`);
    if (!confirm) return;

    setActionLoadingId(userId);
    try {
      await adminApi.cambiarRolUsuario(userId, nuevoRol);
      setUsuarios((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, rol: nuevoRol } : u))
      );
    } catch (err) {
      console.error('Error actualizando rol:', err);
      alert('No se pudo actualizar el rol en la base de datos.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredUsuarios = usuarios.filter((u) => {
    const q = searchUser.toLowerCase().trim();
    return u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const filteredReportes = reportes.filter((r) => {
    if (filtroEstadoReporte === 'TODOS') return true;
    return r.estado.toLowerCase() === filtroEstadoReporte.toLowerCase();
  });

  return (
    <div className="w-full flex flex-col gap-8 animate-fade-in pb-16">
      {/* Header del Panel de Administración */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-zinc-200 dark:border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-md">
            <ShieldCheck size={32} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)] m-0">
                Panel de Administración
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-black uppercase tracking-wider">
                Rol Verificado
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 m-0 mt-1">
              Monitoreo y gestión de usuarios registrados reales y reportes de la comunidad.
            </p>
          </div>
        </div>

        {/* Métricas rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-zinc-200/80 dark:border-white/5 flex flex-col">
            <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Usuarios Reales
            </span>
            <span className="text-2xl font-black text-[var(--text-primary)] mt-0.5">
              {stats?.totalUsuarios ?? usuarios.length}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-zinc-200/80 dark:border-white/5 flex flex-col">
            <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Reportes Totales
            </span>
            <span className="text-2xl font-black text-[var(--text-primary)] mt-0.5">
              {reportes.length}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-amber-500/30 dark:border-amber-500/20 flex flex-col col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Pendientes
            </span>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
              {reportes.filter((r) => r.estado !== 'Resuelto').length}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs principales de Navegación del Panel */}
      <div className="flex border-b border-zinc-200 dark:border-white/10 gap-3 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('usuarios')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm transition-all ${
            activeTab === 'usuarios'
              ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <Users size={18} />
          <span>Usuarios Registrados ({usuarios.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reportes')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm transition-all ${
            activeTab === 'reportes'
              ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <AlertCircle size={18} />
          <span>Mensajes de Reportes ({reportes.length})</span>
          {reportes.filter((r) => r.estado !== 'Resuelto').length > 0 && (
            <span className="ml-1 w-5 h-5 rounded-full bg-amber-500 text-zinc-950 text-xs font-black flex items-center justify-center">
              {reportes.filter((r) => r.estado !== 'Resuelto').length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: USUARIOS REGISTRADOS */}
      {activeTab === 'usuarios' && (
        <div className="flex flex-col gap-5 animate-fade-in">
          {/* Barra de búsqueda de usuarios */}
          <div className="flex items-center gap-3 p-2 rounded-2xl bg-[var(--bg-surface)] border border-zinc-200 dark:border-white/10 shadow-sm max-w-md">
            <Search size={18} className="text-zinc-400 ml-2" />
            <input
              type="text"
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              placeholder="Buscar usuario por nombre o email..."
              className="w-full bg-transparent border-none outline-none text-sm text-[var(--text-primary)] placeholder-zinc-400"
            />
          </div>

          {loading ? (
            <div className="p-12 text-center text-zinc-400">Cargando base de datos de usuarios...</div>
          ) : filteredUsuarios.length === 0 ? (
            <div className="p-12 rounded-3xl bg-[var(--bg-surface)] border border-zinc-200 dark:border-white/10 text-center">
              <Users size={32} className="mx-auto text-zinc-400 mb-2" />
              <p className="text-sm font-bold text-[var(--text-primary)] m-0">No se encontraron usuarios registrados</p>
              <p className="text-xs text-zinc-500 mt-1">Los usuarios que se registren en la plataforma aparecerán aquí en tiempo real.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-3xl border border-zinc-200 dark:border-white/10 bg-[var(--bg-surface)] shadow-lg">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-white/10 text-[11px] font-black uppercase text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/40">
                    <th className="py-4 px-6">Usuario</th>
                    <th className="py-4 px-6">Email</th>
                    <th className="py-4 px-6">Rol</th>
                    <th className="py-4 px-6">Nivel</th>
                    <th className="py-4 px-6">Pista</th>
                    <th className="py-4 px-6">Fecha Registro</th>
                    <th className="py-4 px-6 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/80 dark:divide-white/5">
                  {filteredUsuarios.map((u) => (
                    <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-zinc-950 font-black text-sm flex-shrink-0">
                            {u.nombre.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-[var(--text-primary)] block">{u.nombre}</span>
                            <span className="text-[11px] text-zinc-400">ID #{u.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-zinc-600 dark:text-zinc-300 font-medium">
                        {u.email}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                            u.rol === 'Admin'
                              ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                              : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          {u.rol}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-zinc-600 dark:text-zinc-300">
                        {u.nivelJuego || 'Intermedio'}
                      </td>
                      <td className="py-4 px-6 text-zinc-600 dark:text-zinc-300">
                        {u.ladoPistaPreferido || 'Reves'}
                      </td>
                      <td className="py-4 px-6 text-zinc-400 text-xs">
                        {new Date(u.fechaRegistro).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleRol(u.id, u.rol)}
                          disabled={actionLoadingId === u.id}
                          className="px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-white/10 hover:border-emerald-500 text-xs font-bold text-[var(--text-primary)] hover:text-emerald-500 transition-colors disabled:opacity-50"
                        >
                          {u.rol === 'Admin' ? 'Degradar a Usuario' : 'Promover a Admin'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MENSAJES DE REPORTES */}
      {activeTab === 'reportes' && (
        <div className="flex flex-col gap-6 animate-fade-in">
          {/* Filtro de estados */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider mr-1">Filtrar por:</span>
              {(['TODOS', 'Pendiente', 'Resuelto'] as const).map((est) => (
                <button
                  key={est}
                  type="button"
                  onClick={() => setFiltroEstadoReporte(est)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    filtroEstadoReporte === est
                      ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                      : 'bg-[var(--bg-surface)] border border-zinc-200 dark:border-white/10 text-zinc-500 hover:text-[var(--text-primary)]'
                  }`}
                >
                  {est}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-zinc-400">Cargando reportes de la comunidad...</div>
          ) : filteredReportes.length === 0 ? (
            <div className="p-12 rounded-3xl bg-[var(--bg-surface)] border border-zinc-200 dark:border-white/10 text-center flex flex-col items-center gap-3">
              <CheckCircle2 size={36} className="text-emerald-500" />
              <p className="text-base font-bold text-[var(--text-primary)] m-0">No hay mensajes de reportes {filtroEstadoReporte !== 'TODOS' ? `con estado '${filtroEstadoReporte}'` : ''}</p>
              <p className="text-xs text-zinc-500 max-w-sm m-0">
                Cuando los usuarios envíen reportes de bugs, sugerencias o dudas desde su perfil, se listarán aquí en tiempo real para ser atendidos.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReportes.map((r) => {
                const esResuelto = r.estado.toLowerCase() === 'resuelto';
                return (
                  <div
                    key={r.id}
                    className={`p-6 rounded-3xl bg-[var(--bg-surface)] border transition-all flex flex-col justify-between gap-4 shadow-sm hover:shadow-md ${
                      esResuelto
                        ? 'border-emerald-500/30 dark:border-emerald-500/20'
                        : 'border-amber-500/40 dark:border-amber-500/30'
                    }`}
                  >
                    <div>
                      {/* Cabecera del reporte */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                              esResuelto
                                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {r.estado}
                          </span>
                          <span className="text-[11px] text-zinc-400 flex items-center gap-1 font-medium">
                            <Clock size={12} />
                            {new Date(r.fechaCreacion).toLocaleString()}
                          </span>
                        </div>
                        <span className="text-xs font-black text-zinc-400">ID #{r.id}</span>
                      </div>

                      {/* Asunto */}
                      <h3 className="text-base font-black text-[var(--text-primary)] m-0 mb-2 leading-snug">
                        Asunto: {r.asunto}
                      </h3>

                      {/* Mensaje */}
                      <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-zinc-200/80 dark:border-white/5 my-3">
                        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                          Mensaje del Usuario:
                        </span>
                        <p className="text-sm text-zinc-700 dark:text-zinc-200 whitespace-pre-wrap font-normal m-0 leading-relaxed">
                          {r.mensaje}
                        </p>
                      </div>

                      {/* Info del usuario que reportó */}
                      <div className="flex items-center gap-2 pt-2 border-t border-zinc-200/80 dark:border-white/5 text-xs text-zinc-500 dark:text-zinc-400">
                        <Mail size={14} className="text-zinc-400" />
                        <span className="font-bold text-[var(--text-primary)]">{r.usuarioNombre}</span>
                        <span>•</span>
                        <span className="truncate">{r.usuarioEmail}</span>
                      </div>
                    </div>

                    {/* Botón de Resolver / Reabrir */}
                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => handleResolverReporte(r.id, r.estado)}
                        disabled={actionLoadingId === r.id}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          esResuelto
                            ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700'
                            : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-md shadow-emerald-500/20'
                        }`}
                      >
                        <CheckCircle2 size={14} />
                        <span>{esResuelto ? 'Reabrir como Pendiente' : 'Marcar como Resuelto'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
