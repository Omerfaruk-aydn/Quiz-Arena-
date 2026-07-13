import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface MastermindBoardProps {
  answers: Array<{ text: string; color: string }>;
  selectedAnswer: number | null;
  correctAnswer: number | null;
  hasAnswered: boolean;
  showResult: boolean;
  onPick: (index: number) => void;
}

const PEG_COLORS = [
  { name: 'Kırmızı', hex: '#EF4444' },
  { name: 'Mavi', hex: '#3B82F6' },
  { name: 'Yeşil', hex: '#10B981' },
  { name: 'Sarı', hex: '#F59E0B' },
  { name: 'Mor', hex: '#8B5CF6' },
  { name: 'Turuncu', hex: '#F97316' },
];

export function MastermindBoard({
  answers,
  selectedAnswer,
  correctAnswer,
  hasAnswered,
  showResult,
  onPick,
}: MastermindBoardProps) {
  // Generate a code pattern to show
  const [codePattern] = useState<number[]>(() =>
    Array.from({ length: 4 }, () => Math.floor(Math.random() * PEG_COLORS.length)),
  );
  const [revealedCount, setRevealedCount] = useState(1);

  const handlePegClick = useCallback(
    (idx: number) => {
      if (hasAnswered || showResult) return;
      onPick(idx);
      setRevealedCount((prev) => Math.min(prev + 1, codePattern.length));
    },
    [hasAnswered, showResult, onPick, codePattern],
  );

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-8">
      {/* Code Pattern Display */}
      <div className="flex items-center gap-4">
        {codePattern.map((pegIdx, i) => {
          const peg = PEG_COLORS[pegIdx] ?? PEG_COLORS[0];
          const isRevealed = i < revealedCount;

          return (
            <motion.div
              key={i}
              className="flex h-14 w-14 items-center justify-center rounded-full sm:h-16 sm:w-16"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: i * 0.2, type: 'spring', stiffness: 200 }}
              style={{
                backgroundColor: isRevealed ? peg.hex : '#1E293B',
                border: `3px solid ${isRevealed ? peg.hex : '#334155'}`,
                boxShadow: isRevealed
                  ? `0 0 20px ${peg.hex}66`
                  : 'none',
              }}
            >
              {isRevealed ? (
                <span className="text-2xl">
                  {['🔴', '🔵', '🟢', '🟡', '🟣', '🟠'][pegIdx]}
                </span>
              ) : (
                <span className="text-lg text-text-muted">?</span>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="text-center text-sm text-text-muted">
        {revealedCount < codePattern.length
          ? 'Sıradaki renk hangisi olmalı?'
          : 'Kod tamamlandı! Seçimin doğru mu?'}
      </div>

      {/* Answer Pegs */}
      <div className="grid grid-cols-4 gap-4">
        {answers.slice(0, 4).map((answer, idx) => {
          const color = PEG_COLORS[idx] ?? PEG_COLORS[0];
          const isSelected = selectedAnswer === idx;
          const isCorrectPick = showResult && correctAnswer === idx;
          const isWrongPick =
            showResult && selectedAnswer === idx && correctAnswer !== idx;

          return (
            <motion.button
              key={idx}
              type="button"
              disabled={hasAnswered || showResult}
              onClick={() => handlePegClick(idx)}
              whileHover={!hasAnswered ? { scale: 1.1 } : undefined}
              whileTap={!hasAnswered ? { scale: 0.9 } : undefined}
              className={cn(
                'flex h-20 w-20 flex-col items-center justify-center gap-2 rounded-2xl border-2 sm:h-24 sm:w-24',
                isSelected && !showResult && 'ring-4 ring-white/50',
              )}
              style={{
                backgroundColor: isCorrectPick
                  ? '#10B981'
                  : isWrongPick
                    ? '#EF4444'
                    : color.hex + '33',
                borderColor: isCorrectPick
                  ? '#34D399'
                  : isWrongPick
                    ? '#F87171'
                    : isSelected
                      ? '#60A5FA'
                      : `${color.hex}66`,
              }}
            >
              <span className="text-2xl">
                {['🔴', '🔵', '🟢', '🟡'][idx]}
              </span>
              <span className="text-[10px] font-semibold text-white/80">
                {answer.text}
              </span>
              {isCorrectPick && <span className="text-xs">✅</span>}
              {isWrongPick && <span className="text-xs">❌</span>}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
