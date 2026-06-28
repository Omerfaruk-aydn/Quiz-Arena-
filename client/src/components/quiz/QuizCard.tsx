import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, Edit3, Copy, Trash2, Users, Clock } from 'lucide-react';
import type { Quiz } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { cn, formatNumber } from '../../lib/utils';
import { DIFFICULTY_LABELS, DIFFICULTY_STYLES, ROUTES } from '../../lib/constants';
import { cardVariants } from '../../lib/animations';

interface QuizCardProps {
  quiz: Quiz;
  onStart?: (quiz: Quiz) => void;
  onDuplicate?: (quiz: Quiz) => void;
  onDelete?: (quiz: Quiz) => void;
  index?: number;
}

export function QuizCard({ quiz, onStart, onDuplicate, onDelete, index = 0 }: QuizCardProps) {
  const questionCount = quiz.questions?.length ?? 0;
  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      transition={{ delay: Math.min(index * 0.05, 0.4) }}
      className="glass group relative overflow-hidden p-0"
    >
      <div
        className="h-28 w-full bg-gradient-to-br from-primary/30 via-accent-pink/20 to-accent-amber/20"
        style={
          quiz.coverImage?.url
            ? {
                backgroundImage: `url(${quiz.coverImage.url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      />
      <div className="p-5">
        <div className="mb-2 flex items-center gap-2">
          <Badge className={DIFFICULTY_STYLES[quiz.difficulty]}>
            {DIFFICULTY_LABELS[quiz.difficulty]}
          </Badge>
          <Badge variant="outline">{quiz.category}</Badge>
          {quiz.isPublic && <Badge variant="primary">Herkese açık</Badge>}
        </div>

        <h3 className="mb-1 line-clamp-1 text-lg font-semibold">{quiz.title}</h3>
        <p className="mb-4 line-clamp-2 text-sm text-text-muted min-h-[2.5rem]">
          {quiz.description || 'Açıklama yok'}
        </p>

        <div className="mb-4 flex items-center gap-4 text-xs text-text-muted">
          <span className="inline-flex items-center gap-1">
            <Clock size={14} /> {quiz.settings?.defaultTimeLimit ?? 30}sn
          </span>
          <span className="inline-flex items-center gap-1">
            <Users size={14} /> {questionCount} soru
          </span>
          <span className="inline-flex items-center gap-1">
            <Play size={14} /> {formatNumber(quiz.stats?.timesPlayed ?? 0)} oynanma
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" className="flex-1" onClick={() => onStart?.(quiz)}>
            <Play size={16} /> Başlat
          </Button>
          <Link to={ROUTES.quizEdit.replace(':id', quiz._id)}>
            <Button size="icon" variant="secondary" aria-label="Düzenle">
              <Edit3 size={16} />
            </Button>
          </Link>
          {onDuplicate && (
            <Button
              size="icon"
              variant="secondary"
              onClick={() => onDuplicate(quiz)}
              aria-label="Kopyala"
            >
              <Copy size={16} />
            </Button>
          )}
          {onDelete && (
            <Button
              size="icon"
              variant="secondary"
              onClick={() => onDelete(quiz)}
              aria-label="Sil"
              className={cn('hover:text-wrong')}
            >
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
