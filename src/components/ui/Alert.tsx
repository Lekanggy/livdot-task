import type { HTMLAttributes, ReactNode } from 'react';
import type { Tone } from './tones';
import { TONE } from './tones';
import { cn } from '@/lib/cn';
import { CheckIcon, CrossIcon, ExclamationIcon, InfoIcon } from './icons';

type Props = {
  tone?: Exclude<Tone, 'neutral'>;
  title?: string;
  onDismiss?: () => void;
  className?: string;
  children?: ReactNode;
} & Omit<HTMLAttributes<HTMLDivElement>, 'title'>;

const LEADING = {
  ok: CheckIcon,
  bad: CrossIcon,
  warn: ExclamationIcon,
  info: InfoIcon,
};

export function Alert({ tone = 'info', title, onDismiss, className, children, role, ...rest }: Props) {
  const Icon = LEADING[tone];
  return (
    <div
      role={role ?? (tone === 'bad' ? 'alert' : 'status')}
      className={cn(
        'flex items-start gap-3 rounded-[10px] border bg-clip-border px-4 py-3.5',
        TONE[tone].border,
        TONE[tone].box,
        className,
      )}
      {...rest}
    >
      <Icon className="mt-0.5 h-5 w-5 flex-none" />
      <div className="flex-1">
        {title && <strong className="font-semibold">{title}</strong>}
        <div className={cn(title && !onDismiss && 'inline', 'text-sm')}>{children}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="mt-0.5 flex-none font-semibold opacity-70 hover:opacity-100"
          aria-label="Dismiss notice"
        >
          ✕
        </button>
      )}
    </div>
  );
}
