import { api, setToken, clearToken, type ApiError, extractApiError } from './api';
import type { AuthResponse, User } from '../types';

export const authService = {
  async register(input: {
    name: string;
    email: string;
    password: string;
    role?: 'teacher' | 'student';
  }): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', input);
    setToken(data.accessToken);
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    setToken(data.accessToken);
    return data;
  },

  async me(): Promise<{ user: User }> {
    const { data } = await api.get<{ user: User }>('/auth/me');
    return data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout', {});
    } catch {
      // silent
    } finally {
      clearToken();
    }
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await api.post('/auth/reset-password', { token, password });
  },

  parseError(err: unknown): ApiError {
    return extractApiError(err);
  },
};
