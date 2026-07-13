import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface SortEventsBoardProps {
  questionText: string;
  answers: Array<{ text: string; color: string }>;
  selectedAnswer: number | null;
  correctAnswer: number | null;
  hasAnswered: boolean;
  showResult: boolean;
  onPick: (index: number) => void;
}

export function SortEventsBoard({
  questionText,
  answers,
  selectedAnswer,
  correctAnswer,
  hasAnswered,
  showResult,
  onPick,
}: SortEventsBoardProps) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6">
      {/* Question */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-900/20 to-indigo-900/20 p-5 text-center"
      >
        <div className="mb-2 text-xs font-medium uppercase tracking-wider text-blue-400">
          📅 Tarih Sıralama
        </div>
        <p className="text-lg font-bold text-white sm:text-xl">{questionText}</p>
      </motion.div>

      {/* Timeline */}
      <div className="relative w-full">
        <div className="absolute left-6 top-0 h-full w-0.5 bg-gradient-to-b from-blue-500/50 via-blue-400/30 to-blue-500/50" />

        <div className="space-y-4">
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
                initial={{ opacity: 0, x: -20 }}
                animate={{
                  opacity: 1, x: 0,
                  scale: isCorrectPick ? [1, 1.03, 1] : isWrongPick ? [1, 0.97, 1] : 1,
                }}
                transition={{ delay: idx * 0.1, type: 'spring', stiffness: 200 }}
                whileHover={!hasAnswered ? { x: 4 } : undefined}
                className={cn(
                  'relative ml-12 flex items-center gap-4 rounded-xl border-2 px-5 py-4 text-left transition-all',
                  isSelected && !showResult && 'ring-4 ring-blue-400/50',
                  isCorrectPick && 'border-green-400 bg-green-500/15',
                  isWrongPick && 'border-red-400 bg-red-500/15',
                  !showResult && !isSelected && 'border-blue-900/40 bg-slate-800/50 hover:border-blue-500/50',
                )}
              >
                {/* Timeline dot */}
                <div
                  className={cn(
                    'absolute -left-8 h-4 w-4 rounded-full border-2',
                    isCorrectPick
                      ? 'border-green-400 bg-green-400'
                      : isWrongPick
                        ? 'border-red-400 bg-red-400'
                        : 'border-blue-400 bg-blue-900',
                  )}
                />

                {/* Index badge */}
                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold',
                    isCorrectPick ? 'bg-green-500 text-white' : 'bg-blue-500/20 text-blue-300',
                  )}
                >
                  {idx + 1}
                </span>

                {/* Event text */}
                <span
                  className={cn(
                    'text-sm font-medium leading-snug sm:text-base',
                    isCorrectPick ? 'text-green-200' : isWrongPick ? 'text-red-200' : 'text-text',
                  )}
                >
                  {a.text}
                </span>

                {isCorrectPick && <span className="ml-auto text-green-400">✓</span>}
                {isWrongPick && <span className="ml-auto text-red-400">✗</span>}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
