import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MemoryMatchBoardProps {
  answers: Array<{ text: string; color: string }>;
  selectedAnswer: number | null;
  correctAnswer: number | null;
  hasAnswered: boolean;
  showResult: boolean;
  onPick: (index: number) => void;
}

const GRID_CONFIGS: Record<string, { cols: number; total: number }> = {
  '3': { cols: 3, total: 6 },
  '4': { cols: 4, total: 8 },
  '5': { cols: 5, total: 10 },
  '6': { cols: 6, total: 12 },
};

export function MemoryMatchBoard({
  answers,
  selectedAnswer,
  correctAnswer,
  hasAnswered,
  showResult,
  onPick,
}: MemoryMatchBoardProps) {
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  const gridConfig = GRID_CONFIGS['4'] ?? { cols: 4, total: 8 };

  useEffect(() => {
    setFlipped({});
  }, [answers]);

  const handleCardClick = useCallback(
    (idx: number) => {
      if (hasAnswered || showResult || flipped[idx]) return;
      setFlipped((prev) => ({ ...prev, [idx]: true }));
      onPick(idx);
    },
    [hasAnswered, showResult, flipped, onPick],
  );

  const cardColors = [
    '#EF4444', '#3B82F6', '#10B981', '#F59E0B',
    '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
    '#6366F1', '#84CC16',
  ];

  const visibleAnswers = answers.slice(0, gridConfig.total);

  return (
    <div
      className="mx-auto grid w-full max-w-3xl gap-3"
      style={{ gridTemplateColumns: `repeat(${gridConfig.cols}, 1fr)` }}
    >
      {visibleAnswers.map((answer, idx) => {
        const isFlipped = flipped[idx] || showResult;
        const isCorrectPick = showResult && correctAnswer === idx;
        const isWrongPick =
          showResult && selectedAnswer === idx && correctAnswer !== idx;

        return (
          <motion.button
            key={idx}
            type="button"
            disabled={hasAnswered || showResult}
            onClick={() => handleCardClick(idx)}
            whileHover={!hasAnswered ? { scale: 1.05 } : undefined}
            whileTap={!hasAnswered ? { scale: 0.95 } : undefined}
            className="relative aspect-[3/4] w-full perspective-1000"
          >
            <motion.div
              className="relative h-full w-full"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Card Back */}
              <div
                className="absolute inset-0 flex items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: cardColors[idx % cardColors.length],
                  backfaceVisibility: 'hidden',
                }}
              >
                <span className="text-4xl font-bold text-white/80">?</span>
                <div className="absolute inset-0 rounded-2xl border-2 border-white/20" />
              </div>

              {/* Card Front */}
              <div
                className="absolute inset-0 flex items-center justify-center rounded-2xl p-2"
                style={{
                  backgroundColor: isCorrectPick
                    ? '#10B981'
                    : isWrongPick
                      ? '#EF4444'
                      : '#1E293B',
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  border: isCorrectPick
                    ? '2px solid #34D399'
                    : isWrongPick
                      ? '2px solid #F87171'
                      : '2px solid #334155',
                }}
              >
                <span className="text-center text-sm font-semibold leading-tight text-white">
                  {answer.text}
                </span>
              </div>
            </motion.div>

            {/* Result indicators */}
            {isCorrectPick && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-xs text-white shadow-lg"
              >
                ✓
              </motion.div>
            )}
            {isWrongPick && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white shadow-lg"
              >
                ✗
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
