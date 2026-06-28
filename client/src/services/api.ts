import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { API_URL, STORAGE_KEYS } from '../lib/constants';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

let refreshing = false;
let waiters: Array<(token: string | null) => void> = [];

function getToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.accessToken);
}

export function setToken(token: string): void {
  localStorage.setItem(STORAGE_KEYS.accessToken, token);
}

export function clearToken(): void {
  localStorage.removeItem(STORAGE_KEYS.accessToken);
}

export const api: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  timeout: 15000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<ApiError>) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;

    if (status === 401 && !original._retry && !original.url?.includes('/auth/')) {
      original._retry = true;
      if (refreshing) {
        return new Promise((resolve, reject) => {
          waiters.push((token) => {
            if (!token) return reject(error);
            original.headers.set('Authorization', `Bearer ${token}`);
            resolve(api(original));
          });
        });
      }
      refreshing = true;
      try {
        const { data } = await axios.post(
          `${API_URL}/api/auth/refresh`,
          {},
          { withCredentials: true },
        );
        const token = data.accessToken as string;
        setToken(token);
        useAuthStore.getState().setUser(data.user);
        waiters.forEach((w) => w(token));
        waiters = [];
        original.headers.set('Authorization', `Bearer ${token}`);
        return api(original);
      } catch (e) {
        waiters.forEach((w) => w(null));
        waiters = [];
        clearToken();
        useAuthStore.getState().logout();
        toast.error('Oturum süresi doldu, lütfen tekrar giriş yapın');
        return Promise.reject(e);
      } finally {
        refreshing = false;
      }
    }

    const apiErr = error.response?.data;
    if (apiErr && status && status >= 400 && status < 500 && status !== 401) {
      toast.error(apiErr.message ?? 'Bir hata oluştu');
    } else if (status && status >= 500) {
      toast.error('Sunucu hatası, lütfen sonra tekrar deneyin');
    } else if (!error.response) {
      toast.error('Bağlantı hatası, internetinizi kontrol edin');
    }
    return Promise.reject(error);
  },
);

export function extractApiError(err: unknown): ApiError {
  if (axios.isAxiosError<ApiError>(err)) {
    return err.response?.data ?? { code: 'NETWORK', message: 'Bağlantı hatası' };
  }
  return { code: 'UNKNOWN', message: 'Bilinmeyen hata' };
}
