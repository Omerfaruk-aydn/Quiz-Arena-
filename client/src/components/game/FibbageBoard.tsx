import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import type { QuizSocket } from '../../socket/socketClient';

interface FibbageBoardProps {
  questionText: string;
  answers: Array<{ text: string; color: string }>;
  selectedAnswer: number | null;
  correctAnswer: number | null;
  hasAnswered: boolean;
  showResult: boolean;
  onPick: (index: number) => void;
  socket: QuizSocket | null;
  pin: string | null;
}

type FibbagePhase = 'input' | 'voting' | 'results';

export function FibbageBoard({
  questionText,
  answers,
  correctAnswer,
  hasAnswered,
  showResult,
  onPick,
}: FibbageBoardProps) {
  const [phase] = useState<FibbagePhase>('voting');

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6">
      {/* Question */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-900/20 to-orange-900/20 p-6 text-center"
      >
        <div className="mb-2 text-xs font-medium uppercase tracking-wider text-amber-400">
          🤔 Doğru mu? Yalan mı?
        </div>
        <p className="text-lg font-bold text-white sm:text-xl">
          {questionText}
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Phase 1: Vote for the correct answer among choices */}
        {phase === 'voting' && (
          <motion.div
            key="voting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full space-y-3"
          >
            <p className="text-center text-sm font-medium text-text-muted">
              Hangisi DOĞRU cevap? (Diğerleri oyuncu yalanı)
            </p>
            {answers.map((answer, idx) => {
              const isCorrectPick =
                showResult && correctAnswer === idx;
              const isWrongPick =
                showResult && hasAnswered && correctAnswer !== idx;

              return (
                <motion.button
                  key={idx}
                  type="button"
                  disabled={hasAnswered || showResult}
                  onClick={() => onPick(idx)}
                  whileHover={!hasAnswered ? { scale: 1.02 } : undefined}
                  whileTap={!hasAnswered ? { scale: 0.98 } : undefined}
                  className={cn(
                    'w-full rounded-xl border-2 px-5 py-4 text-left font-medium transition-all',
                    isCorrectPick
                      ? 'border-green-500 bg-green-500/15 text-green-400'
                      : isWrongPick
                        ? 'border-red-500 bg-red-500/15 text-red-400'
                        : 'border-border/50 bg-surface-1 text-text hover:border-primary/50',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-sm">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{answer.text}</span>
                    {isCorrectPick && <span className="ml-auto text-green-400">✓ DOĞRU!</span>}
                    {isWrongPick && <span className="ml-auto text-red-400">✗ YALAN</span>}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
