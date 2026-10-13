import { STATUS_ORDER } from '@/domain/lifecycle';
import { STATUS_LABELS, type StepState } from '@/domain/types';
import { cn } from '@/lib/cn';

const MARK = {
  complete: <svg className="h-4 w-4 text-emerald-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>,
  current: <span className="h-4 w-4 rounded-full ring-2 ring-[--primary] ring-offset-2" aria-hidden />,
  upcoming: <span className="h-4 w-4 rounded-full border border-zinc-300" aria-hidden />,
};

export function LifecycleStepper({ steps }: { steps: StepState[] }) {
  const currentIdx = steps.findIndex((s) => s === 'current');

  return (
    <div className="overflow-x-auto">
      <ol
        aria-label="Lifecycle"
        className="flex min-w-max gap-0"
        data-testid="lifecycle-stepper"
      >
        {STATUS_ORDER.map((status, i) => (
          <li
            key={status}
            data-testid={`step-${status}`}
            data-state={steps[i]}
            aria-current={steps[i] === 'current' ? 'step' : undefined}
            className="flex items-center"
          >
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border-2',
                  steps[i] === 'complete' && 'border-emerald-500 bg-emerald-50 text-emerald-600',
                  steps[i] === 'current' && 'border-[--primary] bg-[--surface] text-[--primary]',
                  steps[i] === 'upcoming' && 'border-zinc-300 bg-[--surface] text-zinc-400',
                )}
              >
                {MARK[steps[i]]}
              </div>
              <span
                className={cn(
                  'text-xs font-medium hidden sm:block',
                  steps[i] === 'current' && '!text-[--primary] font-semibold',
                  steps[i] === 'complete' && 'text-emerald-600',
                  steps[i] === 'upcoming' && 'text-zinc-400',
                )}
              >
                {STATUS_LABELS[status]}
              </span>
            </div>
            {i < STATUS_ORDER.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mt-3',
                  steps[i] === 'complete' ? 'bg-emerald-500' : 'border-t border-zinc-200',
                )}
                aria-hidden
              />
            )}
          </li>
        ))}
      </ol>
      <p className="mt-2 text-xs text-[--muted] sm:hidden" aria-live="polite">
        Step {currentIdx + 1} of 6 · {STATUS_LABELS[STATUS_ORDER[currentIdx]]}
      </p>
    </div>
  );
}
