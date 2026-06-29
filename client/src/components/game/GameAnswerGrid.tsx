import { motion } from 'framer-motion';
import { ANSWER_COLORS, ANSWER_ICONS } from '../../types';
import type { AnswerColor } from '../../types';
import { cn } from '../../lib/utils';

interface GameAnswerGridProps {
  answers: Array<{ text: string; color: string }>;
  selectedAnswer: number | null;
  correctAnswer: number | null;
  hasAnswered: boolean;
  showResult: boolean;
  onPick: (index: number) => void;
  fiftyFiftyRemoved?: number[];
  hideCorrectHighlight?: boolean;
}

const labels = ['A', 'B', 'C', 'D'];

export function GameAnswerGrid({
  answers,
  selectedAnswer,
  correctAnswer,
  hasAnswered,
  showResult,
  onPick,
  fiftyFiftyRemoved = [],
  hideCorrectHighlight = false,
}: GameAnswerGridProps) {
  return (
    <div className="grid w-full gap-3 sm:gap-4 sm:grid-cols-2">
      {answers.map((a, i) => {
        const isRemoved = !showResult && fiftyFiftyRemoved.includes(i);
        const color = (a.color as AnswerColor) ?? 'blue';
        const bg = ANSWER_COLORS[color] ?? '#3B82F6';
        const shape = ANSWER_ICONS[color] ?? '●';
        const isCorrect = showResult && !hideCorrectHighlight && correctAnswer === i;
        const isWrongPick =
          showResult && !hideCorrectHighlight && selectedAnswer === i && correctAnswer !== i;
        const isFaded =
          showResult && !hideCorrectHighlight && correctAnswer !== i && selectedAnswer !== i;
        if (isRemoved) return null;
        return (
          <motion.button
            key={i}
            type="button"
            disabled={hasAnswered || showResult}
            onClick={() => onPick(i)}
            whileHover={!hasAnswered ? { scale: 1.03 } : undefined}
            whileTap={!hasAnswered ? { scale: 0.97 } : undefined}
            animate={
              isCorrect ? { scale: [1, 1.08, 1] } : isWrongPick ? { scale: [1, 0.95, 1] } : {}
            }
            className={cn(
              'no-tap relative flex min-h-[72px] w-full items-center gap-3 rounded-2xl px-4 py-5 text-left font-medium text-white transition-all sm:min-h-[88px]',
              'disabled:cursor-not-allowed',
              !hasAnswered && !showResult && 'hover:brightness-110',
              selectedAnswer === i && !showResult && 'ring-4 ring-white/50',
              isFaded && 'opacity-40 grayscale',
              isCorrect && 'ring-4 ring-white/70',
              isWrongPick && 'ring-4 ring-black/40',
            )}
            style={{
              backgroundColor: bg,
              boxShadow: `0 8px 24px ${bg}55`,
            }}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/25 text-xl sm:h-12 sm:w-12 sm:text-2xl">
              {shape}
            </span>
            <span className="flex-1 text-base sm:text-xl">{a.text || '—'}</span>
            <span className="font-mono text-xs opacity-70 sm:text-sm">{labels[i]}</span>
            {isCorrect && <span className="text-xl">✓</span>}
          </motion.button>
        );
      })}
    </div>
  );
}
