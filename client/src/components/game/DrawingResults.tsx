import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DrawingResult {
  participantId: string;
  nickname: string;
  emoji: string;
  score: number;
  feedback: string;
  image: string | null;
}

interface DrawingResultsProps {
  target: string;
  results: DrawingResult[];
}

export function DrawingResults({ target, results }: DrawingResultsProps) {
  const sorted = [...results].sort((a, b) => b.score - a.score);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <div className="glass p-4 text-center mb-4">
        <p className="text-sm text-text-muted">Hedef kelime</p>
        <h3 className="text-2xl font-bold text-primary">{target.toUpperCase()}</h3>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {sorted.map((r, idx) => (
            <motion.div
              key={r.participantId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15 }}
              className={cn(
                'glass flex flex-col gap-3 p-4 sm:flex-row sm:items-center',
                idx === 0 && 'border border-yellow-500/40 shadow-[0_0_15px_rgba(234,179,8,0.15)]',
                idx === 1 && 'border border-gray-400/30',
                idx === 2 && 'border border-orange-400/30',
              )}
            >
              {r.image && (
                <div className="shrink-0">
                  <img
                    src={r.image}
                    alt={`${r.nickname} çizimi`}
                    className="h-32 w-32 rounded-lg border border-border object-cover"
                  />
                </div>
              )}
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  {idx === 0 && <Trophy size={16} className="text-yellow-500" />}
                  {idx === 1 && <Medal size={16} className="text-gray-400" />}
                  {idx === 2 && <Medal size={16} className="text-orange-400" />}
                  <span className="font-semibold text-text">
                    {r.emoji} {r.nickname}
                  </span>
                  <span className="ml-auto text-xs text-text-muted">#{idx + 1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${r.score}%` }}
                      transition={{ delay: idx * 0.15 + 0.3, duration: 0.6, ease: 'easeOut' }}
                      className={cn(
                        'h-full rounded-full',
                        r.score >= 80
                          ? 'bg-green-500'
                          : r.score >= 50
                            ? 'bg-yellow-500'
                            : 'bg-red-500',
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      'text-lg font-bold tabular-nums',
                      r.score >= 80
                        ? 'text-green-400'
                        : r.score >= 50
                          ? 'text-yellow-400'
                          : 'text-red-400',
                    )}
                  >
                    %{r.score}
                  </span>
                </div>
                <p className="text-xs text-text-muted">{r.feedback}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
