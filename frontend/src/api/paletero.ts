import { apiClient } from './client';
import type { MiPaleteroGrouped, PaleteroItem } from '../types';

const LOCAL_STORAGE_KEY = 'palantica_paletero_items';

function normalizeItem(raw: any, defaultCat: string = 'En el paletero'): PaleteroItem {
  return {
    id: Number(raw?.id) || Number(raw?.palaId) || Date.now(),
    usuarioId: Number(raw?.usuarioId) || 1,
    palaId: Number(raw?.palaId) || 1,
    palaModelo: String(raw?.palaModelo || raw?.modelo || 'Pala de Pádel'),
    palaMarca: String(raw?.palaMarca || raw?.marca || 'Marca'),
    palaForma: String(raw?.palaForma || raw?.forma || 'Lágrima'),
    palaImagenUrl: raw?.palaImagenUrl || raw?.imagenUrl || null,
    palaPuntuacionGeneral: Number(raw?.palaPuntuacionGeneral ?? raw?.puntuacionGeneral) || 8.8,
    palaDurezaPromedio: Number(raw?.palaDurezaPromedio ?? raw?.durezaPromedio) || 7.0,
    palaPrecioReferencia: Number(raw?.palaPrecioReferencia ?? raw?.precioReferencia ?? raw?.precio) || 220,
    categoria: (raw?.categoria || defaultCat) as any,
    notas: raw?.notas || null,
    fechaRegistro: raw?.fechaRegistro || new Date().toISOString(),
  };
}

function getLocalItems(): PaleteroItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => normalizeItem(item));
  } catch {
    return [];
  }
}

function saveLocalItems(items: PaleteroItem[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // No-op
  }
}

export const paleteroApi = {
  getMiPaletero: async (): Promise<MiPaleteroGrouped> => {
    let remote: MiPaleteroGrouped = {
      usandoActualmente: [],
      palasQueMeGustaron: [],
      palasQueNoMeGustaron: [],
      palasQueQuiero: [],
      palasQueTuve: [],
      enElPaletero: [],
    };

    try {
      const res = await apiClient.get<MiPaleteroGrouped>('/api/v1/paletero/mi-paletero');
      if (res) {
        remote = {
          usandoActualmente: (res.usandoActualmente || []).map((i) => normalizeItem(i, 'Usando actualmente')),
          palasQueMeGustaron: (res.palasQueMeGustaron || []).map((i) => normalizeItem(i, 'Palas que me gustaron')),
          palasQueNoMeGustaron: (res.palasQueNoMeGustaron || []).map((i) => normalizeItem(i, 'Palas que no me gustaron')),
          palasQueQuiero: (res.palasQueQuiero || []).map((i) => normalizeItem(i, 'Palas que quiero')),
          palasQueTuve: (res.palasQueTuve || []).map((i) => normalizeItem(i, 'Palas que tuve')),
          enElPaletero: (res.enElPaletero || []).map((i) => normalizeItem(i, 'En el paletero')),
        };
      }
    } catch (err) {
      console.warn('Paletero remoto no disponible, usando almacenamiento local:', err);
    }

    // Unir con elementos guardados localmente
    const local = getLocalItems();
    for (const item of local) {
      let targetList: PaleteroItem[];
      switch (item.categoria) {
        case 'Usando actualmente':
          targetList = remote.usandoActualmente;
          break;
        case 'Palas que me gustaron':
          targetList = remote.palasQueMeGustaron;
          break;
        case 'Palas que no me gustaron':
          targetList = remote.palasQueNoMeGustaron;
          break;
        case 'Palas que quiero':
          targetList = remote.palasQueQuiero;
          break;
        case 'Palas que tuve':
          targetList = remote.palasQueTuve;
          break;
        case 'En el paletero':
        default:
          targetList = remote.enElPaletero;
          break;
      }

      // Evitar duplicados por palaId
      const existingIdx = targetList.findIndex((p) => p.palaId === item.palaId);
      if (existingIdx >= 0) {
        // Enriquecer el ítem remoto con datos locales completos si faltaba foto o nombre
        targetList[existingIdx] = {
          ...item,
          ...targetList[existingIdx],
          palaImagenUrl: targetList[existingIdx].palaImagenUrl || item.palaImagenUrl,
          palaModelo: targetList[existingIdx].palaModelo !== 'Modelo' ? targetList[existingIdx].palaModelo : item.palaModelo,
          palaMarca: targetList[existingIdx].palaMarca !== 'Marca' ? targetList[existingIdx].palaMarca : item.palaMarca,
        };
      } else {
        targetList.unshift(item);
      }
    }

    return remote;
  },

  addItem: async (data: {
    palaId: number;
    categoria: string;
    notas?: string;
    palaData?: Partial<PaleteroItem>;
  }): Promise<PaleteroItem> => {
    // 1. Crear el ítem completo y normalizado
    const localItem: PaleteroItem = normalizeItem(
      {
        id: Date.now(),
        usuarioId: 1,
        palaId: data.palaId,
        palaModelo: data.palaData?.palaModelo || 'Pala de Pádel',
        palaMarca: data.palaData?.palaMarca || 'Marca',
        palaForma: data.palaData?.palaForma || 'Lágrima',
        palaImagenUrl: data.palaData?.palaImagenUrl || null,
        palaPuntuacionGeneral: data.palaData?.palaPuntuacionGeneral || 9.0,
        palaDurezaPromedio: data.palaData?.palaDurezaPromedio || 7.0,
        palaPrecioReferencia: data.palaData?.palaPrecioReferencia || 250,
        categoria: data.categoria as any,
        notas: data.notas || null,
        fechaRegistro: new Date().toISOString(),
      },
      data.categoria
    );

    // 2. Persistir localmente de inmediato
    const items = getLocalItems();
    const existingIndex = items.findIndex((i) => i.palaId === data.palaId && i.categoria === data.categoria);
    if (existingIndex >= 0) {
      items[existingIndex] = { ...items[existingIndex], ...localItem };
    } else {
      items.unshift(localItem);
    }
    saveLocalItems(items);

    // 3. Intentar persistir en el backend si es posible
    try {
      const res = await apiClient.post<PaleteroItem>('/api/v1/paletero/items', {
        palaId: data.palaId,
        categoria: data.categoria,
        notas: data.notas,
      });
      return res ? normalizeItem({ ...localItem, ...res }, data.categoria) : localItem;
    } catch {
      return localItem;
    }
  },

  removeItem: async (palaId: number, categoria: string): Promise<boolean> => {
    // 1. Quitar de almacenamiento local
    const items = getLocalItems().filter((i) => {
      const matchPala = Number(i.palaId) === Number(palaId) || Number(i.id) === Number(palaId);
      const matchCat = i.categoria.toLowerCase() === categoria.toLowerCase();
      return !(matchPala && matchCat);
    });
    saveLocalItems(items);

    // 2. Si se quitó de 'Usando actualmente' o coincide con pala activa, limpiar de palantica_usuario
    try {
      const rawUser = localStorage.getItem('palantica_usuario');
      if (rawUser) {
        const user = JSON.parse(rawUser);
        if (
          categoria.toLowerCase() === 'usando actualmente' ||
          Number(user.palaActivaId) === Number(palaId) ||
          String(user.palaActivaModelo || '').toLowerCase().includes('star vie')
        ) {
          user.palaActivaId = null;
          user.palaActivaModelo = null;
          user.palaActivaMarca = null;
          localStorage.setItem('palantica_usuario', JSON.stringify(user));
        }
      }
    } catch {
      // No-op
    }

    // 3. Quitar del backend
    try {
      await apiClient.delete(`/api/v1/paletero/items/${palaId}/${encodeURIComponent(categoria)}`);
    } catch {
      // No-op
    }

    return true;
  },
};
