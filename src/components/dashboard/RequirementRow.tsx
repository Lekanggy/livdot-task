import type { RequirementState, RequirementStatus } from '@/domain/types';
import { requirementLabel } from '@/domain/requirements';
import { REQUIREMENTS, type RequirementDef } from '@/domain/requirements';
import { Spinner } from '@/components/ui/Spinner';
import { REQUIREMENT_TONE } from '@/components/ui/tones';
import { cn } from '@/lib/cn';
import { StatusBadge } from '@/components/ui/StatusBadge';

export function RequirementRow({ entry }: { entry: RequirementStatus }) {
  const tone = REQUIREMENT_TONE[entry.state];
  const def = REQUIREMENTS[entry.id] as RequirementDef;
  const hint = def.blockedMessage;

  const iconElement = getIconForState(entry.state);

  return (
    <li
      data-testid={`req-${entry.id}`}
      data-state={entry.state}
      className="flex items-start gap-3 py-3 border-t border-[--border] first:border-t-0"
    >
      <div
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full ring-1',
          tone === 'ok' && 'bg-emerald-50 ring-emerald-200',
          tone === 'bad' && 'bg-red-50 ring-red-200',
          tone === 'warn' && 'bg-amber-50 ring-amber-200',
        )}
      >
        {iconElement ?? (
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm font-medium">{requirementLabel(entry.id)}</span>
        {entry.state !== 'satisfied' && hint && (
          <p className="text-xs text-[--muted] mt-0.5">{hint}</p>
        )}
      </div>
      <div className="shrink-0">
        {entry.state === 'pending' ? (
          <Spinner label="Verifying…" />
        ) : (
          <StatusBadge status={statusForState(entry.state)} />
        )}
      </div>
    </li>
  );
}

function getIconForState(state: RequirementState) {
  if (state === 'pending') return null;
  return (
    <svg
      className={cn(
        'h-4 w-4',
        state === 'satisfied' && 'text-emerald-600',
        state === 'missing' && 'text-red-600',
        state === 'error' && 'text-red-600',
      )}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d={
          state === 'satisfied'
            ? 'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
            : state === 'missing'
            ? 'M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
            : 'M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.5 1.646-1.743 2.98l5.58 9.92c.75 1.334 2.807 1.334 3.556 0l5.58-9.92c.749-1.334 2.219-1.334 2.976 0l2.291 3.978c.749 1.334-2.069 1.334-2.813 0l-2.29-3.978zM10 18a8 8 0 100-16 8 8 0 000 16z'
        }
        clipRule="evenodd"
      />
    </svg>
  );
}

function statusForState(state: RequirementState): 'ready' | 'draft' | 'live' | 'scheduled' {
  return state === 'satisfied' ? 'ready' : state === 'missing' ? 'draft' : state === 'error' ? 'live' : 'scheduled';
}
