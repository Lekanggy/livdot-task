import type { HTMLAttributes, ReactNode } from 'react';
import type { Tone } from './tones';
import { TONE } from './tones';
import { cn } from '@/lib/cn';

type Props = {
  tone: Tone;
  pulse?: boolean;
  size?: 'sm' | 'lg';
  children: ReactNode;
} & HTMLAttributes<HTMLSpanElement>;

export function Chip({ tone, pulse, size = 'sm', className, children, ...rest }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold',
        TONE[tone].chip,
        size === 'lg' ? 'px-3.5 py-1.5 text-[13px]' : 'px-2.5 py-0.5 text-xs',
        className,
      )}
      {...rest}
    >
      {size === 'lg' && (
        <span aria-hidden className={cn('h-2 w-2 rounded-full', TONE[tone].dot, pulse && 'animate-pulse')} />
      )}
      {children}
    </span>
  );
}
