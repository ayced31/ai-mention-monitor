import { api } from '@/lib/axios';
import type { Analytics } from '@/types';

export const analyticsService = {
  async getBrandAnalytics(
    brandId: string,
    params: {
      from: string;
      to: string;
      granularity?: 'hour' | 'day' | 'week';
    }
  ): Promise<Analytics> {
    const response = await api.get(`/brands/${brandId}/analytics`, { params });
    return response.data;
  },

  async getSummary(brandId: string) {
    const response = await api.get(`/brands/${brandId}/analytics/summary`);
    return response.data;
  },
};
