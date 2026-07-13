import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface MathSprintBoardProps {
  questionText: string;
  answers: Array<{ text: string; color: string }>;
  selectedAnswer: number | null;
  correctAnswer: number | null;
  hasAnswered: boolean;
  showResult: boolean;
  onPick: (index: number) => void;
}

export function MathSprintBoard({
  questionText,
  answers,
  selectedAnswer,
  correctAnswer,
  hasAnswered,
  showResult,
  onPick,
}: MathSprintBoardProps) {
  const [pulseKey, setPulseKey] = useState(0);

  useEffect(() => {
    setPulseKey((k) => k + 1);
  }, [questionText]);

  const formatExpression = (text: string) => {
    return text
      .replace(/\*/g, ' × ')
      .replace(/\//g, ' ÷ ')
      .replace(/sqrt/g, '√')
      .replace(/pi/g, 'π');
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-8">
      {/* Math Expression Display */}
      <motion.div
        key={pulseKey}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 150, damping: 12 }}
        className="relative w-full overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-900/40 via-slate-900 to-purple-900/40 p-8 text-center sm:p-12"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1)_0%,transparent_60%)]" />
        <div className="relative">
          <motion.p
            className="text-4xl font-bold tracking-wider text-white sm:text-6xl"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            {formatExpression(questionText)}
          </motion.p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-4 py-1.5">
            <span className="animate-pulse text-indigo-400">⚡</span>
            <span className="text-xs font-medium text-indigo-300">Zihinden Çöz!</span>
          </div>
        </div>
      </motion.div>

      {/* Answer Options */}
      <div className="grid w-full grid-cols-2 gap-3 sm:gap-4">
        {answers.map((a, idx) => {
          const isSelected = selectedAnswer === idx;
          const isCorrectPick = showResult && correctAnswer === idx;
          const isWrongPick = showResult && selectedAnswer === idx && correctAnswer !== idx;

          return (
            <motion.button
              key={idx}
              type="button"
              disabled={hasAnswered || showResult}
              onClick={() => onPick(idx)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: isCorrectPick ? 1.08 : isWrongPick ? 0.95 : 1,
              }}
              transition={{ delay: idx * 0.1, type: 'spring', stiffness: 200 }}
              whileHover={!hasAnswered ? { scale: 1.05, y: -2 } : undefined}
              whileTap={!hasAnswered ? { scale: 0.93 } : undefined}
              className={cn(
                'relative overflow-hidden rounded-2xl border-2 px-6 py-5 text-center transition-all sm:py-7',
                isSelected && !showResult && 'ring-4 ring-indigo-400/60',
                isCorrectPick && 'border-green-400 bg-green-500/20',
                isWrongPick && 'border-red-400 bg-red-500/20',
                !showResult && !isSelected && 'border-indigo-500/30 bg-slate-800/50 hover:border-indigo-400/50',
              )}
            >
              <span
                className={cn(
                  'text-3xl font-bold sm:text-4xl',
                  isCorrectPick
                    ? 'text-green-300'
                    : isWrongPick
                      ? 'text-red-300'
                      : 'text-white',
                )}
              >
                {a.text}
              </span>
              {isCorrectPick && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute right-2 top-2 text-lg"
                >
                  ✅
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Score multiplier hint */}
      {!hasAnswered && !showResult && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-indigo-400/60"
        >
          Hızlı cevapla, daha çok puan kazan! ⚡
        </motion.p>
      )}
    </div>
  );
}
