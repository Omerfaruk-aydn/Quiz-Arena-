import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Share2,
  Home,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Star,
  Target,
  Zap,
} from 'lucide-react';
import type { FinalLeaderboardEntry } from '../../types';
import { PlayerPodium } from './PlayerPodium';
import { ConfettiCanvas } from './ConfettiCanvas';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface GameResultsProps {
  leaderboard: FinalLeaderboardEntry[];
  myParticipantId?: string;
  pin: string;
  onPlayAgain?: () => void;
  onHome?: () => void;
}

function AnimatedScore({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [score, setScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(target * eased);
      setScore(start);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);

  return <span>{score.toLocaleString()}</span>;
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Star;
  label: string;
  value: React.ReactNode;
  color: string;
}) {
  return (
    <div className={cn('glass-2 flex flex-col items-center gap-1 rounded-2xl p-3 sm:p-4', color)}>
      <Icon size={20} className="text-text-muted" />
      <p className="font-display text-xl sm:text-2xl font-bold">{value}</p>
      <p className="text-[10px] sm:text-xs text-text-muted uppercase tracking-wider">{label}</p>
    </div>
  );
}

export function GameResults({
  leaderboard,
  myParticipantId,
  pin,
  onPlayAgain,
  onHome,
}: GameResultsProps) {
  const [showAll, setShowAll] = useState(false);
  const [showPodium, setShowPodium] = useState(false);
  const [showList, setShowList] = useState(false);

  const me = leaderboard.find((e) => e.participantId === myParticipantId);
  const winner = leaderboard[0];
  const visibleList = showAll ? leaderboard : leaderboard.slice(0, 5);

  useEffect(() => {
    const t1 = setTimeout(() => setShowPodium(true), 600);
    const t2 = setTimeout(() => setShowList(true), 1800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const rankBadge = (rank: number) => {
    if (rank === 1)
      return 'bg-gradient-to-br from-accent-amber to-accent-pink text-white shadow-[0_0_12px_rgba(245,158,11,0.5)]';
    if (rank === 2) return 'bg-gradient-to-br from-slate-300 to-slate-500 text-white';
    if (rank === 3) return 'bg-gradient-to-br from-amber-700 to-amber-900 text-white';
    return 'bg-surface-2 text-text-muted';
  };

  return (
    <div className="relative flex min-h-screen flex-1 flex-col overflow-y-auto px-4 py-6 sm:py-10">
      <ConfettiCanvas active duration={5000} />

      <div className="relative z-10 mx-auto w-full max-w-3xl space-y-6 sm:space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <Trophy className="mx-auto mb-3 text-accent-amber" size={56} fill="currentColor" />
          </motion.div>
          <h1 className="text-3xl sm:text-5xl font-bold gradient-text font-display">Oyun Bitti!</h1>
          {winner && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-2 text-base sm:text-lg text-text-muted"
            >
              Şampiyon: <span className="font-bold text-accent-amber">{winner.nickname}</span>
            </motion.p>
          )}
        </motion.div>

        {me && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-4 sm:p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{me.emoji}</span>
                <div>
                  <p className="font-semibold text-white">{me.nickname}</p>
                  <p className="text-xs text-text-muted">Senin Sonucun</p>
                </div>
              </div>
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl font-display font-bold text-sm',
                  rankBadge(me.rank),
                )}
              >
                #{me.rank}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <StatCard
                icon={Star}
                label="Skor"
                value={<AnimatedScore target={me.totalScore} />}
                color=""
              />
              <StatCard icon={Target} label="Doğru" value={`${me.correctAnswers}`} color="" />
              <StatCard
                icon={Zap}
                label="Sıralama"
                value={`${me.rank}/${leaderboard.length}`}
                color=""
              />
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {showPodium && leaderboard.length >= 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              <PlayerPodium leaderboard={leaderboard} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showList && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="glass overflow-hidden rounded-2xl"
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider">
                  Tüm Sıralama
                </h3>
                <span className="text-xs text-text-muted">{leaderboard.length} oyuncu</span>
              </div>

              <div className="divide-y divide-border/50">
                {visibleList.map((e, i) => {
                  const isMe = e.participantId === myParticipantId;
                  return (
                    <motion.div
                      key={e.participantId}
                      initial={{ opacity: 0, x: i % 2 === 0 ? 30 : -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.3 }}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 transition-colors',
                        isMe ? 'bg-primary/10' : 'hover:bg-surface-2/50',
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-display text-sm font-bold',
                          rankBadge(e.rank),
                        )}
                      >
                        {e.rank}
                      </div>
                      <span className="text-xl sm:text-2xl">{e.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {e.nickname}
                          {isMe && (
                            <span className="ml-1.5 text-xs font-bold text-primary">(sen)</span>
                          )}
                        </p>
                        <p className="text-xs text-text-muted">{e.correctAnswers} doğru</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-sm sm:text-base font-bold">
                          {e.totalScore.toLocaleString()}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {leaderboard.length > 5 && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="flex w-full items-center justify-center gap-1 border-t border-border py-2.5 text-xs font-medium text-text-muted hover:text-white transition-colors"
                >
                  {showAll ? (
                    <>
                      Daha az göster <ChevronUp size={14} />
                    </>
                  ) : (
                    <>
                      Tümünü göster ({leaderboard.length - 5} daha) <ChevronDown size={14} />
                    </>
                  )}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
          className="flex flex-wrap justify-center gap-3 pt-2 pb-4"
        >
          <Button variant="secondary" onClick={() => void navigator.clipboard?.writeText(pin)}>
            <Share2 size={16} /> PIN'i kopyala
          </Button>
          {onPlayAgain && (
            <Button onClick={onPlayAgain}>
              <RotateCcw size={16} /> Tekrar Oyna
            </Button>
          )}
          <Button variant="ghost" onClick={onHome}>
            <Home size={16} /> Ana Sayfa
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
