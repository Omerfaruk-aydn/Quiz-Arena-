import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface MemeWarCardProps {
  questionText: string;
  answers: Array<{ text: string; color: string }>;
  selectedAnswer: number | null;
  correctAnswer: number | null;
  hasAnswered: boolean;
  showResult: boolean;
  onPick: (index: number) => void;
  fiftyFiftyRemoved?: number[];
}

export function MemeWarCard({
  questionText,
  answers,
  selectedAnswer,
  correctAnswer,
  hasAnswered,
  showResult,
  onPick,
  fiftyFiftyRemoved = [],
}: MemeWarCardProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const handlePick = useCallback(
    (idx: number) => {
      if (hasAnswered || showResult) return;
      onPick(idx);
    },
    [hasAnswered, showResult, onPick],
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6">
      {/* Scene/Meme display */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-slate-800 to-slate-900 p-8 sm:p-12"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05)_0%,transparent_50%)]" />
        <p className="relative text-center text-lg font-bold leading-relaxed text-white sm:text-2xl">
          {questionText}
        </p>
        <div className="relative mt-4 flex justify-center gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-text-muted">
            🎭 En iyi altyazıyı seç!
          </span>
        </div>
      </motion.div>

      {/* Caption Options */}
      <div className="grid w-full gap-3 sm:grid-cols-2">
        {answers.map((answer, idx) => {
          const isRemoved = fiftyFiftyRemoved.includes(idx);
          const isSelected = selectedAnswer === idx;
          const isCorrectPick = showResult && correctAnswer === idx;
          const isWrongPick =
            showResult && selectedAnswer === idx && correctAnswer !== idx;
          const isHovered = hoveredIdx === idx;

          if (isRemoved && !showResult) return null;

          return (
            <motion.button
              key={idx}
              type="button"
              disabled={hasAnswered || showResult || isRemoved}
              onClick={() => handlePick(idx)}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              whileHover={!hasAnswered ? { scale: 1.03 } : undefined}
              whileTap={!hasAnswered ? { scale: 0.97 } : undefined}
              className={cn(
                'group relative overflow-hidden rounded-xl border-2 px-5 py-4 text-left transition-all',
                isSelected && !showResult && 'ring-4 ring-primary/50',
                isRemoved && !showResult && 'hidden',
              )}
              style={{
                backgroundColor: isCorrectPick
                  ? '#10B98122'
                  : isWrongPick
                    ? '#EF444422'
                    : isSelected
                      ? '#3B82F622'
                      : '#1E293B',
                borderColor: isCorrectPick
                  ? '#34D399'
                  : isWrongPick
                    ? '#F87171'
                    : isSelected
                      ? '#60A5FA'
                      : isHovered && !hasAnswered
                        ? '#475569'
                        : '#334155',
              }}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold',
                    isCorrectPick
                      ? 'bg-green-500/30 text-green-400'
                      : isWrongPick
                        ? 'bg-red-500/30 text-red-400'
                        : 'bg-white/10 text-text-muted',
                  )}
                >
                  {idx + 1}
                </span>
                <span
                  className={cn(
                    'pt-1 text-sm font-medium leading-snug sm:text-base',
                    isCorrectPick
                      ? 'text-green-300'
                      : isWrongPick
                        ? 'text-red-300'
                        : 'text-text',
                  )}
                >
                  {answer.text}
                </span>
              </div>

              {/* Result overlay */}
              {isCorrectPick && (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="absolute right-2 top-2 rounded-full bg-green-500 px-2 py-0.5 text-xs font-bold text-white"
                >
                  ✓ En İyi Altyazı
                </motion.div>
              )}
              {isWrongPick && showResult && (
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="absolute right-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white"
                >
                  ✗
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
