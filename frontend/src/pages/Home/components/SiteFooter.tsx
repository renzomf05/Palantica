import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Check } from 'lucide-react';

export const SiteFooter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail('');
        setSubscribed(false);
      }, 4000);
    }
  };

  return (
    <footer className="w-full bg-[var(--editorial-bg)] text-[var(--editorial-fg)] border-t border-[var(--editorial-border)] pt-16 pb-12 px-6 md:px-12 flex flex-col justify-between gap-16 select-none">
      
      {/* 1. Newsletter editorial superior */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-12 border-b border-[var(--editorial-border)]">
        <div className="lg:col-span-6 flex flex-col gap-2">
          <span className="editorial-meta text-[11px] text-[#F04E37] tracking-[0.2em]">
            [ BOLETÍN DE PISTA // NEWSLETTER ]
          </span>
          <h3 className="headline-medium tracking-[-0.05em] leading-[0.9] lowercase">
            recibí las crónicas dominicales.
          </h3>
          <p className="text-xs text-[var(--editorial-muted)] font-editorial max-w-[40ch] mt-1">
            Un resumen semanal con los datos más relevantes de la competición y las pruebas técnicas de laboratorio. Cero spam.
          </p>
        </div>

        <div className="lg:col-span-6 flex flex-col justify-end">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="email"
              required
              placeholder="tu correo electrónico..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-[var(--editorial-surface)] border border-[var(--editorial-border)] px-5 py-3 text-xs font-editorial placeholder:text-[var(--editorial-muted)] text-[var(--editorial-fg)] focus:outline-none focus:border-[#F04E37] transition-colors rounded-none"
            />
            <button
              type="submit"
              className="editorial-pill-btn bg-[var(--editorial-fg)] text-[var(--editorial-bg)] hover:bg-[#F04E37] hover:text-white"
            >
              {subscribed ? (
                <>
                  <Check size={14} />
                  <span>suscrito</span>
                </>
              ) : (
                <>
                  <span>suscribirme</span>
                  <ArrowUpRight size={14} />
                </>
              )}
            </button>
          </form>
          {subscribed && (
            <span className="editorial-meta text-[10px] text-[#F04E37] mt-2">
              ✓ TE HEMOS AÑADIDO AL ARCHIVO DE ENVÍO.
            </span>
          )}
        </div>
      </div>

      {/* 2. Grid de Enlaces y Navegación del Archivo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs font-editorial">
        <div className="flex flex-col gap-3">
          <span className="editorial-meta text-[10px] text-[var(--editorial-muted)]">
            SECCIONES
          </span>
          <Link to="/seccion/circuito" className="hover:text-[#F04E37] transition-colors lowercase">circuito profesional</Link>
          <Link to="/seccion/torneos" className="hover:text-[#F04E37] transition-colors lowercase">torneos y cuadros</Link>
          <Link to="/seccion/jugadores" className="hover:text-[#F04E37] transition-colors lowercase">jugadores y ranking</Link>
          <Link to="/seccion/material" className="hover:text-[#F04E37] transition-colors lowercase">material y laboratorio</Link>
          <Link to="/seccion/entrevistas" className="hover:text-[#F04E37] transition-colors lowercase">entrevistas exclusivas</Link>
          <Link to="/seccion/opinion" className="hover:text-[#F04E37] transition-colors lowercase">opinión y táctica</Link>
        </div>

        <div className="flex flex-col gap-3">
          <span className="editorial-meta text-[10px] text-[var(--editorial-muted)]">
            ENCICLOPEDIA
          </span>
          <Link to="/catalogo" className="hover:text-[#F04E37] transition-colors lowercase">catálogo completo de palas</Link>
          <Link to="/comparador" className="hover:text-[#F04E37] transition-colors lowercase">comparador balístico 1 vs 1</Link>
          <Link to="/paletero" className="hover:text-[#F04E37] transition-colors lowercase">mi paletero personal</Link>
          <Link to="/padelgram" className="hover:text-[#F04E37] transition-colors lowercase">padelgram visual</Link>
        </div>

        <div className="flex flex-col gap-3">
          <span className="editorial-meta text-[10px] text-[var(--editorial-muted)]">
            PROYECTO
          </span>
          <span className="text-[var(--editorial-muted)]">manifiesto de diseño</span>
          <span className="text-[var(--editorial-muted)]">metodología de laboratorio</span>
          <span className="text-[var(--editorial-muted)]">normas editoriales</span>
          <span className="text-[var(--editorial-muted)]">contacto y prensa</span>
        </div>

        <div className="flex flex-col gap-3">
          <span className="editorial-meta text-[10px] text-[var(--editorial-muted)]">
            IDIOMA Y EDICIÓN
          </span>
          <span className="text-[var(--editorial-fg)] font-bold">ESPAÑOL (GLOBAL)</span>
          <span className="text-[var(--editorial-muted)]">EDICIÓN IMPRESA DIGITAL</span>
          <span className="text-[var(--editorial-muted)]">VOL. 01 / CICLO 2026</span>
        </div>
      </div>

      {/* 3. Gran Marca de Cierre e Información Legal */}
      <div className="pt-8 border-t border-[var(--editorial-border)] flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex flex-col">
          <span className="headline-giant text-[var(--editorial-fg)] tracking-[-0.06em] leading-[0.82] lowercase">
            palantica.
          </span>
          <span className="headline-medium text-[var(--editorial-dim)] tracking-[-0.05em] leading-[0.85] lowercase">
            the padel archive.
          </span>
        </div>

        <div className="flex flex-col md:items-end gap-2 text-right">
          <p className="text-[11px] text-[var(--editorial-muted)] font-editorial max-w-sm text-left md:text-right leading-tight">
            enciclopedia técnica, sensorial y revista digital de pádel. diseñado bajo principios del estilo tipográfico internacional (swiss style). impreso en la web.
          </p>
          <span className="editorial-meta text-[10px] text-[var(--editorial-dim)]">
            Noticias vía NewsData.io. Cada nota pertenece a su medio de origen.
          </span>
          <span className="editorial-meta text-[10px] text-[var(--editorial-dim)]">
            © 2026 PALANTICA INC. TODOS LOS DERECHOS RESERVADOS.
          </span>
        </div>
      </div>

    </footer>
  );
};
