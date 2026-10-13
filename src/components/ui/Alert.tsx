import type { ReactNode } from 'react';
import { TONE_CLASSES } from './tones';
import { cn } from '@/lib/cn';

type AlertTone = 'info' | 'ok' | 'warn' | 'bad';

type Props = {
  tone?: AlertTone;
  icon?: string;
  children: ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

const ICONS: Record<AlertTone, string> = {
  info: 'ℹ',
  ok: '✓',
  warn: '⚠',
  bad: '✕',
};

export function Alert({ tone = 'info', icon, children, role, className, ...rest }: Props) {
  const t = tone === 'info' ? 'info' : tone;
  const classes = TONE_CLASSES[t];

  return (
    <div
      role={role || (tone === 'bad' ? 'alert' : 'status')}
      aria-live={tone === 'bad' ? 'assertive' : 'polite'}
      className={cn(
        'rounded border px-4 py-3 text-sm flex items-start gap-2.5',
        classes,
        icon ? 'gap-2.5' : '',
        className,
      )}
      {...rest}
    >
      <span aria-hidden className="mt-0.5">
        {icon ?? ICONS[tone]}
      </span>
      {children}
    </div>
  );
}
