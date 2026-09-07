import { apiClient } from './client';
import type { ShopifyPalaPreview, ShopifySyncResult } from '../types';

export const shopifyApi = {
  previewStore: async (storeUrl?: string, maxItems = 20): Promise<ShopifyPalaPreview[]> => {
    return await apiClient.get<ShopifyPalaPreview[]>('/api/v1/shopify/preview', {
      storeUrl,
      maxItems,
    });
  },

  syncStore: async (storeUrl: string, maxItems = 20, overwriteExisting = false): Promise<ShopifySyncResult> => {
    return await apiClient.post<ShopifySyncResult>('/api/v1/shopify/sync', {
      storeUrl,
      maxItems,
      overwriteExisting,
    });
  },
};
