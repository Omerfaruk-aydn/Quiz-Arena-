import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Play, Users } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { QuizGridSkeleton } from '../../components/common/Skeleton';
import { quizService } from '../../services/quizService';
import { gameService } from '../../services/gameService';
import { DIFFICULTY_LABELS, DIFFICULTY_STYLES, ROUTES, CATEGORIES } from '../../lib/constants';
import type { Quiz } from '../../types';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';

export function PublicQuizPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [startQuiz, setStartQuiz] = useState<Quiz | null>(null);
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['public-quizzes', search, category],
    queryFn: () =>
      quizService.listPublic({
        search: search || undefined,
        limit: 50,
      }),
  });

  const filtered = data?.items.filter((q) => (category ? q.category === category : true)) ?? [];

  const startGame = async () => {
    if (!startQuiz) return;
    try {
      const res = await gameService.create({ quizId: startQuiz._id });
      toast.success(`Oyun oluşturuldu: ${res.pin}`);
      navigate(ROUTES.gameHost.replace(':pin', res.pin));
    } catch {
      toast.error('Oyun oluşturulamadı');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quiz Kütüphanesi</h1>
        <p className="text-text-muted">Topluluk tarafından paylaşılan herkese açık quizler</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Quiz ara…"
            className="pl-10"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-11 rounded-xl border border-border bg-surface-2 px-3 text-sm text-white btn-focus focus:border-primary"
        >
          <option value="">Tüm kategoriler</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <QuizGridSkeleton />
      ) : filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((quiz) => (
            <div key={quiz._id} className="glass p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold leading-tight">{quiz.title}</h3>
                <Badge
                  variant="primary"
                  className={cn('border', DIFFICULTY_STYLES[quiz.difficulty])}
                >
                  {DIFFICULTY_LABELS[quiz.difficulty]}
                </Badge>
              </div>
              {quiz.description && (
                <p className="text-sm text-text-muted line-clamp-2">{quiz.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
                <Badge variant="default">{quiz.category}</Badge>
                <span className="flex items-center gap-1">
                  <Users size={12} /> {quiz.stats?.totalParticipants ?? 0}
                </span>
                <span>{quiz.stats?.timesPlayed ?? 0} oynanma</span>
              </div>
              {quiz.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {quiz.tags.slice(0, 4).map((t) => (
                    <span
                      key={t}
                      className="rounded-md bg-surface-2 px-2 py-0.5 text-xs text-text-muted"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <Button size="sm" className="w-full" onClick={() => setStartQuiz(quiz)}>
                <Play size={14} /> Oyun Başlat
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="📚"
          title="Quiz bulunamadı"
          description={
            search || category ? 'Filtrelerinize uygun quiz yok.' : 'Henüz herkese açık quiz yok.'
          }
        />
      )}

      {startQuiz && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setStartQuiz(null)}
        >
          <div className="glass max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold">Oyunu Başlat</h2>
            <p className="text-sm text-text-muted">
              "{startQuiz.title}" quizi için yeni bir oyun oturumu oluşturulacak.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setStartQuiz(null)}>
                İptal
              </Button>
              <Button onClick={() => void startGame()}>
                <Play size={16} /> Başlat
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
