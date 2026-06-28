import { type ComponentType, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { ROUTES } from '../../lib/constants';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  role?: 'teacher' | 'student';
  fallback?: ComponentType;
}

export function AuthGuard({
  children,
  requireAuth = true,
  role,
  fallback: Fallback,
}: AuthGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner fullscreen label="Oturum kontrol ediliyor…" />;
  }

  if (requireAuth && !isAuthenticated) {
    if (Fallback) return <Fallback />;
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />;
  }

  if (!requireAuth && isAuthenticated && user) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  if (role && user && user.role !== role) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  return <>{children}</>;
}
