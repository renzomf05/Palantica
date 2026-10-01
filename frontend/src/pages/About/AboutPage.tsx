import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  Cpu,
  Thermometer,
  Layers,
  Users,
  ArrowRight,
  Target
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-10 animate-fade-in pb-20">
      {/* Hero Editorial Swiss */}
      <section className="relative rounded-3xl overflow-hidden p-8 sm:p-12 border border-white/10 bg-gradient-to-br from-zinc-950 via-zinc-900 to-emerald-950/40 shadow-2xl flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 self-start">
          <Sparkles size={13} />
          <span>Manifiesto Palantica</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight m-0">
          La Enciclopedia Técnica y Sensorial del Pádel
        </h1>

        <p className="text-base sm:text-lg text-zinc-300 font-medium leading-relaxed max-w-2xl">
          Inspirados en la rigurosidad analítica y la pasión comunitaria de las grandes enciclopedias mundiales, Palantica nace para revelar la verdadera física y el tacto en pista de cada pala de pádel.
        </p>
      </section>

      {/* Visión y Propósito */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-white/10 shadow-lg flex flex-col gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Target size={20} />
          </div>
          <h2 className="text-xl font-black text-white tracking-tight m-0">
            Nuestra Misión
          </h2>
          <p className="text-sm text-zinc-300 leading-relaxed font-normal">
            Eliminar el ruido del marketing y brindar a los jugadores métricas objetivas: dureza real de tacto, balances milimétricos, distribución del punto dulce y cómo reaccionan los materiales a las distintas temperaturas de juego.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-white/10 shadow-lg flex flex-col gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
            <Users size={20} />
          </div>
          <h2 className="text-xl font-black text-white tracking-tight m-0">
            Comunidad Desinteresada
          </h2>
          <p className="text-sm text-zinc-300 leading-relaxed font-normal">
            Palantica no es una tienda online ni tiene acuerdos comerciales con marcas. Las reseñas provienen de jugadores reales de todos los niveles que votan según el comportamiento de la pala en sus partidos semanales.
          </p>
        </div>
      </section>

      {/* Los 4 Pilares Técnicos */}
      <section className="flex flex-col gap-5">
        <h2 className="text-2xl font-black tracking-tight text-white m-0">
          Los 4 Pilares de Palantica
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-white/10 shadow-md flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-emerald-400">
              <Layers size={18} />
              <h3 className="text-base font-extrabold text-white m-0">
                1. Radiografía de Materiales
              </h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Desglosamos la composición de cada capa: núcleos (EVA Soft, Black EVA, MultiEVA, Foam) y caras (Carbono 3K, 12K, 18K, 24K o Fibra de Vidrio).
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-white/10 shadow-md flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-cyan-400">
              <Cpu size={18} />
              <h3 className="text-base font-extrabold text-white m-0">
                2. Algoritmo de "Palas Parecidas"
              </h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Motor vectorial multicriterio que calcula distancias geométricas y sensoriales para recomendar alternativas exactas si buscas sensaciones similares.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-white/10 shadow-md flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-amber-400">
              <Thermometer size={18} />
              <h3 className="text-base font-extrabold text-white m-0">
                3. Matriz Térmica Estacional
              </h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              El calor expande las gomas y el frío las endurece. Evaluamos si una pala rinde óptimamente en invierno, verano o mantiene su respuesta todo el año.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-white/10 shadow-md flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-rose-400">
              <ShieldCheck size={18} />
              <h3 className="text-base font-extrabold text-white m-0">
                4. Filosofía Anti-Vibecoding
              </h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Desarrollado bajo estándares rigurosos de tipografía Swiss, accesibilidad visual, esquinas redondeadas y separación estricta entre datos y opiniones.
            </p>
          </div>
        </div>
      </section>

      {/* Llamado a la acción */}
      <section className="p-8 rounded-3xl bg-zinc-900 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
        <div>
          <h3 className="text-xl font-black text-white m-0">
            ¿Quieres explorar el catálogo completo?
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Filtra por dureza, balance, peso y forma en la enciclopedia interactiva.
          </p>
        </div>
        <Link
          to="/paletas"
          className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 whitespace-nowrap"
        >
          <span>Ir a Paletas</span>
          <ArrowRight size={14} />
        </Link>
      </section>
    </div>
  );
};
