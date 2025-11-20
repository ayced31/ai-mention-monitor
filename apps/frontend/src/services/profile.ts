import { api } from '@/lib/axios';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  plan: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    brands: number;
    alerts: number;
  };
}

export interface UpdateProfileDto {
  name?: string;
  email?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface DeleteAccountDto {
  password: string;
}

export const profileService = {
  async getProfile(): Promise<UserProfile> {
    const response = await api.get('/profile');
    return response.data;
  },

  async updateProfile(data: UpdateProfileDto): Promise<UserProfile> {
    const response = await api.patch('/profile', data);
    return response.data;
  },

  async changePassword(data: ChangePasswordDto): Promise<{ message: string }> {
    const response = await api.post('/profile/change-password', data);
    return response.data;
  },

  async deleteAccount(data: DeleteAccountDto): Promise<{ message: string }> {
    const response = await api.delete('/profile', { data });
    return response.data;
  },
};
