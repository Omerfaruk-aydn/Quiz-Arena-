import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Search, Play } from 'lucide-react';
import { QuizCard } from '../../components/quiz/QuizCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/common/EmptyState';
import { QuizGridSkeleton } from '../../components/common/Skeleton';
import { Dialog } from '../../components/ui/Dialog';
import { quizService } from '../../services/quizService';
import { gameService } from '../../services/gameService';
import type { Quiz } from '../../types';
import { ROUTES } from '../../lib/constants';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export function QuizListPage() {
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<Quiz | null>(null);
  const [startQuiz, setStartQuiz] = useState<Quiz | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['quizzes', search],
    queryFn: () => quizService.list({ search: search || undefined, limit: 50 }),
  });

  const duplicateMut = useMutation({
    mutationFn: (id: string) => quizService.duplicate(id),
    onSuccess: () => {
      toast.success('Quiz kopyalandı');
      void queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
    onError: () => toast.error('Kopyalama başarısız'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => quizService.remove(id),
    onSuccess: () => {
      toast.success('Quiz silindi');
      setConfirmDelete(null);
      void queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
    onError: () => toast.error('Silme başarısız'),
  });

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Quizlerim</h1>
          <p className="text-text-muted">{data?.total ?? 0} quiz</p>
        </div>
        <Link to={ROUTES.quizCreate}>
          <Button>
            <Plus size={16} /> Yeni Quiz
          </Button>
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Quiz ara…"
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <QuizGridSkeleton />
      ) : data && data.items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((quiz, i) => (
            <QuizCard
              key={quiz._id}
              quiz={quiz}
              index={i}
              onStart={(q) => setStartQuiz(q)}
              onDuplicate={(q) => duplicateMut.mutate(q._id)}
              onDelete={(q) => setConfirmDelete(q)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="📚"
          title="Quiz bulunamadı"
          description={search ? 'Aramanızla eşleşen quiz yok.' : 'İlk quizini oluşturarak başla.'}
          action={
            !search && (
              <Link to={ROUTES.quizCreate}>
                <Button>
                  <Plus size={16} /> Yeni Quiz
                </Button>
              </Link>
            )
          }
        />
      )}

      <Dialog
        open={!!startQuiz}
        onClose={() => setStartQuiz(null)}
        title="Oyunu Başlat"
        description={`"${startQuiz?.title}" quizi için yeni bir oyun oturumu oluşturulacak.`}
      >
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setStartQuiz(null)}>
            İptal
          </Button>
          <Button onClick={() => void startGame()}>
            <Play size={16} /> Başlat
          </Button>
        </div>
      </Dialog>

      <Dialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Quizi Sil"
        description={`"${confirmDelete?.title}" kalıcı olarak silinecek. Bu işlem geri alınamaz.`}
      >
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
            İptal
          </Button>
          <Button
            variant="danger"
            loading={deleteMut.isPending}
            onClick={() => confirmDelete && deleteMut.mutate(confirmDelete._id)}
          >
            Sil
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
