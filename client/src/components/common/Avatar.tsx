import { cn, initials } from '../../lib/utils';

interface AvatarProps {
  name?: string;
  emoji?: string;
  color?: string;
  url?: string | null;
  size?: number;
  className?: string;
}

export function Avatar({ name, emoji, color, url, size = 40, className }: AvatarProps) {
  if (url) {
    return (
      <img
        src={url}
        alt={name ?? 'avatar'}
        width={size}
        height={size}
        className={cn('rounded-full object-cover border border-border', className)}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold text-white border border-border',
        className,
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: color ?? '#7C3AED',
        fontSize: emoji ? size * 0.55 : size * 0.38,
      }}
    >
      {emoji ?? (name ? initials(name) : '?')}
    </div>
  );
}
