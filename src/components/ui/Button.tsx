import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  busy?: boolean;
  describedBy?: string;
};

export function Button({ busy, describedBy, className, children, disabled, ...rest }: Props) {
  return (
    <button
      aria-busy={busy || undefined}
      aria-describedby={describedBy}
      disabled={busy || disabled}
      className={cn(
        'rounded px-3 py-2 text-sm font-medium transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'bg-blue-600 text-white enabled:hover:bg-blue-700',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
