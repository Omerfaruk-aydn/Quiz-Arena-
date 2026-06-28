import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { History as HistoryIcon } from 'lucide-react';
import { RecentGames } from '../../components/dashboard/RecentGames';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { gameService } from '../../services/gameService';
import { pageVariants } from '../../lib/animations';
import { Button } from '../../components/ui/Button';
import { ROUTES } from '../../lib/constants';

export function GameHistoryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['game-history', 'all'],
    queryFn: () => gameService.history({ limit: 50 }),
  });

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <HistoryIcon size={24} className="text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Oyun Geçmişi</h1>
          <p className="text-text-muted">Tamamlanmış tüm oyunlar</p>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner label="Geçmiş yükleniyor…" />
      ) : data && data.items.length > 0 ? (
        <RecentGames games={data.items} />
      ) : (
        <EmptyState
          icon="📜"
          title="Geçmiş boş"
          description="Henüz tamamlanmış oyun yok. Bir quiz başlat ve ilk oyunu oyna."
          action={
            <Link to={ROUTES.quizzes}>
              <Button>Quizlerime Git</Button>
            </Link>
          }
        />
      )}
    </motion.div>
  );
}
