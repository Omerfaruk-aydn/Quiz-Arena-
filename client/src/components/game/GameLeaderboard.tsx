import { motion } from 'framer-motion';
import { Trophy, Flame } from 'lucide-react';
import type { LeaderboardEntry } from '../../types';
import { cn } from '../../lib/utils';

interface GameLeaderboardProps {
  leaderboard: LeaderboardEntry[];
  myParticipantId?: string;
  isFinal?: boolean;
  onContinue?: () => void;
  continueLabel?: string;
}

const rankStyles = [
  'from-accent-amber to-accent-pink shadow-[0_0_24px_rgba(245,158,11,0.5)]',
  'from-slate-300 to-slate-500 shadow-[0_0_18px_rgba(203,213,225,0.3)]',
  'from-accent-amber/70 to-accent-amber/40',
];

export function GameLeaderboard({
  leaderboard,
  myParticipantId,
  isFinal,
  onContinue,
  continueLabel = 'Sonraki Soru',
}: GameLeaderboardProps) {
  const top = leaderboard.slice(0, 10);
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8">
      <div className="mb-6 text-center">
        <Trophy className="mx-auto mb-2 text-accent-amber" size={36} />
        <h2 className="text-2xl font-bold">{isFinal ? 'Final Sonuçları' : 'Sıralama'}</h2>
      </div>

      <div className="space-y-2">
        {top.map((entry, i) => {
          const isMe = entry.participantId === myParticipantId;
          return (
            <motion.div
              key={entry.participantId}
              initial={{ opacity: 0, x: i % 2 === 0 ? 40 : -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.08, 0.6) }}
              className={cn(
                'flex items-center gap-3 rounded-2xl border p-3 sm:p-4',
                isMe ? 'border-primary bg-primary/10' : 'border-border bg-surface',
              )}
            >
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br font-display font-bold text-white',
                  rankStyles[i] ?? 'from-border to-border',
                )}
              >
                {entry.rank}
              </div>
              <span className="text-2xl">{entry.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {entry.nickname} {isMe && <span className="text-primary">(sen)</span>}
                </p>
                {entry.streak > 1 && (
                  <p className="inline-flex items-center gap-1 text-xs text-accent-amber">
                    <Flame size={12} /> {entry.streak} seri
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="font-display text-lg font-bold">
                  {entry.totalScore.toLocaleString()}
                </p>
                {entry.pointsEarned > 0 && (
                  <p className="text-xs text-correct">+{entry.pointsEarned}</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {onContinue && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={onContinue}
            className="rounded-xl bg-primary px-8 py-3 font-medium text-white shadow-glow transition-all hover:bg-primary/90 active:scale-95 btn-focus"
          >
            {continueLabel}
          </button>
        </div>
      )}
    </div>
  );
}
