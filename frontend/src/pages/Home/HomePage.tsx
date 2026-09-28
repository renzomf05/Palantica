import React, { useEffect, useState, useCallback } from 'react';
import type { NewsItem } from '../../data/news';
import { newsService } from '../../services/news';
import { HeroArticle } from './components/HeroArticle';
import { Ticker } from './components/Ticker';
import { NewsCarousel } from './components/NewsCarousel';
import { FeaturedArticle } from './components/FeaturedArticle';
import { SectionGrid } from './components/SectionGrid';
import { PullQuote } from './components/PullQuote';
import { EncyclopediaBridge } from './components/EncyclopediaBridge';
import { SiteFooter } from './components/SiteFooter';
import { RotateCw } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await newsService.getNews();
      setArticles(data);
    } catch (err: any) {
      console.error('[HomePage] Error al obtener noticias:', err);
      setError('no fue posible conectar con el servicio de noticias. pulse reintentar para sincronizar.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = 'Palantica — Revista Editorial & Archivo de Pádel';
    window.scrollTo(0, 0);
    loadArticles();
  }, [loadArticles]);

  // Selección rigurosa para notas destacadas: priorizar siempre notas que sí tengan imagen
  const articlesWithImage = articles.filter(
    (n) => !!n.imagen && !n.imagen.startsWith('placeholder-')
  );

  const heroArticle =
    articles.find((n) => n.destacada && !!n.imagen) ||
    articlesWithImage[0] ||
    articles.find((n) => n.destacada) ||
    articles[0];

  const secondaryArticle =
    articles.find((n) => n.destacadaSecundaria && n.id !== heroArticle?.id && !!n.imagen) ||
    articlesWithImage.find((n) => n.id !== heroArticle?.id) ||
    articles.find((n) => n.id !== heroArticle?.id) ||
    articles[1];


  return (
    <div className="palantica-editorial-home w-full min-h-screen bg-[var(--editorial-bg)] text-[var(--editorial-fg)] font-editorial selection:bg-[#F04E37] selection:text-white flex flex-col">
      
      {/* Barra de Error Discreta en el estilo tipográfico de la home con botón Reintentar */}
      {error && (
        <div className="w-full bg-[var(--editorial-surface)] border-b border-[var(--editorial-border)] py-3 px-6 md:px-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#F04E37] flex-shrink-0 animate-ping" />
            <span className="editorial-meta text-[10px] text-[#F04E37] tracking-[0.2em]">
              [ ESTADO DE TRANSMISIÓN // ERROR ]
            </span>
            <span className="text-[var(--editorial-muted)] font-editorial text-[11px]">
              {error}
            </span>
          </div>
          <button
            onClick={loadArticles}
            className="editorial-pill-btn text-[11px] py-1 px-3 bg-[var(--editorial-fg)] text-[var(--editorial-bg)] hover:bg-[#F04E37] hover:text-white flex items-center gap-1.5"
          >
            <span>reintentar</span>
            <RotateCw size={12} />
          </button>
        </div>
      )}

      {/* 1. HERO & TICKER: RENDER O SKELETON CON PROPORCIONES EXACTAS */}
      {loading ? (
        <HeroArticleSkeleton />
      ) : heroArticle ? (
        <HeroArticle article={heroArticle} />
      ) : null}

      {/* 2. TICKER: RESERVADO */}
      <Ticker isReserved={true} />

      {/* 3. CARRUSEL HORIZONTAL: RESERVADO */}
      <NewsCarousel
        title="últimas noticias."
        articles={[]}
        isReserved={true}
      />

      {/* 4. NOTA DESTACADA #2 (INFORME ESPECIAL - INFORMACIÓN ACTIVA) */}
      {loading ? (
        <FeaturedArticleSkeleton />
      ) : secondaryArticle ? (
        <FeaturedArticle article={secondaryArticle} />
      ) : null}

      {/* 5. GRILLA DE SECCIONES (6 BLOQUES GRANDES - RESERVADO) */}
      <SectionGrid isReserved={true} />

      {/* 6. FRASE EDITORIAL TIPO PÓSTER (MANIFIESTO - INFORMACIÓN ACTIVA) */}
      <PullQuote
        quote="el pádel moderno no se juega con el brazo, se juega con la velocidad de la bola y los datos de la pista."
        author="agustín tapia"
        role="nº1 del mundo · premio a la precisión 2026"
        statNumber="74%"
        statLabel="de los puntos en el 20x10 se deciden en la red"
      />

      {/* 7. PUENTE CON LA ENCICLOPEDIA (LABORATORIO - RESERVADO) */}
      <EncyclopediaBridge isReserved={true} />

      {/* 8. FOOTER MINIMALISTA CON CRÉDITO OBLIGATORIO */}
      <SiteFooter />

    </div>
  );
};

/* =========================================================================
   SKELETONS CON PROPORCIONES EXACTAS A LOS BLOQUES EDITORIALES REALES
   ========================================================================= */

const HeroArticleSkeleton: React.FC = () => {
  return (
    <div className="relative w-full min-h-[92vh] flex flex-col justify-between overflow-hidden border-b border-[var(--editorial-border)] bg-[var(--editorial-surface)] animate-pulse">
      {/* Metadatos superiores */}
      <div className="relative z-10 w-full pt-20 px-6 md:px-12 flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <div className="h-3 w-40 bg-white/10 rounded-none" />
          <div className="h-2.5 w-24 bg-white/5 rounded-none" />
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="h-2.5 w-20 bg-white/10 rounded-none" />
          <div className="h-2 w-16 bg-white/5 rounded-none" />
        </div>
      </div>

      {/* Bloque inferior: Titular monumental + bajada */}
      <div className="relative z-10 w-full px-6 md:px-12 pb-12 md:pb-16 flex flex-col justify-end">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8 flex flex-col gap-3">
            <div className="h-12 md:h-20 w-11/12 bg-white/10 rounded-none" />
            <div className="h-12 md:h-20 w-3/4 bg-white/10 rounded-none" />
          </div>
          <div className="lg:col-span-4 flex flex-col gap-4 lg:pl-6 border-l-0 lg:border-l border-white/10">
            <div className="h-3 w-full bg-white/10 rounded-none" />
            <div className="h-3 w-5/6 bg-white/10 rounded-none" />
            <div className="h-3 w-4/6 bg-white/10 rounded-none" />
            <div className="h-9 w-32 bg-white/15 rounded-full mt-2" />
          </div>
        </div>
      </div>
    </div>
  );
};

const FeaturedArticleSkeleton: React.FC = () => {
  return (
    <div
      className="relative w-full min-h-[460px] lg:h-[540px] flex flex-col justify-between overflow-hidden border-b border-[var(--editorial-border)] p-6 md:p-8 animate-pulse"
      style={{ backgroundColor: 'var(--special-bg)' }}
    >
      <div className="flex justify-between items-start">
        <div className="h-3 w-48 bg-white/10" />
        <div className="h-3 w-28 bg-white/10" />
      </div>
      <div className="flex flex-col items-end gap-3">
        <div className="h-8 md:h-12 w-3/4 bg-white/10" />
        <div className="h-8 md:h-12 w-1/2 bg-white/10" />
        <div className="h-9 w-40 bg-white/15 rounded-full mt-2" />
      </div>
    </div>
  );
};

export default HomePage;
