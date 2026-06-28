import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import type { ANSWER_COLORS } from '../../types';

interface AnswerOptionProps {
  index: number;
  text: string;
  color: keyof typeof ANSWER_COLORS;
  shape: string;
  isCorrect?: boolean;
  isWrong?: boolean;
  selected?: boolean;
  disabled?: boolean;
  showResult?: boolean;
  onClick?: () => void;
}

const colorClasses: Record<keyof typeof ANSWER_COLORS, string> = {
  red: 'bg-wrong hover:bg-wrong/90 shadow-[0_8px_24px_rgba(239,68,68,0.35)]',
  blue: 'bg-accent-blue hover:bg-accent-blue/90 shadow-[0_8px_24px_rgba(59,130,246,0.35)]',
  yellow: 'bg-accent-amber hover:bg-accent-amber/90 shadow-[0_8px_24px_rgba(245,158,11,0.35)]',
  green: 'bg-accent-emerald hover:bg-accent-emerald/90 shadow-[0_8px_24px_rgba(16,185,129,0.35)]',
};

export function AnswerOption({
  index,
  text,
  color,
  shape,
  isCorrect,
  isWrong,
  selected,
  disabled,
  showResult,
  onClick,
}: AnswerOptionProps) {
  const labels = ['A', 'B', 'C', 'D'];
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.03 } : undefined}
      whileTap={!disabled ? { scale: 0.97 } : undefined}
      animate={
        showResult && isCorrect
          ? { scale: [1, 1.08, 1] }
          : showResult && isWrong
            ? { scale: [1, 0.95, 1] }
            : { scale: 1 }
      }
      className={cn(
        'no-tap relative flex min-h-[64px] w-full items-center gap-3 rounded-2xl px-4 py-4 text-left text-white font-medium transition-all',
        'disabled:cursor-not-allowed',
        colorClasses[color],
        selected && !showResult && 'ring-4 ring-white/40',
        showResult && !isCorrect && !selected && 'opacity-40 grayscale',
        showResult && isWrong && 'ring-4 ring-black/30',
        showResult && isCorrect && 'ring-4 ring-white/60',
      )}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black/20 text-lg">
        {shape}
      </span>
      <span className="flex-1 text-base sm:text-lg">{text}</span>
      <span className="font-mono text-xs opacity-70">{labels[index]}</span>
    </motion.button>
  );
}
