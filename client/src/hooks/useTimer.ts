import { useEffect, useRef, useState } from 'react';

interface UseTimerOptions {
  duration: number;
  remaining?: number;
  autoStart?: boolean;
  onEnd?: () => void;
  onTick?: (remaining: number) => void;
}

export function useTimer({
  duration,
  remaining,
  autoStart = true,
  onEnd,
  onTick,
}: UseTimerOptions) {
  const [timeLeft, setTimeLeft] = useState(remaining ?? duration);
  const startRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const onEndRef = useRef(onEnd);
  const onTickRef = useRef(onTick);

  useEffect(() => {
    onEndRef.current = onEnd;
    onTickRef.current = onTick;
  }, [onEnd, onTick]);

  useEffect(() => {
    setTimeLeft(remaining ?? duration);
  }, [remaining, duration]);

  useEffect(() => {
    if (!autoStart) return;
    startRef.current = Date.now();
    const totalMs = (remaining ?? duration) * 1000;

    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const left = Math.max(0, Math.ceil((totalMs - elapsed) / 1000));
      setTimeLeft(left);
      onTickRef.current?.(left);
      if (left <= 0) {
        onEndRef.current?.();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [autoStart, duration, remaining]);

  const ratio = duration > 0 ? Math.max(0, Math.min(1, timeLeft / duration)) : 0;

  return { timeLeft, ratio };
}
