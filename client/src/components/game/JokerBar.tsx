import { motion } from 'framer-motion';
import { Percent, Phone, SkipForward } from 'lucide-react';
import type { JokerState, JokerType } from '@quizarena/shared';
import { cn } from '../../lib/utils';

interface JokerBarProps {
  jokers: JokerState;
  onUseJoker: (type: JokerType) => void;
  disabled?: boolean;
}

interface JokerButtonProps {
  type: JokerType;
  label: string;
  icon: React.ReactNode;
  available: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function JokerButton({ type, label, icon, available, onClick, disabled }: JokerButtonProps) {
  return (
    <motion.button
      type="button"
      whileHover={available && !disabled ? { scale: 1.05 } : undefined}
      whileTap={available && !disabled ? { scale: 0.95 } : undefined}
      onClick={() => {
        if (available && !disabled) onClick();
      }}
      disabled={!available || disabled}
      className={cn(
        'relative flex flex-col items-center gap-1.5 rounded-2xl border-2 px-4 py-3 transition-all',
        available && !disabled
          ? 'border-primary/40 bg-primary/10 text-primary hover:border-primary hover:bg-primary/20 cursor-pointer'
          : 'border-border bg-surface-2/50 text-text-muted/40 cursor-not-allowed',
        type === 'fifty_fifty' &&
          available &&
          !disabled &&
          'border-accent-amber/40 bg-accent-amber/10 text-accent-amber hover:border-accent-amber hover:bg-accent-amber/20',
        type === 'phone_a_friend' &&
          available &&
          !disabled &&
          'border-correct/40 bg-correct/10 text-correct hover:border-correct hover:bg-correct/20',
        type === 'skip_question' &&
          available &&
          !disabled &&
          'border-accent-pink/40 bg-accent-pink/10 text-accent-pink hover:border-accent-pink hover:bg-accent-pink/20',
      )}
      title={available ? label : `${label} kullanıldı`}
    >
      <div className="text-xl">{icon}</div>
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      {!available && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-surface-2/80">
          <span className="text-xs font-bold text-text-muted">Kullanıldı</span>
        </div>
      )}
    </motion.button>
  );
}

export function JokerBar({ jokers, onUseJoker, disabled }: JokerBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      <JokerButton
        type="fifty_fifty"
        label="50:50"
        icon={<Percent size={24} />}
        available={jokers.fiftyFifty}
        onClick={() => onUseJoker('fifty_fifty')}
        disabled={disabled}
      />
      <JokerButton
        type="phone_a_friend"
        label="Arkımı Ara"
        icon={<Phone size={24} />}
        available={jokers.phoneAFriend}
        onClick={() => onUseJoker('phone_a_friend')}
        disabled={disabled}
      />
      <JokerButton
        type="skip_question"
        label="Atla"
        icon={<SkipForward size={24} />}
        available={jokers.skipQuestion}
        onClick={() => onUseJoker('skip_question')}
        disabled={disabled}
      />
    </div>
  );
}
