import { api } from '@/lib/axios';
import type { Alert } from '@/types';

export const alertService = {
  async getAll(): Promise<Alert[]> {
    const response = await api.get('/alerts');
    return response.data.alerts;
  },

  async getById(id: string): Promise<Alert> {
    const response = await api.get(`/alerts/${id}`);
    return response.data.alert;
  },

  async create(data: Partial<Alert>): Promise<Alert> {
    const response = await api.post('/alerts', data);
    return response.data.alert;
  },

  async update(id: string, data: Partial<Alert>): Promise<Alert> {
    const response = await api.patch(`/alerts/${id}`, data);
    return response.data.alert;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/alerts/${id}`);
  },
};
