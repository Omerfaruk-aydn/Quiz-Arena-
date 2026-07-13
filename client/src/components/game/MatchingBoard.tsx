import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface MatchingBoardProps {
  questionText: string;
  answers: Array<{ text: string; color: string }>;
  selectedAnswer: number | null;
  correctAnswer: number | null;
  hasAnswered: boolean;
  showResult: boolean;
  onPick: (index: number) => void;
}

const LEFT_ITEMS = ['🏛️', '🔬', '📖', '🎭', '⚽', '🎨'];
const RIGHT_ITEMS = ['Tarih', 'Bilim', 'Edebiyat', 'Tiyatro', 'Spor', 'Sanat'];

export function MatchingBoard({
  questionText,
  answers,
  selectedAnswer,
  correctAnswer,
  hasAnswered,
  showResult,
  onPick,
}: MatchingBoardProps) {
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Record<number, number>>({});

  const handleItemClick = useCallback(
    (idx: number) => {
      if (hasAnswered || showResult) return;

      if (selectedItem === null) {
        setSelectedItem(idx);
      } else {
        // Player selected a pair — submit this as their answer
        onPick(idx);
        setMatchedPairs((prev) => ({ ...prev, [selectedItem]: idx }));
        setSelectedItem(null);
      }
    },
    [hasAnswered, showResult, selectedItem, onPick],
  );

  const displayItems = answers.slice(0, 4).map((a, i) => ({
    left: a.text,
    right: LEFT_ITEMS[i] ?? '📦',
  }));

  return (
    <div className="mx-auto w-full max-w-2xl space-y-3">
      <p className="text-center text-sm text-text-muted">
        Sol sütundan bir öğe seç, ardından sağ sütundan eşleştir
      </p>

      <div className="flex items-start gap-6">
        {/* Left Column */}
        <div className="flex flex-1 flex-col gap-3">
          {displayItems.map((item, idx) => {
            const i = idx;
            const isSelected = selectedItem === i;
            const isMatched = matchedPairs[i] !== undefined;
            const isCorrectPick =
              showResult && correctAnswer === i && selectedAnswer === i;
            const isWrongPick =
              showResult && selectedAnswer === i && correctAnswer !== i;

            return (
              <motion.button
                key={`left-${i}`}
                type="button"
                disabled={hasAnswered || showResult}
                onClick={() => handleItemClick(i)}
                whileHover={!hasAnswered ? { scale: 1.03 } : undefined}
                whileTap={!hasAnswered ? { scale: 0.97 } : undefined}
                className={cn(
                  'rounded-xl border-2 px-4 py-3 text-left font-medium transition-all',
                  isSelected
                    ? 'border-primary bg-primary/15 text-white'
                    : isCorrectPick
                      ? 'border-green-500 bg-green-500/15 text-green-400'
                      : isWrongPick
                        ? 'border-red-500 bg-red-500/15 text-red-400'
                        : 'border-border/50 bg-surface-1 text-text hover:border-border',
                )}
              >
                <span className="text-sm">{item.left}</span>
                {isCorrectPick && <span className="ml-2 text-xs">✓</span>}
                {isWrongPick && <span className="ml-2 text-xs">✗</span>}
              </motion.button>
            );
          })}
        </div>

        {/* Right Column */}
        <div className="flex flex-1 flex-col gap-3">
          {displayItems.map((item, idx) => {
            const isPaired = Object.values(matchedPairs).includes(idx);
            const isCorrectPick =
              showResult && correctAnswer === idx && selectedAnswer === idx;
            const isWrongPick =
              showResult && selectedAnswer === idx && correctAnswer !== idx;

            return (
              <motion.div
                key={`right-${idx}`}
                className={cn(
                  'flex items-center justify-center rounded-xl border-2 px-4 py-3 text-center',
                  isPaired && !showResult
                    ? 'border-primary/50 bg-primary/10'
                    : isCorrectPick
                      ? 'border-green-500 bg-green-500/15'
                      : isWrongPick
                        ? 'border-red-500 bg-red-500/15'
                        : 'border-border/30 bg-surface-1/50',
                )}
              >
                <span className="text-lg">{item.right}</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Feedback */}
      {hasAnswered && !showResult && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-amber-400"
        >
          Eşleştirme yapıldı! <span className="animate-pulse">⏳</span>
        </motion.p>
      )}
    </div>
  );
}
