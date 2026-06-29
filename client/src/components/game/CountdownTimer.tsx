import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useSound } from '../../hooks/useSound';

interface CountdownTimerProps {
  remaining: number;
  total: number;
  size?: number;
  className?: string;
}

export function CountdownTimer({ remaining, total, size = 120, className }: CountdownTimerProps) {
  const { play } = useSound();
  const lastPlayedRef = useRef(-1);

  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0;
  const offset = circumference * (1 - ratio);
  const isLow = remaining <= 5;
  const isCritical = remaining <= 3;

  const colorClass = isCritical ? '#EF4444' : isLow ? '#F59E0B' : '#7C3AED';

  useEffect(() => {
    if (remaining <= 5 && remaining > 0 && remaining !== lastPlayedRef.current) {
      lastPlayedRef.current = remaining;
      play('tension', 0.5);
    }
    if (remaining > 5) {
      lastPlayedRef.current = -1;
    }
  }, [remaining, play]);

  return (
    <div
      className={cn('relative flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#2A2A3A"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colorClass}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: offset, stroke: colorClass }}
          transition={{ duration: 0.4, ease: 'linear' }}
          style={{ filter: `drop-shadow(0 0 6px ${colorClass})` }}
        />
      </svg>
      <motion.span
        key={remaining}
        initial={{ scale: isCritical ? 1.3 : 1, opacity: 0.5 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className={cn(
          'absolute font-display font-bold',
          isCritical ? 'text-wrong' : isLow ? 'text-accent-amber' : 'text-white',
        )}
        style={{ fontSize: size * 0.32 }}
      >
        {remaining}
      </motion.span>
    </div>
  );
}

export function CountdownStart({
  count: initialCount,
  onDone,
}: {
  count: number;
  onDone?: () => void;
}) {
  const { play } = useSound();
  const [count, setCount] = useState(initialCount);
  const doneRef = useRef(false);

  useEffect(() => {
    if (count > 0) {
      play('countdown', 0.5);
      const t = setTimeout(() => setCount((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
    if (count === 0 && !doneRef.current) {
      doneRef.current = true;
      play('fanfare', 0.7);
      const t = setTimeout(() => onDone?.(), 1000);
      return () => clearTimeout(t);
    }
  }, [count, play, onDone]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
      {count > 0 ? (
        <>
          <motion.div
            key={count}
            initial={{ scale: 0.2, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 14 }}
            className="font-display text-6xl sm:text-8xl md:text-[12rem] font-bold gradient-text leading-none"
          >
            {count}
          </motion.div>
          <p className="text-xl text-text-muted">Hazır olun…</p>
        </>
      ) : (
        <motion.div
          key="go"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.3, 1], opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
          className="text-center"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              filter: [
                'drop-shadow(0 0 20px rgba(124,58,237,0.8))',
                'drop-shadow(0 0 40px rgba(236,72,153,0.9))',
                'drop-shadow(0 0 20px rgba(124,58,237,0.8))',
              ],
            }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="font-display text-5xl sm:text-7xl md:text-[10rem] font-bold gradient-text leading-none"
          >
            BAŞLA!
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
