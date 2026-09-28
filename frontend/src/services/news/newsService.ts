import type { NewsItem } from '../../data/news';
import type { NormalizedArticle, NewsSourceProvider } from './types';
import { formatSpanishDate } from './dateFormatter';
import { fallbackNews } from './mockFallback';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5007';

class NewsService {
  private additionalProviders: NewsSourceProvider[] = [];

  /**
   * Permite registrar proveedores externos adicionales (por ejemplo feeds RSS o scrapers).
   */
  public registerProvider(provider: NewsSourceProvider): void {
    this.additionalProviders.push(provider);
  }

  /**
   * Obtiene las noticias combinadas de pádel desde el backend /api/news.
   * Si la red o el backend fallan, recurre al set de respaldo mock sin interrumpir la experiencia.
   */
  public async getNews(): Promise<NewsItem[]> {
    try {
      let articles: NormalizedArticle[] = [];

      // 1. Intentar endpoint relativo /api/news (funciona con proxy de Vite y despliegues unificados)
      try {
        const response = await fetch('/api/news', {
          headers: { Accept: 'application/json' },
        });

        if (response.ok) {
          articles = await response.json();
        } else {
          // Si el servidor local en puerto 5173 no tiene /api/news, intentar directamente el backend API_BASE_URL
          const fallbackResp = await fetch(`${API_BASE_URL}/api/news`, {
            headers: { Accept: 'application/json' },
          });
          if (fallbackResp.ok) {
            articles = await fallbackResp.json();
          }
        }
      } catch (networkErr) {
        // Reintento contra el host directo si falló el relativo
        console.warn('[NewsService] Endpoint relativo /api/news no disponible:', networkErr);
        try {
          const directResp = await fetch(`${API_BASE_URL}/api/news`, {
            headers: { Accept: 'application/json' },
          });
          if (directResp.ok) {
            articles = await directResp.json();
          }
        } catch (directErr) {
          // Servidor no disponible en este momento
          console.warn('[NewsService] Backend no disponible. Activando datos de respaldo locales:', directErr);
        }
      }

      // Si llegaron artículos del backend
      if (Array.isArray(articles) && articles.length > 0) {
        // Incorporar fuentes adicionales registradas si las hubiere
        for (const provider of this.additionalProviders) {
          try {
            const extra = await provider.fetchArticles();
            if (Array.isArray(extra)) {
              articles = [...articles, ...extra];
            }
          } catch (providerErr) {
            console.warn(`[NewsService] Error en proveedor adicional '${provider.name}':`, providerErr);
          }
        }

        // FILTRADO ESTRICTO: Solo noticias 100% de pádel (descartar fútbol, política, inmuebles, etc.)
        const padelOnlyArticles = articles.filter((art) => this.isPadelArticle(art));

        // Si tras el filtro quedan menos de 6 noticias, complementar con respaldo editorial garantizado
        const finalArticles: NormalizedArticle[] = [...padelOnlyArticles];
        if (finalArticles.length < 6) {
          for (const fb of fallbackNews) {
            const normFb = fb.titulo.trim().toLowerCase();
            if (!finalArticles.some((a) => a.titulo?.trim().toLowerCase() === normFb)) {
              finalArticles.push({
                id: fb.id,
                titulo: fb.titulo,
                bajada: fb.bajada,
                imagen: fb.imagen || null,
                link: fb.link || 'https://premierpadel.com',
                fuente: fb.fuente || 'Medio de Pádel',
                fecha: new Date().toISOString(),
                categoria: fb.categoria,
                seccion: fb.seccion,
                destacada: false,
              });
              if (finalArticles.length >= 6) break;
            }
          }
        }

        const adaptedNews: NewsItem[] = finalArticles.map((art, idx) => {
          const readTime = Math.max(3, Math.min(10, Math.ceil((art.bajada?.length || 100) / 35)));
          
          return {
            id: art.id || `news-${idx}`,
            titulo: art.titulo || 'actualidad del pádel.',
            bajada: art.bajada || 'crónica editorial de la jornada.',
            categoria: art.categoria || 'Pádel',
            autor: art.fuente || 'Redacción Palantica',
            fuente: art.fuente || 'Medio de Pádel',
            link: art.link,
            fecha: formatSpanishDate(art.fecha),
            tiempoLectura: readTime,
            imagen: art.imagen || null,
            fotoDescripcion: art.titulo || 'Actualidad de pádel',
            destacada: !!art.destacada,
            seccion: this.normalizeSeccion(art.seccion),
            ratio: (art.destacada ? '21/9' : (idx % 2 === 0 ? '16/9' : '4/3')) as any,
          };
        });

        // Asegurar que haya una destacada con imagen
        const indexConImagen = adaptedNews.findIndex((n) => !!n.imagen);
        if (indexConImagen >= 0 && !adaptedNews.some((n) => n.destacada)) {
          adaptedNews[indexConImagen].destacada = true;
        }

        // Marcar una secundaria con imagen si existe
        const secundarias = adaptedNews.filter((n) => !n.destacada && !!n.imagen);
        if (secundarias.length > 0) {
          secundarias[0].destacadaSecundaria = true;
        }

        // Congelar noticias en almacenamiento local para no perderlas ante límite de créditos o caídas
        try {
          localStorage.setItem('PALANTICA_FROZEN_NEWS', JSON.stringify(adaptedNews));
        } catch {
          // Ignorar error de almacenamiento
        }

        return adaptedNews;
      }

      // Si la lista vino vacía o falló la conexión, intentar recuperar las últimas noticias congeladas
      const localFrozen = this.getLocalFrozenNews();
      if (localFrozen) {
        return localFrozen;
      }

      console.warn('[NewsService] Lista vacía recibida. Usando datos de respaldo.');
      return fallbackNews;
    } catch (err) {
      console.warn('[NewsService] Error general al cargar noticias. Usando noticias congeladas o respaldo:', err);
      const localFrozen = this.getLocalFrozenNews();
      if (localFrozen) {
        return localFrozen;
      }
      return fallbackNews;
    }
  }

  private getLocalFrozenNews(): NewsItem[] | null {
    try {
      const raw = localStorage.getItem('PALANTICA_FROZEN_NEWS');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.info('[NewsService] Modo congelado activo: sirviendo las últimas noticias reales guardadas localmente.');
          return parsed;
        }
      }
    } catch {
      // Ignorar error
    }
    return null;
  }

  /**
   * Filtra estrictamente artículos para verificar que traten de pádel profesional, material o competición.
   */
  private isPadelArticle(art: NormalizedArticle): boolean {
    const title = (art.titulo || '').toLowerCase();
    const desc = (art.bajada || '').toLowerCase();
    const full = `${title} ${desc}`;

    // Descartar deportes no relacionados y falsos positivos comunes
    if (/f[uú]tbol playa|beach soccer|paddle surf|padel surf|stand[- ]up paddle/i.test(full)) return false;
    if (/a la venta|chalet|finca de caza|piscina y pista|inmobiliaria|promoci[oó]n de viviendas/i.test(title)) return false;
    if (/hobbies contra el estr[eé]s|estudi[eé] una fp|futbolista|dictador mubarak|alcalde|alcaldesa|ayuntamiento/i.test(title) && !/p[aá]del/i.test(title)) return false;
    if (/^el pickleball/i.test(title) && !/torneo de p[aá]del/i.test(title)) return false;

    // Términos positivos de pádel (jugadores, torneos, material, circuitos)
    const padelRegex = /\b(p[aá]del|premier padel|world padel tour|wpt|padelfip|rotterdam p2|madrid p1|paris major|qatar major|milano p1|hexagone cup|pro padel league|pala de p[aá]del|palas de p[aá]del|pista de p[aá]del|tapia|coello|gal[aá]n|lebr[oó]n|chingotto|stupaczuk|stupa|di nenno|paquito navarro|belastegu[ií]n|sanyo|javi leal|fran guerrero|mike yanguas|coki nieto|jon sanz|gemma triay|paula josemar[ií]a|ari s[aá]nchez|delfi brea|claudia fern[aá]ndez|marta ortega|bea gonz[aá]lez)\b/i;

    if (padelRegex.test(title)) return true;
    if (padelRegex.test(desc) && /cuadro|final|semifinal|partido|victoria|campe[oó]n|circuito|jugador|pareja|set|tie-break|torneo/i.test(title)) return true;

    return false;
  }

  private normalizeSeccion(seccionRaw?: string): any {
    if (!seccionRaw) return 'circuito';
    const s = seccionRaw.toLowerCase();
    if (s.includes('circuito')) return 'circuito';
    if (s.includes('torneo') || s.includes('resultado')) return 'torneos';
    if (s.includes('jugador')) return 'jugadores';
    if (s.includes('material') || s.includes('pala')) return 'material';
    if (s.includes('entrevista')) return 'entrevistas';
    if (s.includes('opinion') || s.includes('opinión')) return 'opinion';
    return 'circuito';
  }
}

export const newsService = new NewsService();
