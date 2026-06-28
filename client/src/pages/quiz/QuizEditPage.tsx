import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { QuizForm } from '../../components/quiz/QuizForm';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { quizService } from '../../services/quizService';
import { ROUTES } from '../../lib/constants';
import toast from 'react-hot-toast';

export function QuizEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['quiz', id],
    queryFn: () => quizService.get(id!),
    enabled: !!id,
  });

  const updateMut = useMutation({
    mutationFn: (patch: Parameters<typeof quizService.update>[1]) => quizService.update(id!, patch),
    onSuccess: () => toast.success('Quiz güncellendi'),
    onError: () => toast.error('Güncelleme başarısız'),
  });

  const autosaveMut = useMutation({
    mutationFn: (patch: Parameters<typeof quizService.update>[1]) => quizService.update(id!, patch),
  });

  if (isLoading) return <LoadingSpinner fullscreen label="Quiz yükleniyor…" />;

  const quiz = data?.quiz;
  if (!quiz) return <p className="text-text-muted">Quiz bulunamadı.</p>;

  return (
    <QuizForm
      title={quiz.title}
      submitLabel="Güncelle"
      submitting={updateMut.isPending}
      onBack={() => navigate(ROUTES.quizzes)}
      quizId={id}
      onAutosave={async (data) => {
        await autosaveMut.mutateAsync(data);
      }}
      initial={{
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        difficulty: quiz.difficulty,
        tags: quiz.tags,
        isPublic: quiz.isPublic,
        settings: quiz.settings,
        questions: quiz.questions,
      }}
      onSubmit={(data) => updateMut.mutate(data)}
    />
  );
}
