import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { Crown, Medal, Award } from 'lucide-react';
import type { FinalLeaderboardEntry } from '../../types';

interface PlayerPodiumProps {
  leaderboard: FinalLeaderboardEntry[];
}

const podiumConfig = [
  {
    pos: 2,
    height: 'h-24 sm:h-28',
    icon: Medal,
    glow: 'shadow-[0_0_30px_rgba(148,163,184,0.4)]',
    gradient: 'from-slate-400 to-slate-600',
    ring: 'ring-slate-400/50',
    order: 0,
  },
  {
    pos: 1,
    height: 'h-32 sm:h-40',
    icon: Crown,
    glow: 'shadow-[0_0_40px_rgba(245,158,11,0.6)]',
    gradient: 'from-accent-amber via-yellow-400 to-accent-pink',
    ring: 'ring-accent-amber/50',
    order: 1,
  },
  {
    pos: 3,
    height: 'h-20 sm:h-24',
    icon: Award,
    glow: 'shadow-[0_0_24px_rgba(217,119,6,0.3)]',
    gradient: 'from-amber-700 to-amber-900',
    ring: 'ring-amber-700/50',
    order: 2,
  },
];

export function PlayerPodium({ leaderboard }: PlayerPodiumProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const top3 = [leaderboard[1], leaderboard[0], leaderboard[2]].filter(Boolean);

  useEffect(() => {
    if (!containerRef.current || top3.length === 0) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'back.out(1.7)' } });
      tl.from('.podium-bar', { scaleY: 0, transformOrigin: 'bottom', duration: 0.6, stagger: 0.15 })
        .from('.podium-avatar', { scale: 0, opacity: 0, duration: 0.5, stagger: 0.12 }, '-=0.3')
        .from('.podium-name', { opacity: 0, y: 10, duration: 0.3, stagger: 0.08 }, '-=0.2')
        .from('.podium-score', { opacity: 0, scale: 0.5, duration: 0.4, stagger: 0.08 }, '-=0.2')
        .from(
          '.podium-crown',
          { scale: 0, rotation: -180, duration: 0.5, ease: 'elastic.out(1, 0.5)' },
          '-=0.3',
        );
    }, containerRef);
    return () => ctx.revert();
  }, [top3.length]);

  return (
    <div ref={containerRef} className="flex items-end justify-center gap-3 sm:gap-5 px-4">
      {podiumConfig.map((cfg, i) => {
        const entry = top3[i];
        if (!entry) return <div key={cfg.pos} className="w-20 sm:w-28" />;
        const isFirst = cfg.pos === 1;
        const Icon = cfg.icon;

        return (
          <div
            key={entry.participantId}
            className="flex flex-col items-center"
            style={{ order: cfg.order }}
          >
            {isFirst && (
              <div className="podium-crown mb-1">
                <Icon className="text-accent-amber animate-float" size={36} fill="currentColor" />
              </div>
            )}

            <motion.div
              className="podium-avatar flex flex-col items-center"
              whileHover={{ scale: 1.05 }}
            >
              <div
                className={`flex items-center justify-center rounded-2xl bg-gradient-to-br ${cfg.gradient} ${cfg.glow} ring-2 ${cfg.ring} ${
                  isFirst
                    ? 'h-20 w-20 sm:h-24 sm:w-24 text-5xl'
                    : 'h-14 w-14 sm:h-16 sm:w-16 text-3xl'
                }`}
              >
                {entry.emoji}
              </div>
            </motion.div>

            <p className="podium-name mt-2 max-w-[90px] sm:max-w-[110px] truncate text-center text-xs sm:text-sm font-semibold">
              {entry.nickname}
            </p>
            <p className="podium-score font-display text-sm sm:text-lg font-bold text-white">
              {entry.totalScore.toLocaleString()}
            </p>

            <div
              className={`podium-bar mt-2 w-20 sm:w-28 ${cfg.height} rounded-t-2xl bg-gradient-to-t ${cfg.gradient} flex items-start justify-center pt-3 font-display text-2xl sm:text-3xl font-bold text-white/90`}
            >
              {cfg.pos}
            </div>
          </div>
        );
      })}
    </div>
  );
}
