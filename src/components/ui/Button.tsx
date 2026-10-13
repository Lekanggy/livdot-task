import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'md' | 'sm';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  busy?: boolean;
  describedBy?: string;
  variant?: Variant;
  size?: Size;
};

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-[--primary] text-[--primary-fg] enabled:hover:bg-[--primary]/90',
  secondary:
    'border border-[--border] bg-[--surface] text-[--text] enabled:hover:bg-zinc-50',
  ghost:
    'border-0 bg-transparent text-[--text] enabled:hover:bg-zinc-100 dark:enabled:hover:bg-zinc-800',
};

const SIZE_CLASSES: Record<Size, string> = {
  md: 'h-10 px-4',
  sm: 'h-8 px-3',
};

export function Button({
  busy,
  describedBy,
  variant = 'primary',
  size = 'md',
  className,
  children,
  disabled,
  ...rest
}: Props) {
  return (
    <button
      aria-busy={busy || undefined}
      aria-describedby={describedBy}
      disabled={busy || disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--primary]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
