import { api } from './api';
import type { User } from '../types';

export const userService = {
  async getStats(): Promise<{
    stats: User['stats'];
  }> {
    const { data } = await api.get<{ stats: User['stats'] }>('/users/stats');
    return data;
  },

  async updateProfile(input: { name?: string; email?: string }): Promise<{ user: User }> {
    const { data } = await api.put<{ user: User }>('/users/profile', input);
    return data;
  },

  async uploadAvatar(file: File): Promise<{ url: string; publicId: string }> {
    const form = new FormData();
    form.append('avatar', file);
    const { data } = await api.post<{ url: string; publicId: string }>('/users/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
