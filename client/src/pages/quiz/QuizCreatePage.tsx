import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { QuizForm } from '../../components/quiz/QuizForm';
import { quizService } from '../../services/quizService';
import { ROUTES } from '../../lib/constants';
import toast from 'react-hot-toast';

export function QuizCreatePage() {
  const navigate = useNavigate();

  const createMut = useMutation({
    mutationFn: quizService.create,
    onSuccess: (data) => {
      toast.success('Quiz oluşturuldu');
      navigate(ROUTES.quizEdit.replace(':id', data.quiz._id));
    },
    onError: () => toast.error('Oluşturma başarısız'),
  });

  return (
    <QuizForm
      title="Yeni Quiz Oluştur"
      submitLabel="Oluştur"
      submitting={createMut.isPending}
      onBack={() => navigate(ROUTES.quizzes)}
      onSubmit={(data) => createMut.mutate(data)}
    />
  );
}
