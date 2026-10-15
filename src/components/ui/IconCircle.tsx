import type { Tone } from './tones';
import { TONE } from './tones';
import { cn } from '@/lib/cn';
import { CheckIcon, CrossIcon, ExclamationIcon } from './icons';

export type IconKind = 'check' | 'cross' | 'spinner' | 'exclamation';

type Props = {
  tone: Tone;
  kind: IconKind;
  className?: string;
};

export function IconCircle({ tone, kind, className }: Props) {
  return (
    <span
      aria-hidden
      className={cn('grid h-8 w-8 flex-none place-items-center rounded-full', TONE[tone].icon, className)}
    >
      {kind === 'spinner' ? (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : kind === 'check' ? (
        <CheckIcon />
      ) : kind === 'cross' ? (
        <CrossIcon />
      ) : (
        <ExclamationIcon />
      )}
    </span>
  );
}
