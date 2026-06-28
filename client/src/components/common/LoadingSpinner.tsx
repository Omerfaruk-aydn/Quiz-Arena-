import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface LoadingSpinnerProps {
  label?: string;
  fullscreen?: boolean;
  className?: string;
}

export function LoadingSpinner({ label, fullscreen, className }: LoadingSpinnerProps) {
  const content = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        fullscreen && 'min-h-screen',
        className,
      )}
    >
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-2 border-border" />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
        />
      </div>
      {label && <p className="text-sm text-text-muted">{label}</p>}
    </motion.div>
  );

  return content;
}
