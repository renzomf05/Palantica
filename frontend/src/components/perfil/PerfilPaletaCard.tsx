import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { PaleteroItem } from '../../types';
import { Trash2, ExternalLink, AlertTriangle, X, Check } from 'lucide-react';

interface PerfilPaletaCardProps {
  item: PaleteroItem;
  onEliminar: (palaId: number, categoria: string) => Promise<void>;
}

export const PerfilPaletaCard: React.FC<PerfilPaletaCardProps> = ({ item, onEliminar }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onEliminar(item.palaId, item.categoria);
      setShowConfirm(false);
    } catch (err) {
      console.error('Error al eliminar pala:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="relative group bg-zinc-900/80 hover:bg-zinc-900 border border-white/10 hover:border-emerald-500/40 rounded-2xl p-4 transition-all duration-300 shadow-md hover:shadow-xl flex flex-col justify-between gap-4">
        {/* Parte superior: Foto, Marca, Modelo y Forma */}
        <div className="flex gap-4 items-start">
          {/* Contenedor de la foto de la pala */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-zinc-800/80 border border-white/5 flex-shrink-0 flex items-center justify-center p-1 overflow-hidden group-hover:scale-105 transition-transform duration-300">
            {item.palaImagenUrl ? (
              <img
                src={item.palaImagenUrl}
                alt={item.palaModelo}
                loading="lazy"
                className="w-full h-full object-contain drop-shadow-md"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=300&q=80';
                }}
              />
            ) : (
              <div className="text-zinc-600 font-bold text-xs">Sin Foto</div>
            )}
          </div>

          {/* Datos principales */}
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider truncate">
              {item.palaMarca}
            </span>
            <h4 className="text-sm sm:text-base font-extrabold text-white leading-snug truncate group-hover:text-emerald-300 transition-colors">
              {item.palaModelo}
            </h4>

            {/* Badges de especificaciones */}
            <div className="flex flex-wrap gap-1.5 mt-1">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-white/5">
                {item.palaForma || 'Lágrima'}
              </span>
              {item.palaPrecioReferencia > 0 && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {item.palaPrecioReferencia} €
                </span>
              )}
            </div>

            {item.notas && (
              <p className="text-xs text-zinc-400 italic line-clamp-1 mt-1 font-normal">
                "{item.notas}"
              </p>
            )}
          </div>
        </div>

        {/* Acciones inferiores: Ver Ficha y Quitar */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5 gap-2">
          <Link
            to={`/paletas/${item.palaId}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <span>Ver Ficha</span>
            <ExternalLink size={13} />
          </Link>

          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            title="Quitar del paletero"
            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-2.5 py-1.5 rounded-lg border border-transparent hover:border-rose-500/20 transition-all active:scale-95"
          >
            <Trash2 size={14} />
            <span>Quitar</span>
          </button>
        </div>
      </div>

      {/* Modal / Diálogo de Confirmación Emergente */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div
            className="bg-zinc-900 border border-white/15 rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-4 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <AlertTriangle size={20} />
              </div>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
                className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <h3 className="text-base font-black text-white">¿Quitar del paletero?</h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">
                ¿Estás seguro de que deseás quitar{' '}
                <strong className="text-zinc-200">
                  {item.palaMarca} {item.palaModelo}
                </strong>{' '}
                de <span className="text-emerald-400">"{item.categoria}"</span>?
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 active:scale-95 transition-all shadow-lg shadow-rose-600/30"
              >
                {isDeleting ? (
                  <span>Eliminando...</span>
                ) : (
                  <>
                    <Check size={14} />
                    <span>Sí, quitar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
