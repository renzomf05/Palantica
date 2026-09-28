import type { NewsItem } from '../../data/news';

/**
/// Artículo normalizado devuelto por el backend /api/news (NewsData.io)
 */
export interface NormalizedArticle {
  id: string;
  titulo: string;
  bajada: string;
  imagen: string | null;
  link: string;
  fuente: string;
  fecha: string;
  categoria: string;
  seccion: string;
  destacada?: boolean;
}

/**
 * Interfaz para proveedores adicionales de noticias (p. ej. feeds RSS futuros)
 */
export interface NewsSourceProvider {
  name: string;
  fetchArticles(): Promise<NormalizedArticle[]>;
}

export type { NewsItem };
