import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface MillionaireBoardProps {
  questionText: string;
  answers: Array<{ text: string; color: string }>;
  selectedAnswer: number | null;
  correctAnswer: number | null;
  hasAnswered: boolean;
  showResult: boolean;
  onPick: (index: number) => void;
  fiftyFiftyRemoved?: number[];
}

const labels = ['A', 'B', 'C', 'D'];

export function MillionaireBoard({
  questionText,
  answers,
  selectedAnswer,
  correctAnswer,
  hasAnswered,
  showResult,
  onPick,
  fiftyFiftyRemoved = [],
}: MillionaireBoardProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const handlePick = useCallback(
    (idx: number) => {
      if (hasAnswered || showResult) return;
      onPick(idx);
    },
    [hasAnswered, showResult, onPick],
  );

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-8">
      {/* Question Area */}
      <div className="flex w-full flex-1 flex-col gap-6">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-900/10 to-amber-950/20 p-6 text-center"
        >
          <div className="mb-2 flex items-center justify-center gap-2 text-xs text-amber-400/60">
            <span>💰</span>
            <span>KİM MİLYONER OLMAK İSTER?</span>
            <span>💰</span>
          </div>
          <p className="text-xl font-bold text-white sm:text-2xl">{questionText}</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {answers.map((a, idx) => {
            const isRemoved = fiftyFiftyRemoved.includes(idx) && !showResult;
            const isSelected = selectedAnswer === idx;
            const isCorrectPick = showResult && correctAnswer === idx;
            const isWrongPick = showResult && selectedAnswer === idx && correctAnswer !== idx;
            const isHovered = hoveredIdx === idx;

            if (isRemoved) return null;

            return (
              <motion.button
                key={idx}
                type="button"
                disabled={hasAnswered || showResult}
                onClick={() => handlePick(idx)}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                animate={{
                  opacity: 1, x: 0,
                  scale: isCorrectPick ? [1, 1.05, 1] : isWrongPick ? [1, 0.95, 1] : 1,
                }}
                transition={{ delay: idx * 0.12, type: 'spring', stiffness: 200 }}
                whileHover={!hasAnswered ? { scale: 1.03 } : undefined}
                whileTap={!hasAnswered ? { scale: 0.96 } : undefined}
                className={cn(
                  'relative overflow-hidden rounded-2xl border-2 px-5 py-4 text-left transition-all sm:py-5',
                  isSelected && !showResult && 'ring-4 ring-amber-400/60',
                  isCorrectPick && 'border-green-400 bg-green-500/20',
                  isWrongPick && 'border-red-400 bg-red-500/20 ring-4 ring-red-400/40',
                  !showResult && !isSelected && [
                    'bg-gradient-to-r from-slate-800 to-slate-800/80',
                    isHovered ? 'border-amber-400/40' : 'border-amber-900/30',
                  ],
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-bold text-sm',
                      isCorrectPick ? 'bg-green-500 text-white' : 'bg-amber-500/20 text-amber-300',
                    )}
                  >
                    {labels[idx]}
                  </span>
                  <span
                    className={cn(
                      'font-medium',
                      isCorrectPick ? 'text-green-200' : isWrongPick ? 'text-red-200' : 'text-white',
                    )}
                  >
                    {a.text}
                  </span>
                </div>
                {isCorrectPick && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xl"
                  >
                    ✅
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
