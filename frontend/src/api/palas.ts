import { apiClient } from './client';
import { padelfulApi, padelfulToPala, padelfulToPalaDetalle } from './padelful';
import type { Pala, PalaDetalle, PalaSimilar, PalaFilterParams, PagedResponse, Marca } from '../types';

const fallbackMarcas: Marca[] = [
  { id: 1, nombre: 'Bullpadel', paisOrigen: 'España', sitioWeb: 'https://www.bullpadel.com', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Bullpadel_logo.png', totalPalas: 0 },
  { id: 2, nombre: 'Nox', paisOrigen: 'España', sitioWeb: 'https://www.noxsport.es', logoUrl: 'https://noxsport.es/cdn/shop/files/NOX_LOGO_2024.png', totalPalas: 0 },
  { id: 3, nombre: 'Adidas', paisOrigen: 'Alemania', sitioWeb: 'https://www.allforpadel.com', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg', totalPalas: 0 },
  { id: 4, nombre: 'Head', paisOrigen: 'Austria', sitioWeb: 'https://www.head.com', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Head_logo.svg/1280px-Head_logo.svg.png', totalPalas: 0 },
  { id: 5, nombre: 'Babolat', paisOrigen: 'Francia', sitioWeb: 'https://www.babolat.com', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Babolat_Logo.svg/1200px-Babolat_Logo.svg.png', totalPalas: 0 },
  { id: 6, nombre: 'Siux', paisOrigen: 'España', sitioWeb: 'https://www.siuxpadel.com', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Siux_logo.png/640px-Siux_logo.png', totalPalas: 0 },
  { id: 7, nombre: 'StarVie', paisOrigen: 'España', sitioWeb: 'https://www.starvie.com', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/StarVie_logo.png/640px-StarVie_logo.png', totalPalas: 0 },
  { id: 8, nombre: 'Wilson', paisOrigen: 'Estados Unidos', sitioWeb: 'https://www.wilson.com', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Wilson_Sporting_Goods_logo.svg/1280px-Wilson_Sporting_Goods_logo.svg.png', totalPalas: 0 },
  { id: 9, nombre: 'Drop Shot', paisOrigen: 'España', sitioWeb: 'https://www.dropshot.es', logoUrl: '', totalPalas: 0 },
  { id: 10, nombre: 'Kuikma', paisOrigen: 'Francia', sitioWeb: 'https://www.decathlon.es', logoUrl: '', totalPalas: 0 },
  { id: 11, nombre: 'Varlion', paisOrigen: 'España', sitioWeb: 'https://www.varlion.com', logoUrl: '', totalPalas: 0 },
  { id: 12, nombre: 'Oxdog', paisOrigen: 'Suecia', sitioWeb: 'https://www.oxdog.com', logoUrl: '', totalPalas: 0 }
];

export const palasApi = {
  getPalas: async (params?: PalaFilterParams): Promise<PagedResponse<Pala>> => {
    try {
      const res = await apiClient.get<PagedResponse<Pala>>(
        '/api/v1/palas',
        params as Record<string, string | number | boolean | null | undefined>
      );
      if (res && res.items && res.items.length > 8) {
        return res;
      }
      // Complementar con el catálogo indexado de 1.722 palas
      const allRackets = await padelfulApi.getRackets({
        query: params?.search,
        brand: params?.marca,
        shape: params?.forma,
        limit: 2500,
      });
      const palas = allRackets.map((r, i) => padelfulToPala(r, i + 1));
      const page = params?.page || 1;
      const pageSize = params?.pageSize || 24;
      const start = (page - 1) * pageSize;
      const paged = palas.slice(start, start + pageSize);
      return {
        items: paged,
        page,
        pageSize,
        totalCount: palas.length,
        totalPages: Math.ceil(palas.length / pageSize),
        hasNextPage: start + pageSize < palas.length,
        hasPreviousPage: page > 1,
      };
    } catch {
      const allRackets = await padelfulApi.getRackets({
        query: params?.search,
        brand: params?.marca,
        shape: params?.forma,
        limit: 2500,
      });
      const palas = allRackets.map((r, i) => padelfulToPala(r, i + 1));
      const page = params?.page || 1;
      const pageSize = params?.pageSize || 24;
      const start = (page - 1) * pageSize;
      const paged = palas.slice(start, start + pageSize);
      return {
        items: paged,
        page,
        pageSize,
        totalCount: palas.length,
        totalPages: Math.ceil(palas.length / pageSize),
        hasNextPage: start + pageSize < palas.length,
        hasPreviousPage: page > 1,
      };
    }
  },

  getPalaDetalle: async (id: number): Promise<PalaDetalle> => {
    try {
      return await apiClient.get<PalaDetalle>(`/api/v1/palas/${id}`);
    } catch {
      const all = await padelfulApi.getRackets({ limit: 2500 });
      const indexInCatalog = id >= 90000 ? id - 90001 : id - 1;
      const item = (indexInCatalog >= 0 && indexInCatalog < all.length) ? all[indexInCatalog] : all[0];
      if (!item) {
        throw new Error(`Pala no encontrada con ID ${id}`);
      }
      return padelfulToPalaDetalle(item, id);
    }
  },

  getPalaBySlug: async (slug: string): Promise<PalaDetalle> => {
    try {
      return await apiClient.get<PalaDetalle>(`/api/v1/palas/slug/${encodeURIComponent(slug)}`);
    } catch {
      const all = await padelfulApi.getRackets({ limit: 2500 });
      const norm = slug.toLowerCase().trim();
      const index = all.findIndex((r) => r.slug.toLowerCase().trim() === norm);
      const racket = index >= 0 ? all[index] : await padelfulApi.getRacketBySlug(slug);
      const palaId = index >= 0 ? 90001 + index : 90001;
      return padelfulToPalaDetalle(racket, palaId);
    }
  },

  getPalasSimilares: async (id: number, limit = 4): Promise<PalaSimilar[]> => {
    try {
      return await apiClient.get<PalaSimilar[]>(`/api/v1/palas/${id}/similares`, { limit });
    } catch {
      return [];
    }
  },

  getMarcas: async (): Promise<Marca[]> => {
    try {
      const res = await apiClient.get<Marca[]>('/api/v1/marcas');
      if (res && res.length > 0) return res;
      return fallbackMarcas;
    } catch {
      return fallbackMarcas;
    }
  },
};
