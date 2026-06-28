import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface CountdownTimerProps {
  remaining: number;
  total: number;
  size?: number;
  className?: string;
}

export function CountdownTimer({ remaining, total, size = 120, className }: CountdownTimerProps) {
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0;
  const offset = circumference * (1 - ratio);
  const isLow = remaining <= 5;
  const isCritical = remaining <= 3;

  const colorClass = isCritical ? '#EF4444' : isLow ? '#F59E0B' : '#7C3AED';

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

export function CountdownStart({ count, onDone }: { count: number; onDone?: () => void }) {
  const ref = useRef(onDone);
  ref.current = onDone;
  useEffect(() => {
    const t = setTimeout(() => ref.current?.(), 1000);
    return () => clearTimeout(t);
  }, [count]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
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
    </div>
  );
}
