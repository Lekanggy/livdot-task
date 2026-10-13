import type { RequirementId, RequirementState } from '@/domain/types';
import { requirementLabel } from '@/domain/requirements';
import { REQUIREMENT_TONE, TONE_CLASSES } from '@/components/ui/tones';
import { cn } from '@/lib/cn';

type Props = {
  requirementId: RequirementId;
  current: RequirementState;
  onChange: (state: RequirementState) => void;
};

const STATES: RequirementState[] = ['satisfied', 'missing', 'pending', 'error'];

export function RequirementControl({ requirementId, current, onChange }: Props) {
  const label = requirementLabel(requirementId);

  return (
    <fieldset className="flex items-center gap-2">
      <legend className="text-xs text-[--muted]">{label}</legend>
      <div className="inline-flex rounded-lg border border-[--border] bg-[--surface] p-0.5">
        {STATES.map((state) => {
          const tone = REQUIREMENT_TONE[state];
          const isActive = current === state;
          return (
            <label
              key={state}
              className={cn(
                'flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors',
                isActive
                  ? TONE_CLASSES[tone] + ' ring-1 ring-[--border]'
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300',
              )}
            >
              <input
                type="radio"
                name={`req-${requirementId}`}
                value={state}
                checked={isActive}
                onChange={() => onChange(state)}
                className="sr-only"
              />
              {state === 'satisfied' && '✓'}
              {state === 'missing' && '✕'}
              {state === 'pending' && '⋯'}
              {state === 'error' && '!'}
              <span className="sr-only">{state}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
