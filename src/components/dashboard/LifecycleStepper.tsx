import { STATUS_ORDER } from '@/domain/lifecycle';
import { STATUS_LABELS, type StepState } from '@/domain/types';
import { CheckIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

type Props = { steps: StepState[] };

export function LifecycleStepper({ steps }: Props) {
  const currentIdx = steps.findIndex((s) => s === 'current');

  return (
    <nav aria-label="Event lifecycle" className="rounded-xl border border-line bg-surface px-6 py-5">
      <p className="mb-3 text-sm font-semibold md:hidden" aria-live="polite" data-testid="stepper-current-line">
        Step {currentIdx + 1} of 6 · {STATUS_LABELS[STATUS_ORDER[currentIdx]]}
      </p>
      <ol className="flex items-start" data-testid="lifecycle-stepper">
        {STATUS_ORDER.map((status, i) => (
          <li
            key={status}
            data-testid={`step-${status}`}
            data-state={steps[i]}
            aria-current={steps[i] === 'current' ? 'step' : undefined}
            className={cn('flex flex-col gap-2', i < STATUS_ORDER.length - 1 && 'flex-1')}
          >
            <StepCircle state={steps[i]} index={i} />
            <span
              className={cn(
                'text-xs leading-tight',
                steps[i] === 'current' ? 'block font-bold text-ink' : 'hidden text-muted md:block',
                steps[i] === 'complete' && 'md:font-semibold md:text-ink',
              )}
            >
              {STATUS_LABELS[status]}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function StepCircle({ state, index }: { state: StepState; index: number }) {
  const isLast = index === STATUS_ORDER.length - 1;
  return (
    <div className="flex items-center">
      <span
        className={cn(
          'grid h-8 w-8 flex-none place-items-center rounded-full',
          state === 'complete' && 'bg-primary text-white',
          state === 'current' && 'border-[3px] border-primary bg-white font-bold text-primary',
          state === 'upcoming' && 'border-2 border-slate-300 bg-white text-slate-500',
        )}
      >
        {state === 'complete' ? <CheckIcon /> : index + 1}
      </span>
      {!isLast && (
        <span
          aria-hidden
          className={cn('mx-2 h-[3px] flex-1 rounded', state === 'complete' ? 'bg-primary' : 'bg-line')}
        />
      )}
    </div>
  );
}
