import { cn } from '../../lib/utils';

interface SpinnerProps {
  className?: string;
  size?: number;
}

export function Spinner({ className, size = 24 }: SpinnerProps) {
  return (
    <span
      className={cn(
        'inline-block animate-spin rounded-full border-2 border-border border-t-primary',
        className,
      )}
      style={{ width: size, height: size }}
      aria-label="Yükleniyor"
    />
  );
}
