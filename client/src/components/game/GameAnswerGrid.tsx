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
  gameMode?: string;
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
        const isSelected = selectedAnswer === i && !showResult;

        if (isRemoved) return null;

        return (
          <motion.button
            key={i}
            type="button"
            disabled={hasAnswered || showResult}
            onClick={() => onPick(i)}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={
              isCorrect
                ? {
                    opacity: 1, y: 0,
                    scale: [1, 1.08, 1],
                    boxShadow: [
                      `0 8px 24px ${bg}55`,
                      `0 8px 40px ${bg}aa, 0 0 60px ${bg}44`,
                      `0 8px 24px ${bg}55`,
                    ],
                  }
                : isWrongPick
                  ? { opacity: 1, y: 0, scale: [1, 0.95, 1], x: [0, -5, 5, -3, 3, 0] }
                  : isSelected
                    ? { opacity: 1, y: 0, scale: 1.03 }
                    : { opacity: 1, y: 0, scale: 1 }
            }
            transition={{
              delay: i * 0.08,
              type: 'spring', stiffness: 200, damping: 15,
              ...(isCorrect ? { duration: 0.8 } : {}),
              ...(isWrongPick ? { duration: 0.5 } : {}),
            }}
            whileHover={!hasAnswered ? { scale: 1.03, y: -2 } : undefined}
            whileTap={!hasAnswered ? { scale: 0.96 } : undefined}
            className={cn(
              'no-tap relative flex min-h-[76px] w-full items-center gap-3 rounded-2xl px-4 py-5 text-left font-medium text-white transition-all sm:min-h-[92px]',
              'disabled:cursor-not-allowed',
              !hasAnswered && !showResult && 'hover:brightness-110',
              isSelected && !showResult && 'ring-4 ring-white/80',
              isFaded && 'opacity-30 grayscale',
              isCorrect && 'ring-4 ring-white/90',
              isWrongPick && 'ring-4 ring-black/50',
            )}
            style={{
              backgroundColor: bg,
              boxShadow:
                isSelected && !showResult
                  ? `0 0 0 4px rgba(255,255,255,0.8), 0 8px 32px ${bg}88`
                  : isCorrect
                    ? `0 8px 40px ${bg}aa, 0 0 60px ${bg}44`
                    : `0 8px 24px ${bg}55`,
            }}
          >
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent" />
            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black/25 text-xl backdrop-blur-sm sm:h-13 sm:w-13 sm:text-2xl">
              {shape}
            </span>
            <span className="relative flex-1 text-base font-semibold drop-shadow-sm sm:text-xl">
              {a.text || '—'}
            </span>
            <span
              className={cn(
                'relative rounded-lg px-2 py-0.5 font-mono text-xs font-bold backdrop-blur-sm sm:text-sm',
                isCorrect
                  ? 'bg-green-500/40 text-green-200'
                  : isWrongPick
                    ? 'bg-red-500/40 text-red-200'
                    : 'bg-black/20 text-white/60',
              )}
            >
              {labels[i]}
            </span>
            {isCorrect && (
              <motion.span
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="relative text-2xl"
              >
                ✓
              </motion.span>
            )}
            {isWrongPick && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="relative text-2xl"
              >
                ✗
              </motion.span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
