import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { GameHistoryItem } from '../../services/gameService';
import { Badge } from '../ui/Badge';
import { DIFFICULTY_LABELS, DIFFICULTY_STYLES, ROUTES } from '../../lib/constants';
import { formatDuration } from '../../lib/utils';
import { format, parseISO } from 'date-fns';

interface RecentGamesProps {
  games: GameHistoryItem[];
}

export function RecentGames({ games }: RecentGamesProps) {
  return (
    <div className="glass p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">Son Oyunlar</h3>
        <Link
          to="/history"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          Tümü <ArrowRight size={14} />
        </Link>
      </div>
      {games.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-muted">Henüz oyun oynanmadı.</p>
      ) : (
        <div className="space-y-2">
          {games.map((g) => (
            <Link
              key={g._id}
              to={ROUTES.gameReport.replace(':pin', g.pin)}
              className="flex items-center gap-3 rounded-xl bg-surface-2 p-3 transition-colors hover:border-primary/40 border border-transparent"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{g.quiz?.title ?? 'Quiz'}</p>
                <p className="text-xs text-text-muted">
                  {g.finishedAt ? format(parseISO(g.finishedAt), 'dd.MM.yyyy HH:mm') : '—'} ·{' '}
                  {formatDuration(g.duration ?? 0)}
                </p>
              </div>
              <Badge className={DIFFICULTY_STYLES[g.quiz?.difficulty ?? 'medium']}>
                {DIFFICULTY_LABELS[g.quiz?.difficulty ?? 'medium']}
              </Badge>
              <ArrowRight size={16} className="text-text-muted" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
