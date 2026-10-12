import { STATUS_ORDER } from '@/domain/lifecycle';
import { STATUS_LABELS, type StepState } from '@/domain/types';
import { cn } from '@/lib/cn';

const MARK: Record<StepState, string> = {
  complete: '✓',
  current: '●',
  upcoming: '○',
};

export function LifecycleStepper({ steps }: { steps: StepState[] }) {
  return (
    <ol aria-label="Lifecycle" className="flex flex-wrap gap-2 text-sm">
      {STATUS_ORDER.map((status, i) => (
        <li
          key={status}
          data-testid={`step-${status}`}
          data-state={steps[i]}
          aria-current={steps[i] === 'current' ? 'step' : undefined}
          className={cn(
            'flex items-center gap-1 rounded-full border px-3 py-1',
            steps[i] === 'current' && 'border-zinc-800 font-semibold',
            steps[i] === 'complete' && 'border-emerald-300 text-emerald-700',
            steps[i] === 'upcoming' && 'border-zinc-200 text-zinc-400',
          )}
        >
          <span aria-hidden>{MARK[steps[i]]}</span>
          {STATUS_LABELS[status]}
        </li>
      ))}
    </ol>
  );
}
