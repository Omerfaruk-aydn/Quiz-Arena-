import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { AuthGuard } from './components/auth/AuthGuard';
import { AppLayout } from './components/layout/AppLayout';
import { GameLayout } from './components/layout/GameLayout';
import { useAuth } from './hooks/useAuth';
import { ROUTES, API_URL } from './lib/constants';
import { TOAST_DURATION } from './lib/constants';

const LandingPage = lazy(() =>
  import('./pages/public/LandingPage').then((m) => ({ default: m.LandingPage })),
);
const LoginPage = lazy(() =>
  import('./pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })),
);
const RegisterPage = lazy(() =>
  import('./pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })),
);
const ForgotPasswordPage = lazy(() =>
  import('./pages/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })),
);
const ResetPasswordPage = lazy(() =>
  import('./pages/auth/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })),
);
const DashboardPage = lazy(() =>
  import('./pages/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const GameHistoryPage = lazy(() =>
  import('./pages/dashboard/GameHistoryPage').then((m) => ({ default: m.GameHistoryPage })),
);
const ProfilePage = lazy(() =>
  import('./pages/dashboard/ProfilePage').then((m) => ({ default: m.ProfilePage })),
);
const QuizListPage = lazy(() =>
  import('./pages/quiz/QuizListPage').then((m) => ({ default: m.QuizListPage })),
);
const QuizCreatePage = lazy(() =>
  import('./pages/quiz/QuizCreatePage').then((m) => ({ default: m.QuizCreatePage })),
);
const QuizEditPage = lazy(() =>
  import('./pages/quiz/QuizEditPage').then((m) => ({ default: m.QuizEditPage })),
);
const PublicQuizPage = lazy(() =>
  import('./pages/quiz/PublicQuizPage').then((m) => ({ default: m.PublicQuizPage })),
);
const GameJoinPage = lazy(() =>
  import('./pages/game/GameJoinPage').then((m) => ({ default: m.GameJoinPage })),
);
const GameHostPage = lazy(() =>
  import('./pages/game/GameHostPage').then((m) => ({ default: m.GameHostPage })),
);
const GamePlayerPage = lazy(() =>
  import('./pages/game/GamePlayerPage').then((m) => ({ default: m.GamePlayerPage })),
);
const GameReportPage = lazy(() =>
  import('./pages/game/GameReportPage').then((m) => ({ default: m.GameReportPage })),
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

function PageFallback() {
  return <LoadingSpinner fullscreen label="Yükleniyor…" />;
}

function Bootstrap() {
  const { bootstrap } = useAuth();
  useEffect(() => {
    const warmup = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10_000);
        await fetch(`${API_URL}/health`, { signal: controller.signal });
        clearTimeout(timeout);
      } catch {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 20_000);
          await fetch(`${API_URL}/health`, { signal: controller.signal });
          clearTimeout(timeout);
        } catch {
          // Give up, bootstrap will handle it
        }
      }
    };
    void warmup().finally(() => bootstrap());

    // Keep Render awake — ping every 4 minutes
    const keepalive = setInterval(() => {
      void fetch(`${API_URL}/health`).catch(() => undefined);
    }, 240_000);
    return () => clearInterval(keepalive);
  }, [bootstrap]);
  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <BrowserRouter>
          <Bootstrap />
          <Suspense fallback={<PageFallback />}>
            <Routes>
              {/* Public */}
              <Route path={ROUTES.landing} element={<LandingPage />} />

              {/* Auth (guest-only) */}
              <Route
                path={ROUTES.login}
                element={
                  <AuthGuard requireAuth={false}>
                    <LoginPage />
                  </AuthGuard>
                }
              />
              <Route
                path={ROUTES.register}
                element={
                  <AuthGuard requireAuth={false}>
                    <RegisterPage />
                  </AuthGuard>
                }
              />
              <Route path={ROUTES.resetPassword} element={<ResetPasswordPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Game (public — guests can join) */}
              <Route path={ROUTES.gameJoin} element={<GameJoinPage />} />
              <Route
                path={ROUTES.gamePlayer}
                element={
                  <GameLayout>
                    <GamePlayerPage />
                  </GameLayout>
                }
              />

              {/* Protected (AppLayout) */}
              <Route
                element={
                  <AuthGuard>
                    <AppLayout />
                  </AuthGuard>
                }
              >
                <Route path={ROUTES.dashboard} element={<DashboardPage />} />
                <Route path="/history" element={<GameHistoryPage />} />
                <Route path={ROUTES.profile} element={<ProfilePage />} />
                <Route path={ROUTES.quizzes} element={<QuizListPage />} />
                <Route path={ROUTES.publicQuizzes} element={<PublicQuizPage />} />
                <Route path={ROUTES.quizCreate} element={<QuizCreatePage />} />
                <Route path={ROUTES.quizEdit} element={<QuizEditPage />} />
                <Route path={ROUTES.gameReport} element={<GameReportPage />} />
              </Route>

              {/* Host (protected, full-screen) */}
              <Route
                path={ROUTES.gameHost}
                element={
                  <AuthGuard>
                    <GameLayout>
                      <GameHostPage />
                    </GameLayout>
                  </AuthGuard>
                }
              />

              <Route path="*" element={<Navigate to={ROUTES.landing} replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: TOAST_DURATION,
            style: {
              background: '#13131A',
              color: '#F8FAFC',
              border: '1px solid #2A2A3A',
              borderRadius: '12px',
            },
            success: { iconTheme: { primary: '#22C55E', secondary: '#0A0A0F' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#0A0A0F' } },
          }}
        />
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
