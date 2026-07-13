import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface PictionaryBoardProps {
  questionText: string;
  answers: Array<{ text: string; color: string }>;
  selectedAnswer: number | null;
  correctAnswer: number | null;
  hasAnswered: boolean;
  showResult: boolean;
  onPick: (index: number) => void;
}

const SYMBOLS = ['△', '○', '□', '☆', '◇', '⏣', '⎔', '⬡'];

export function PictionaryBoard({
  questionText,
  answers,
  selectedAnswer,
  correctAnswer,
  hasAnswered,
  showResult,
  onPick,
}: PictionaryBoardProps) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6">
      {/* Drawing/Symbol Display */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 12 }}
        className="relative w-full overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-900/20 via-slate-900 to-teal-900/20 p-10 text-center sm:p-16"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.08)_0%,transparent_60%)]" />
        <div className="relative flex flex-col items-center gap-4">
          {/* Doodle line decoration */}
          <div className="absolute left-4 top-4 text-4xl text-emerald-500/10 select-none">
            {SYMBOLS.slice(0, 3).join(' ')}
          </div>
          <div className="absolute right-4 bottom-4 text-4xl text-emerald-500/10 select-none">
            {SYMBOLS.slice(3, 6).join(' ')}
          </div>

          {/* Question text as a "drawing description" */}
          <p className="text-xl font-bold leading-relaxed text-white sm:text-2xl">
            {questionText}
          </p>
          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-4 py-1.5">
            <span className="text-emerald-400">🎨</span>
            <span className="text-xs font-medium text-emerald-300">
              Bu çizim/sembol neyi temsil ediyor?
            </span>
          </div>
        </div>
      </motion.div>

      {/* Answer Options */}
      <div className="grid w-full gap-3 sm:grid-cols-2">
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, type: 'spring', stiffness: 200 }}
              whileHover={!hasAnswered ? { scale: 1.03 } : undefined}
              whileTap={!hasAnswered ? { scale: 0.96 } : undefined}
              className={cn(
                'group relative overflow-hidden rounded-2xl border-2 px-5 py-4 text-left transition-all',
                isSelected && !showResult && 'ring-4 ring-emerald-400/50',
                isCorrectPick && 'border-green-400 bg-green-500/15',
                isWrongPick && 'border-red-400 bg-red-500/15',
                !showResult && !isSelected && 'border-emerald-900/40 bg-slate-800/50 hover:border-emerald-500/50',
              )}
            >
              <span
                className={cn(
                  'font-semibold',
                  isCorrectPick
                    ? 'text-green-200'
                    : isWrongPick
                      ? 'text-red-200'
                      : 'text-text',
                )}
              >
                {a.text}
              </span>
              {isCorrectPick && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lg">✅</span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
