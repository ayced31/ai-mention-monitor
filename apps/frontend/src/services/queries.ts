import { api } from '@/lib/axios';
import type { Query } from '@/types';

export const queryService = {
  async getAll(brandId: string): Promise<Query[]> {
    const response = await api.get(`/brands/${brandId}/queries`);
    return response.data.queries;
  },

  async getById(id: string): Promise<Query> {
    const response = await api.get(`/queries/${id}`);
    return response.data.query;
  },

  async create(brandId: string, data: Partial<Query>): Promise<Query> {
    const response = await api.post(`/brands/${brandId}/queries`, data);
    return response.data.query;
  },

  async update(id: string, data: Partial<Query>): Promise<Query> {
    const response = await api.patch(`/queries/${id}`, data);
    return response.data.query;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/queries/${id}`);
  },

  async triggerCheck(id: string): Promise<void> {
    await api.post(`/queries/${id}/check`);
  },

  async getStats(id: string) {
    const response = await api.get(`/queries/${id}/stats`);
    return response.data;
  },
};
