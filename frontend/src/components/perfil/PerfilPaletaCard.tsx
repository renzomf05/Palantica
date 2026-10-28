import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { PaleteroItem } from '../../types';
import { Trash2, AlertTriangle, X, Check, Sparkles } from 'lucide-react';

interface PerfilPaletaCardProps {
  item: PaleteroItem;
  onEliminar: (palaId: number, categoria: string) => Promise<void>;
}

export const PerfilPaletaCard: React.FC<PerfilPaletaCardProps> = ({ item, onEliminar }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleConfirmDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
      <Link
        to={`/paletas/${item.palaId}`}
        title={`${item.palaMarca} ${item.palaModelo}`}
        className="group relative flex items-center justify-center p-3 sm:p-4 rounded-2xl bg-[var(--bg-card)] dark:bg-zinc-900/60 hover:bg-[var(--bg-card-hover)] dark:hover:bg-zinc-900 border border-zinc-200/80 dark:border-white/10 hover:border-emerald-500/50 shadow-sm hover:shadow-xl transition-all duration-300 aspect-[3/4] overflow-hidden cursor-pointer active:scale-95"
      >
        {/* Imagen de la paleta únicamente (sin textos ni badges en pantalla) */}
        {item.palaImagenUrl && !imgError ? (
          <img
            src={item.palaImagenUrl}
            alt={`${item.palaMarca} ${item.palaModelo}`}
            loading="lazy"
            className="w-full h-full object-contain filter drop-shadow-lg group-hover:scale-105 group-hover:-translate-y-1 transition-transform duration-300 pointer-events-none"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-400 gap-2 p-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <Sparkles size={24} />
            </div>
            <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 text-center truncate max-w-full">
              {item.palaModelo}
            </span>
          </div>
        )}

        {/* Botón sutil de eliminar que solo aparece al pasar el cursor (hover) */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowConfirm(true);
          }}
          title="Quitar pala"
          className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-xl bg-black/60 hover:bg-rose-600 text-zinc-300 hover:text-white backdrop-blur-md shadow-md z-10 active:scale-90"
        >
          <Trash2 size={15} />
        </button>
      </Link>

      {/* Modal / Diálogo de Confirmación Emergente */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowConfirm(false);
          }}
        >
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
              <h3 className="text-base font-black text-white">¿Quitar pala del paletero?</h3>
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
