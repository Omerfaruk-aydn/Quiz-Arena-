import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'outline';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-surface-2 text-text-muted border-border',
  primary: 'bg-primary/20 text-primary border-primary/40',
  success: 'bg-correct/20 text-correct border-correct/40',
  warning: 'bg-accent-amber/20 text-accent-amber border-accent-amber/40',
  danger: 'bg-wrong/20 text-wrong border-wrong/40',
  outline: 'border-border text-text-muted',
};

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
