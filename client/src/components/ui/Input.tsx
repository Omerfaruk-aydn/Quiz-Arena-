import { forwardRef, useState, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, disabled, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'no-tap flex h-11 w-full rounded-xl bg-surface-2 border border-border px-4 text-sm text-white',
        'placeholder:text-text-muted/60 transition-colors btn-focus',
        'focus:border-primary focus:bg-surface',
        error && 'border-wrong focus:border-wrong',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export const PasswordInput = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, disabled, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    return (
      <div className="relative">
        <input
          ref={ref}
          type={visible ? 'text' : 'password'}
          className={cn(
            'no-tap flex h-11 w-full rounded-xl bg-surface-2 border border-border px-4 pr-11 text-sm text-white',
            'placeholder:text-text-muted/60 transition-colors btn-focus',
            'focus:border-primary focus:bg-surface',
            error && 'border-wrong focus:border-wrong',
            disabled && 'opacity-50 cursor-not-allowed',
            className,
          )}
          disabled={disabled}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
          aria-label={visible ? 'Şifreyi gizle' : 'Şifreyi göster'}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = 'PasswordInput';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-[88px] w-full rounded-xl bg-surface-2 border border-border px-4 py-3 text-sm text-white',
        'placeholder:text-text-muted/60 transition-colors btn-focus resize-y',
        'focus:border-primary focus:bg-surface',
        error && 'border-wrong focus:border-wrong',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';

export const Label = forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn('text-sm font-medium text-text-muted mb-1.5 block', className)}
      {...props}
    />
  ),
);
Label.displayName = 'Label';

export const Field = ({
  label,
  error,
  children,
  hint,
}: {
  label?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <div className="w-full">
    {label && <Label>{label}</Label>}
    {children}
    {error ? (
      <p className="mt-1.5 text-xs text-wrong">{error}</p>
    ) : hint ? (
      <p className="mt-1.5 text-xs text-text-muted/70">{hint}</p>
    ) : null}
  </div>
);
