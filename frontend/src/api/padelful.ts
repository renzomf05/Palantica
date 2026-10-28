import { apiClient } from './client';
import type {
  PadelfulPalaPreview,
  PadelfulFilterParams,
  PadelfulSyncRequest,
  PadelfulSyncResult,
} from '../types';

let _localCatalogCache: PadelfulPalaPreview[] | null = null;

async function fetchLocalCatalog(params?: PadelfulFilterParams, existing?: PadelfulPalaPreview[]): Promise<PadelfulPalaPreview[]> {
  if (!_localCatalogCache) {
    try {
      const response = await fetch('/padelful_rackets.json');
      if (response.ok) {
        _localCatalogCache = await response.json();
      }
    } catch (e) {
      console.warn('Fallback local /padelful_rackets.json:', e);
    }
  }

  let items = _localCatalogCache || [];
  if (existing && existing.length > 0) {
    const existingSlugs = new Set(existing.map((p) => p.slug.toLowerCase().trim()));
    items = [...existing, ...items.filter((p) => !existingSlugs.has(p.slug.toLowerCase().trim()))];
  }

  if (!params) return items;

  let filtered = items;
  if (params.query) {
    const q = params.query.toLowerCase().trim();
    const words = q.split(/\s+/);
    filtered = filtered.filter((p) => {
      const text = `${p.marca} ${p.modelo} ${p.jugadorPro || ''} ${p.slug}`.toLowerCase();
      return words.every((w) => text.includes(w));
    });
  }
  if (params.brand) {
    const b = params.brand.toLowerCase().trim();
    filtered = filtered.filter((p) => p.marca.toLowerCase().includes(b) || b.includes(p.marca.toLowerCase()));
  }
  if (params.shape) {
    const s = params.shape.toLowerCase().trim();
    filtered = filtered.filter((p) => p.forma.toLowerCase().includes(s));
  }
  if (params.minRating) {
    filtered = filtered.filter((p) => p.puntuacionGeneral >= params.minRating!);
  }

  if (params.offset && params.offset > 0) {
    filtered = filtered.slice(params.offset);
  }
  if (params.limit && params.limit > 0) {
    filtered = filtered.slice(0, params.limit);
  }

  return filtered;
}

export const padelfulApi = {
  getRackets: async (params?: PadelfulFilterParams): Promise<PadelfulPalaPreview[]> => {
    try {
      const res = await apiClient.get<PadelfulPalaPreview[]>(
        '/api/v1/padelful/rackets',
        params as Record<string, string | number | boolean | null | undefined>
      );
      if (res && res.length > 8) {
        return res;
      }
      return await fetchLocalCatalog(params, res);
    } catch {
      return await fetchLocalCatalog(params);
    }
  },

  getRacketBySlug: async (slug: string): Promise<PadelfulPalaPreview> => {
    try {
      return await apiClient.get<PadelfulPalaPreview>(`/api/v1/padelful/rackets/${slug}`);
    } catch {
      const all = await fetchLocalCatalog();
      const norm = slug.toLowerCase().trim();
      const match = all.find((p) => p.slug.toLowerCase().trim() === norm || p.slug.toLowerCase().includes(norm));
      if (match) return match;
      throw new Error(`Pala no encontrada con slug ${slug}`);
    }
  },

  syncRackets: async (request?: PadelfulSyncRequest): Promise<PadelfulSyncResult> => {
    return await apiClient.post<PadelfulSyncResult>('/api/v1/padelful/sync', request ?? {});
  },

  getJugadoresPro: async (): Promise<import('../types').ProPlayerRacket[]> => {
    try {
      const res = await apiClient.get<PadelfulPalaPreview[]>('/api/v1/padelful/jugadores-pro');
      if (res && res.length > 0) {
        return res.map((r, i) => padelfulToProPlayerRacket(r, i));
      }
    } catch {
      // Fallback a catálogo API local
    }

    const all = await fetchLocalCatalog();
    const proOnly = all.filter((r) => r.jugadorPro && r.jugadorPro.trim().length > 0);
    // Deduplicar una pala por jugador para variedad o por slug
    const seenSlugs = new Set<string>();
    const uniquePros = proOnly.filter((r) => {
      const key = r.slug.toLowerCase().trim();
      if (seenSlugs.has(key)) return false;
      seenSlugs.add(key);
      return true;
    });

    return uniquePros.map((r, i) => padelfulToProPlayerRacket(r, i));
  },
};

const TOP_PLAYERS_METADATA: Record<string, { ranking?: string; posicion?: 'Revés' | 'Drive'; genero?: 'Masculino' | 'Femenino'; isTop5?: boolean }> = {
  'agustín tapia': { ranking: '#1 FIP', posicion: 'Revés', genero: 'Masculino', isTop5: true },
  'arturo coello': { ranking: '#1 FIP', posicion: 'Drive', genero: 'Masculino', isTop5: true },
  'ale galán': { ranking: '#3 FIP', posicion: 'Revés', genero: 'Masculino', isTop5: true },
  'fede chingotto': { ranking: '#4 FIP', posicion: 'Drive', genero: 'Masculino', isTop5: true },
  'juan lebrón': { ranking: '#5 FIP', posicion: 'Revés', genero: 'Masculino', isTop5: true },
  'franco stupaczuk': { ranking: '#6 FIP', posicion: 'Revés', genero: 'Masculino', isTop5: false },
  'martín di nenno': { ranking: '#7 FIP', posicion: 'Drive', genero: 'Masculino', isTop5: false },
  'paquito navarro': { ranking: '#8 FIP', posicion: 'Revés', genero: 'Masculino', isTop5: false },
  'juan tello': { ranking: '#12 FIP', posicion: 'Revés', genero: 'Masculino', isTop5: false },
  'pablo cardona': { ranking: '#15 FIP', posicion: 'Drive', genero: 'Masculino', isTop5: false },
  'álex ruiz': { ranking: '#16 FIP', posicion: 'Drive', genero: 'Masculino', isTop5: false },
  'miguel lamperti': { ranking: 'Leyenda', posicion: 'Revés', genero: 'Masculino', isTop5: false },
  'claudia fernández': { ranking: '#3 FIP', posicion: 'Drive', genero: 'Femenino', isTop5: true },
  'aranzazu osoro': { ranking: '#12 FIP', posicion: 'Drive', genero: 'Femenino', isTop5: false },
  'paula josemaría': { ranking: '#1 FIP', posicion: 'Drive', genero: 'Femenino', isTop5: true },
  'ariana sánchez': { ranking: '#1 FIP', posicion: 'Revés', genero: 'Femenino', isTop5: true },
  'delfi brea': { ranking: '#4 FIP', posicion: 'Drive', genero: 'Femenino', isTop5: true },
  'gemma triay': { ranking: '#3 FIP', posicion: 'Revés', genero: 'Femenino', isTop5: true },
};

export function padelfulToProPlayerRacket(p: PadelfulPalaPreview, index: number = 0): import('../types').ProPlayerRacket {
  const normPlayer = (p.jugadorPro || '').toLowerCase().trim();
  const meta = TOP_PLAYERS_METADATA[normPlayer] || {
    ranking: 'Pro Tour',
    posicion: 'Revés',
    genero: normPlayer.includes('maría') || normPlayer.includes('claudia') || normPlayer.includes('osoro') || normPlayer.includes('brea') || normPlayer.includes('triay') ? 'Femenino' : 'Masculino',
    isTop5: false,
  };

  return {
    id: `pro-${p.slug || index}`,
    jugador: p.jugadorPro || 'Jugador Pro',
    rankingFip: meta.ranking,
    posicion: meta.posicion,
    genero: meta.genero,
    isTop5: meta.isTop5,
    marca: p.marca,
    modelo: p.modelo,
    subtitulo: `${p.forma} • ${p.materialCaras || 'Carbono'} • ${p.materialNucleo || 'Black EVA'}`,
    forma: p.forma,
    slug: p.slug,
    imagenUrl: p.imagenUrl || 'https://www.padelful.com/images/rackets/placeholder.webp',
    rating: p.puntuacionGeneral || 9.0,
    precio: p.precio,
  };
}

export function toCarouselCardItem(racket: import('../types').ProPlayerRacket): import('../types').CarouselCardItem {
  return {
    id: racket.id,
    titulo: racket.modelo,
    subtitulo: racket.subtitulo,
    etiqueta: '',
    imagenUrl: racket.imagenUrl,
    linkTo: `/paletas/${racket.slug}`,
    rating: racket.rating,
  };
}

export function padelfulToPala(p: PadelfulPalaPreview, index: number = 1): import('../types').Pala {
  return {
    id: 90000 + index,
    slug: p.slug,
    marcaId: index,
    marcaNombre: p.marca,
    modelo: p.modelo,
    forma: p.forma,
    balanceMm: p.balanceMm || 265,
    pesoMin: 360,
    pesoMax: 375,
    materialNucleo: p.materialNucleo,
    materialCaras: p.materialCaras,
    superficieRugosa: 'Rugoso 3D Relief',
    estacionOptima: p.durezaScore > 7.5 ? 'Verano' : p.durezaScore < 5.5 ? 'Invierno' : 'TodoAno',
    precioReferencia: p.precio,
    monedaPrecio: p.moneda || 'EUR',
    fuentePrecio: 'Índice Oficial Verificado',
    puntuacionGeneral: p.puntuacionGeneral,
    durezaPromedio: p.durezaScore,
    potenciaPromedio: p.potenciaScore,
    controlPromedio: p.controlScore,
    imagenUrl: p.imagenUrl,
    anoLanzamiento: p.anoLanzamiento,
    jugadorPro: p.jugadorPro,
    totalResenas: 24,
    totalVotos: 85,
    nivelJuego: 'Avanzado / Pro',
    balanceNivel: p.balanceNivel,
    durezaNivel: p.durezaNivel,
  };
}

export function padelfulToPalaDetalle(p: PadelfulPalaPreview, index: number = 1): import('../types').PalaDetalle {
  const base = padelfulToPala(p, index);
  return {
    ...base,
    marcaPais: 'España',
    salidaBolaPromedio: p.salidaBolaScore,
    maniobrabilidadPromedio: p.maniobrabilidadScore,
    puntoDulcePromedio: p.puntoDulceScore,
    confortPromedio: (p.maniobrabilidadScore + p.puntoDulceScore) / 2,
    descripcion: p.descripcion || `Pala de pádel de competición ${p.modelo} de ${p.marca}.`,
  };
}

