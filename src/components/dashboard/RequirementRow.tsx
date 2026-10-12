import type { RequirementState, RequirementStatus } from '@/domain/types';
import { requirementFailureText, requirementLabel } from '@/domain/requirements';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/cn';

const MARK: Record<RequirementState, { icon: string; tone: string }> = {
  satisfied: { icon: '✓', tone: 'text-emerald-700' },
  missing: { icon: '✕', tone: 'text-zinc-600' },
  pending: { icon: '⏳', tone: 'text-amber-700' },
  error: { icon: '⚠', tone: 'text-red-700' },
};

const STATE_WORD: Record<Exclude<RequirementState, 'satisfied'>, string> = {
  missing: 'Missing',
  pending: 'Pending verification',
  error: 'Verification failed',
};

type Props = {
  entry: RequirementStatus;
  onSatisfy?: (id: string) => void;
  onMissing?: (id: string) => void;
};

export function RequirementRow({ entry, onSatisfy, onMissing }: Props) {
  const { icon, tone } = MARK[entry.state];
  return (
    <li
      data-testid={`req-${entry.id}`}
      data-state={entry.state}
      className="flex items-center gap-2 text-sm"
    >
      <span aria-hidden className={cn('w-4', tone)}>
        {icon}
      </span>
      <span>{requirementLabel(entry.id)}</span>
      {entry.state === 'pending' ? (
        <Spinner label={STATE_WORD.pending} />
      ) : (
        <span className={cn('text-xs', tone)}>
          {entry.state === 'satisfied' ? 'Satisfied' : STATE_WORD[entry.state]}
          {detailSuffix(entry)}
        </span>
      )}
      {onSatisfy && (
        <button
          data-testid={`req-${entry.id}-satisfy`}
          onClick={() => onSatisfy(entry.id)}
          className="ml-auto text-xs underline text-zinc-500 hover:text-zinc-800"
        >
          mark satisfied
        </button>
      )}
      {onMissing && (
        <button
          data-testid={`req-${entry.id}-missing`}
          onClick={() => onMissing(entry.id)}
          className="text-xs underline text-zinc-500 hover:text-zinc-800"
        >
          mark missing
        </button>
      )}
    </li>
  );
}

function detailSuffix(entry: RequirementStatus): string {
  const failure = requirementFailureText(entry);
  if (!entry.detail || !failure) return '';
  return ` — ${entry.detail}`;
}
