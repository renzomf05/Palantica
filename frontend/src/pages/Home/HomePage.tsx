import React, { useEffect } from 'react';
import { mockNews } from '../../data/news';
import { HeroArticle } from './components/HeroArticle';
import { Ticker } from './components/Ticker';
import { NewsCarousel } from './components/NewsCarousel';
import { FeaturedArticle } from './components/FeaturedArticle';
import { SectionGrid } from './components/SectionGrid';
import { PullQuote } from './components/PullQuote';
import { EncyclopediaBridge } from './components/EncyclopediaBridge';
import { SiteFooter } from './components/SiteFooter';

export const HomePage: React.FC = () => {
  // Ajustar el título del documento para la vista editorial
  useEffect(() => {
    document.title = 'Palantica — Revista Editorial & Archivo de Pádel';
    window.scrollTo(0, 0);
  }, []);

  // Segmentación de noticias mock
  const heroArticle = mockNews.find((n) => n.destacada) || mockNews[0];
  const secondaryArticle = mockNews.find((n) => n.destacadaSecundaria) || mockNews[1];
  const tickerArticles = mockNews.slice(0, 8);
  const carouselArticles = mockNews.filter(
    (n) => n.id !== heroArticle.id && n.id !== secondaryArticle.id
  );

  return (
    <div className="palantica-editorial-home w-full min-h-screen bg-[var(--editorial-bg)] text-[var(--editorial-fg)] font-editorial selection:bg-[#F04E37] selection:text-white flex flex-col">
      
      {/* 1. HERO: NOTA PRINCIPAL (FULL-BLEED) */}
      <HeroArticle article={heroArticle} />

      {/* 2. TICKER: ÚLTIMAS NOTICIAS EN MOVIMIENTO CONTINUO */}
      <Ticker items={tickerArticles} />

      {/* 3. CARRUSEL HORIZONTAL "ÚLTIMAS NOTICIAS" (EQUIVALENTE A PRODUCTOS EN TIENDA) */}
      <NewsCarousel
        title="últimas noticias."
        subtitle="carrusel editorial horizontal con desplazamiento táctil"
        articles={carouselArticles}
      />

      {/* 4. NOTA DESTACADA #2 (FULL-BLEED ESPEJADO) */}
      <FeaturedArticle article={secondaryArticle} />

      {/* 5. GRILLA DE SECCIONES (6 BLOQUES GRANDES) */}
      <SectionGrid />

      {/* 6. FRASE EDITORIAL TIPO PÓSTER (TIPOGRAFÍA GIGANTE SIN FOTO) */}
      <PullQuote
        quote="el pádel moderno no se juega con el brazo, se juega con la velocidad de la bola y los datos de la pista."
        author="agustín tapia"
        role="nº1 del mundo · premio a la precisión 2026"
        statNumber="74%"
        statLabel="de los puntos en el 20x10 se deciden en la red"
      />

      {/* 7. PUENTE CON LA ENCICLOPEDIA (LABORATORIO & PALA DE LA SEMANA) */}
      <EncyclopediaBridge />

      {/* 8. FOOTER MINIMALISTA */}
      <SiteFooter />

    </div>
  );
};

export default HomePage;
