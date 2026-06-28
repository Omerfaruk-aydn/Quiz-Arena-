import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Gamepad2 } from 'lucide-react';
import { StatsCards } from '../../components/dashboard/StatsCards';
import { ActivityChart } from '../../components/dashboard/ActivityChart';
import { RecentGames } from '../../components/dashboard/RecentGames';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { DashboardSkeleton } from '../../components/common/Skeleton';
import { userService } from '../../services/userService';
import { gameService } from '../../services/gameService';
import { quizService } from '../../services/quizService';
import { ROUTES } from '../../lib/constants';

function buildActivity() {
  const days: Array<{ label: string; games: number; participants: number }> = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      label: d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }),
      games: 0,
      participants: 0,
    });
  }
  return days;
}

export function DashboardPage() {
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['user-stats'],
    queryFn: () => userService.getStats(),
  });
  const { data: historyData } = useQuery({
    queryKey: ['game-history', 'dashboard'],
    queryFn: () => gameService.history({ limit: 5 }),
  });
  const { data: quizData } = useQuery({
    queryKey: ['quizzes', 'count'],
    queryFn: () => quizService.list({ limit: 1 }),
  });

  const stats = statsData?.stats;
  const games = historyData?.items ?? [];
  const activity = buildActivity();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-text-muted">Genel bakış ve son aktiviteler</p>
        </div>
        <div className="flex gap-2">
          <Link to={ROUTES.gameJoin}>
            <Button variant="secondary">
              <Gamepad2 size={16} /> Oyuna Katıl
            </Button>
          </Link>
          <Link to={ROUTES.quizCreate}>
            <Button>
              <Plus size={16} /> Yeni Quiz
            </Button>
          </Link>
        </div>
      </div>

      {statsLoading ? (
        <DashboardSkeleton />
      ) : (
        <StatsCards
          stats={{
            totalQuizzes: quizData?.total ?? 0,
            totalGames: stats?.totalGamesHosted ?? 0,
            totalParticipants: stats?.totalQuestionsAnswered ?? 0,
            highScore: stats?.highScore ?? 0,
          }}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityChart data={activity} />
        </div>
        <RecentGames games={games} />
      </div>

      {games.length === 0 && quizData?.total === 0 && (
        <EmptyState
          icon="🎮"
          title="Henüz içerik yok"
          description="İlk quizini oluştur ve öğrencilerinle ilk oyunu başlat."
          action={
            <Link to={ROUTES.quizCreate}>
              <Button>
                <Plus size={16} /> İlk Quizini Oluştur
              </Button>
            </Link>
          }
        />
      )}
    </div>
  );
}
