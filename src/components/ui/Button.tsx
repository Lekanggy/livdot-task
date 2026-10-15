import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary';
type Size = 'md' | 'lg';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  busy?: boolean;
  describedBy?: string;
  variant?: Variant;
  size?: Size;
};

const VARIANT = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  secondary: 'border border-slate-300 bg-white text-ink hover:bg-slate-50',
};

const SIZE = {
  md: 'h-10 px-4',
  lg: 'h-11 w-full text-[15px]',
};

export function Button({
  busy,
  describedBy,
  variant = 'primary',
  size = 'md',
  className,
  children,
  disabled,
  type,
  ...rest
}: Props) {
  return (
    <button
      type={type ?? 'button'}
      aria-busy={busy || undefined}
      aria-describedby={describedBy}
      disabled={busy || disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANT[variant],
        SIZE[size],
        className,
      )}
      {...rest}
    >
      {busy && <Spinner className={cn(variant === 'primary' && 'text-white')} />}
      {children}
    </button>
  );
}
