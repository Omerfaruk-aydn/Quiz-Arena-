import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { Question, AnswerOption as AnswerOptionType } from '../../types';
import { ANSWER_COLORS, ANSWER_ICONS } from '../../types';
import { cn } from '../../lib/utils';

interface QuizPreviewProps {
  values: {
    title: string;
    description: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    questions: Array<Partial<Question> & { answers: AnswerOptionType[] }>;
  };
  onClose: () => void;
}

export function QuizPreview({ values, onClose }: QuizPreviewProps) {
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const q = values.questions[idx];
  const total = values.questions.length;
  const hasQuestion = !!q && !!q.text;

  return (
    <Dialog open onClose={onClose} title={values.title || 'Quiz Önizleme'} className="max-w-2xl">
      <div className="mb-4 flex items-center gap-2">
        <Badge variant="primary">{values.category}</Badge>
        <Badge variant="outline">{values.difficulty}</Badge>
        <Badge variant="outline">{total} soru</Badge>
      </div>

      {values.description && <p className="mb-4 text-sm text-text-muted">{values.description}</p>}

      {!hasQuestion ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-text-muted">
          Bu soru boş. Önizleme için soru metni girilmeli.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-text-muted">
            <span>
              Soru {idx + 1} / {total}
            </span>
            <span>{q.timeLimit ?? 30} saniye</span>
          </div>
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl bg-surface p-6 text-center"
          >
            <p className="text-xl font-semibold">{q.text}</p>
          </motion.div>
          <div className="grid gap-3 sm:grid-cols-2">
            {(q.answers ?? []).map((a, i) => {
              const color = a.color as keyof typeof ANSWER_COLORS;
              return (
                <div
                  key={i}
                  className={cn(
                    'flex items-center gap-3 rounded-xl p-4 text-white transition-all',
                    revealed && a.isCorrect && 'ring-4 ring-white/60',
                    revealed && !a.isCorrect && 'opacity-40',
                  )}
                  style={{ backgroundColor: ANSWER_COLORS[color] }}
                >
                  <span className="text-lg">{ANSWER_ICONS[color]}</span>
                  <span className="flex-1">{a.text || '—'}</span>
                  {revealed && a.isCorrect && <span className="text-sm">✓</span>}
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => {
                setIdx((i) => Math.max(0, i - 1));
                setRevealed(false);
              }}
              disabled={idx === 0}
            >
              <ChevronLeft size={16} /> Önceki
            </Button>
            <Button variant="secondary" onClick={() => setRevealed((r) => !r)}>
              {revealed ? 'Gizle' : 'Cevabı Göster'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setIdx((i) => Math.min(total - 1, i + 1));
                setRevealed(false);
              }}
              disabled={idx === total - 1}
            >
              Sonraki <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <Button variant="ghost" onClick={onClose}>
          <X size={16} /> Kapat
        </Button>
      </div>
    </Dialog>
  );
}
