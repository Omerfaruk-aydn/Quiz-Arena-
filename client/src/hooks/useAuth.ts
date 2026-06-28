import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuthStore } from '../stores/authStore';
import { ROUTES } from '../lib/constants';
import toast from 'react-hot-toast';

export function useAuth() {
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    isLoading,
    setUser,
    setLoading,
    logout: storeLogout,
  } = useAuthStore();

  const login = useCallback(
    async (email: string, password: string) => {
      const { user, accessToken } = await authService.login(email, password);
      setUser(user);
      void accessToken;
      toast.success(`Hoş geldin, ${user.name}!`);
      navigate(ROUTES.dashboard);
      return user;
    },
    [navigate, setUser],
  );

  const register = useCallback(
    async (input: {
      name: string;
      email: string;
      password: string;
      role?: 'teacher' | 'student';
    }) => {
      const { user } = await authService.register(input);
      setUser(user);
      toast.success('Hesap oluşturuldu!');
      navigate(ROUTES.dashboard);
      return user;
    },
    [navigate, setUser],
  );

  const logout = useCallback(async () => {
    await authService.logout();
    storeLogout();
    navigate(ROUTES.landing);
    toast.success('Çıkış yapıldı');
  }, [navigate, storeLogout]);

  const bootstrap = useCallback(async () => {
    try {
      const { user } = await authService.me();
      setUser(user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [setUser, setLoading]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    bootstrap,
    setUser,
  };
}
