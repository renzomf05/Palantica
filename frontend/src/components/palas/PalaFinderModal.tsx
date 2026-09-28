import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { palasApi } from '../../api/palas';
import type { Pala } from '../../types';
import {
  Compass,
  X,
  ArrowRight,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  ArrowLeftRight,
} from 'lucide-react';

interface PalaFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface QuestionOption {
  id: string;
  label: string;
  sublabel: string;
}

interface Question {
  id: string;
  title: string;
  description: string;
  options: QuestionOption[];
}

const QUESTIONS: Question[] = [
  {
    id: 'lado',
    title: '1. ¿En qué lado de la pista jugás habitualmente?',
    description: 'La posición condiciona el ángulo de impacto y el tiempo de reacción en volea.',
    options: [
      {
        id: 'drive',
        label: 'Drive (Derecha)',
        sublabel: 'Prioridad en construcción de punto, chiquitas y defensa baja',
      },
      {
        id: 'reves',
        label: 'Revés (Izquierda)',
        sublabel: 'Prioridad en remate de potencia, víboras y definición aérea',
      },
      {
        id: 'ambos',
        label: 'Indistinto / Ambos lados',
        sublabel: 'Juego polivalente que busca adaptarse a cualquier situación de partido',
      },
    ],
  },
  {
    id: 'tacto',
    title: '2. ¿Cómo preferís el tacto al golpear la bola?',
    description: 'La densidad del núcleo EVA define la salida de bola y la firmeza del golpe.',
    options: [
      {
        id: 'blando',
        label: 'Blando y mullido con efecto resorte',
        sublabel: 'Goma EVA Soft o Foam; excelente salida a baja velocidad con poco esfuerzo',
      },
      {
        id: 'medio',
        label: 'Tacto medio equilibrado',
        sublabel: 'MultiEVA o goma media; polivalencia entre control fino y pegada',
      },
      {
        id: 'duro',
        label: 'Seco, sólido y rígido como una tabla',
        sublabel: 'Black EVA densa con carbono 18K/24K; máxima potencia si tenés buen brazo',
      },
    ],
  },
  {
    id: 'estilo',
    title: '3. ¿Cuál es tu objetivo primordial en los puntos decisivos?',
    description: 'Define la aerodinámica y la tolerancia del punto dulce recomendada.',
    options: [
      {
        id: 'defensivo',
        label: 'Control quirúrgico y recuperación defensiva',
        sublabel: 'Punto dulce amplio para salvar bolas descentradas pegadas al cristal',
      },
      {
        id: 'polivalente',
        label: 'Equilibrio táctico y transición rápida',
        sublabel: 'Manejabilidad para bloquear en red y acelerar cuando queda cómoda',
      },
      {
        id: 'ofensivo',
        label: 'Ataque demoledor y remate por tres',
        sublabel: 'Balance alto para hacer palanca máxima en smashes paralelos',
      },
    ],
  },
  {
    id: 'codo',
    title: '4. ¿Tenés historial de molestias en codo o muñeca (Epicondilitis)?',
    description: 'Criterio biomecánico estricto para filtrar palas con absorción de vibraciones.',
    options: [
      {
        id: 'si',
        label: 'Sí, sufro de epicondilitis o molestias en articulaciones',
        sublabel: 'Filtro de confort alto (>8/10), balance bajo/medio y gomas absorbentes',
      },
      {
        id: 'no',
        label: 'No, brazo completamente sano y entrenado',
        sublabel: 'Sin restricciones de balance en cabeza o dureza estructural',
      },
    ],
  },
];

export const PalaFinderModal: React.FC<PalaFinderModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [palas, setPalas] = useState<Pala[]>([]);
  const [resultsReady, setResultsReady] = useState(false);

  // Cargar catálogo para ranking
  useEffect(() => {
    if (!isOpen) return;
    const fetchPalas = async () => {
      try {
        const data = await palasApi.getPalas({ pageSize: 50 });
        setPalas(data.items);
      } catch (err) {
        console.error('Error al cargar palas para el Pala Finder:', err);
      }
    };
    fetchPalas();
  }, [isOpen]);

  // Manejo de respuesta
  const handleSelectOption = (questionId: string, optionId: string) => {
    const nextAnswers = { ...answers, [questionId]: optionId };
    setAnswers(nextAnswers);

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setResultsReady(true);
    }
  };

  // Reiniciar quiz
  const handleReset = () => {
    setAnswers({});
    setCurrentStep(0);
    setResultsReady(false);
  };

  // Cálculo de afinidad biomecánica
  const recomendaciones = useMemo(() => {
    if (!resultsReady || palas.length === 0) return [];

    const { lado, tacto, estilo, codo } = answers;

    const scored = palas.map((p) => {
      let score = 70; // Base compatibility

      // 1. Lado de pista
      if (lado === 'drive') {
        if (p.forma === 'Redonda') score += 12;
        if (p.balanceMm <= 265) score += 8;
        if (p.controlPromedio >= 8.5) score += 10;
      } else if (lado === 'reves') {
        if (p.forma === 'Diamante') score += 12;
        if (p.balanceMm >= 268) score += 10;
        if (p.potenciaPromedio >= 8.5) score += 10;
      } else {
        if (p.forma === 'Lagrima') score += 12;
        score += 8;
      }

      // 2. Tacto preferido
      if (tacto === 'blando') {
        if (p.durezaPromedio <= 5.5) score += 14;
        else if (p.durezaPromedio > 7.5) score -= 14;
      } else if (tacto === 'duro') {
        if (p.durezaPromedio >= 7.5) score += 14;
        else if (p.durezaPromedio < 5.5) score -= 14;
      } else {
        if (p.durezaPromedio >= 5.5 && p.durezaPromedio <= 7.5) score += 14;
      }

      // 3. Estilo de juego
      if (estilo === 'defensivo') {
        if (p.controlPromedio > p.potenciaPromedio) score += 10;
        if (p.balanceMm <= 263) score += 8;
      } else if (estilo === 'ofensivo') {
        if (p.potenciaPromedio > p.controlPromedio) score += 10;
        if (p.balanceMm >= 270) score += 8;
      } else {
        if (Math.abs(p.potenciaPromedio - p.controlPromedio) <= 1.0) score += 10;
      }

      // 4. Epicondilitis
      if (codo === 'si') {
        if (p.durezaPromedio <= 5.5) score += 15;
        if (p.forma === 'Diamante' || p.balanceMm > 272) score -= 22; // Penalizar palas lesivas
        if (p.pesoMax > 375) score -= 12;
      }

      const matchPercent = Math.min(99, Math.max(68, Math.round(score)));

      return {
        pala: p,
        matchPercent,
      };
    });

    return scored.sort((a, b) => b.matchPercent - a.matchPercent).slice(0, 3);
  }, [resultsReady, palas, answers]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(5, 9, 20, 0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        className="card-skeuomorphic animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '32px',
          borderRadius: '0px',
          border: '1px solid var(--border-card-hover)',
          background: 'var(--bg-card-elevated)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        }}
      >
        {/* Cabecera del Modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                padding: '6px',
                background: 'rgba(163, 230, 53, 0.15)',
                color: 'var(--padel-ball-yellow-vibrant)',
                border: '1px solid rgba(163, 230, 53, 0.35)',
                borderRadius: '0px',
              }}
            >
              <Compass size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 900, fontFamily: 'var(--font-serif)', lineHeight: 1.2 }}>
                Pala Finder • Quiz Sensorial y Biomecánico
              </h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Diagnóstico de tu perfil de juego para recomendarte la pala científicamente compatible
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '6px',
              color: 'var(--text-muted)',
              borderRadius: '0px',
              background: 'transparent',
            }}
            title="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progreso del Quiz */}
        {!resultsReady && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              <span>Pregunta {currentStep + 1} de {QUESTIONS.length}</span>
              <span>{Math.round(((currentStep + 1) / QUESTIONS.length) * 100)}%</span>
            </div>
            <div style={{ width: '100%', height: '4px', background: 'var(--bg-input)', borderRadius: '0px' }}>
              <div
                style={{
                  height: '100%',
                  width: `${((currentStep + 1) / QUESTIONS.length) * 100}%`,
                  background: 'var(--padel-court-blue-vibrant)',
                  borderRadius: '0px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        )}

        {/* Contenido: Preguntas Activas */}
        {!resultsReady && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}>
                {QUESTIONS[currentStep].title}
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {QUESTIONS[currentStep].description}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {QUESTIONS[currentStep].options.map((opt) => {
                const isSelected = answers[QUESTIONS[currentStep].id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(QUESTIONS[currentStep].id, opt.id)}
                    className="card-skeuomorphic"
                    style={{
                      padding: '16px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      textAlign: 'left',
                      borderRadius: '0px',
                      border: isSelected
                        ? '2px solid var(--padel-court-blue-vibrant)'
                        : '1px solid var(--border-card)',
                      background: isSelected ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-card)',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {opt.label}
                      </span>
                      {isSelected && <CheckCircle2 size={18} color="var(--padel-court-blue-vibrant)" />}
                    </div>
                    <span style={{ fontSize: '0.80rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {opt.sublabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Resultados del Quiz: Top 3 Palas Compatibles */}
        {resultsReady && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="badge badge-sage" style={{ borderRadius: '0px', fontSize: '0.72rem' }}>
                  <Sparkles size={12} /> Diagnóstico Finalizado
                </span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'var(--font-serif)', marginTop: '6px' }}>
                  Tus 3 Palas de Máxima Compatibilidad
                </h3>
              </div>

              <button
                onClick={handleReset}
                className="btn-secondary"
                style={{ borderRadius: '0px', padding: '6px 12px', fontSize: '0.78rem' }}
              >
                <RotateCcw size={14} />
                <span>Reiniciar</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {recomendaciones.map(({ pala, matchPercent }, idx) => (
                <div
                  key={pala.id}
                  className="card-skeuomorphic"
                  style={{
                    padding: '18px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    borderRadius: '0px',
                    border: idx === 0 ? '2px solid var(--padel-court-blue-vibrant)' : '1px solid var(--border-card)',
                    background: idx === 0 ? 'linear-gradient(135deg, rgba(37,99,235,0.10) 0%, var(--bg-card) 100%)' : 'var(--bg-card)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      <div
                        style={{
                          width: '64px',
                          height: '64px',
                          background: 'radial-gradient(circle, var(--bg-card-hover) 0%, var(--bg-deep) 100%)',
                          borderRadius: '0px',
                          border: '1px solid var(--border-card)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <img
                          src={pala.imagenUrl || 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800'}
                          alt={pala.modelo}
                          style={{ maxHeight: '88%', maxWidth: '88%', objectFit: 'contain' }}
                        />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>
                          {idx === 0 ? '⭐ Opción #1 Recomendada' : `Opción #${idx + 1}`} • {pala.marcaNombre}
                        </div>
                        <h4 style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}>
                          {pala.modelo}
                        </h4>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                          <span className="badge badge-neutral" style={{ borderRadius: '0px', fontSize: '0.66rem' }}>
                            {pala.forma}
                          </span>
                          <span className="badge badge-neutral" style={{ borderRadius: '0px', fontSize: '0.66rem' }}>
                            Balance {pala.balanceMm} mm
                          </span>
                          <span className="badge badge-neutral" style={{ borderRadius: '0px', fontSize: '0.66rem' }}>
                            {pala.materialCaras}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          fontSize: '1.45rem',
                          fontWeight: 900,
                          color: idx === 0 ? 'var(--padel-court-blue-vibrant)' : 'var(--padel-turf-green)',
                          lineHeight: 1,
                        }}
                      >
                        {matchPercent}%
                      </span>
                      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Match Biomecánico
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', marginTop: '4px', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ fontSize: '0.80rem', color: 'var(--text-secondary)' }}>
                      Dureza {pala.durezaPromedio.toFixed(1)}/10 • Potencia {pala.potenciaPromedio.toFixed(1)} • Control {pala.controlPromedio.toFixed(1)}
                    </span>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link
                        to={`/palas/${pala.id}`}
                        onClick={onClose}
                        className="btn-primary"
                        style={{ borderRadius: '0px', padding: '6px 14px', fontSize: '0.78rem' }}
                      >
                        <span>Ficha Técnica</span>
                        <ArrowRight size={13} />
                      </Link>

                      <Link
                        to={`/comparador?pala1=${pala.id}`}
                        onClick={onClose}
                        className="btn-secondary"
                        style={{ borderRadius: '0px', padding: '6px 12px', fontSize: '0.78rem' }}
                        title="Abrir en Comparador A/B"
                      >
                        <ArrowLeftRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
