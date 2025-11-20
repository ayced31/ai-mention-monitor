import { api } from '@/lib/axios';
import type { Brand } from '@/types';

interface GetAllBrandsOptions {
  search?: string;
  page?: number;
  limit?: number;
}

interface BrandsResponse {
  brands: Brand[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const brandService = {
  async getAll(options: GetAllBrandsOptions = {}): Promise<BrandsResponse> {
    const params = new URLSearchParams();
    if (options.search) params.append('search', options.search);
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());

    const response = await api.get(`/brands?${params.toString()}`);
    return response.data;
  },

  async getById(id: string): Promise<Brand> {
    const response = await api.get(`/brands/${id}`);
    return response.data.brand;
  },

  async create(data: Partial<Brand>): Promise<Brand> {
    const response = await api.post('/brands', data);
    return response.data.brand;
  },

  async update(id: string, data: Partial<Brand>): Promise<Brand> {
    const response = await api.patch(`/brands/${id}`, data);
    return response.data.brand;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/brands/${id}`);
  },
};
