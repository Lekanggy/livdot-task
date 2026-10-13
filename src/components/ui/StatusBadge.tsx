import { STATUS_TONE, TONE_CLASSES } from './tones';
import { statusLabel } from '@/domain/lifecycle';
import type { EventStatus } from '@/domain/types';
import { cn } from '@/lib/cn';

export function StatusBadge({ status }: { status: EventStatus }) {
  const tone = STATUS_TONE[status];
  const classes = TONE_CLASSES[tone];

  return (
    <span
      data-testid="status-badge"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        classes,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          tone === 'live' ? 'animate-pulse bg-current' : 'bg-current opacity-60',
        )}
      />
      {statusLabel(status)}
    </span>
  );
}
