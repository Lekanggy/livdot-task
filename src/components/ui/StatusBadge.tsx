import { statusLabel } from '@/domain/lifecycle';
import type { EventStatus } from '@/domain/types';
import { cn } from '@/lib/cn';

const TONES: Record<EventStatus, string> = {
  draft: 'bg-zinc-200 text-zinc-800',
  scheduled: 'bg-blue-100 text-blue-800',
  ready: 'bg-emerald-100 text-emerald-800',
  live: 'bg-red-100 text-red-800',
  completed: 'bg-indigo-100 text-indigo-800',
  replay: 'bg-purple-100 text-purple-800',
};

export function StatusBadge({ status }: { status: EventStatus }) {
  return (
    <span
      data-testid="status-badge"
      className={cn(
        'inline-flex items-center rounded px-2 py-1 text-sm font-semibold',
        TONES[status],
      )}
    >
      {statusLabel(status)}
    </span>
  );
}
