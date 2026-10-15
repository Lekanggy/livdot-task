import type { RequirementId, RequirementState } from '@/domain/types';
import { requirementLabel } from '@/domain/requirements';
import { cn } from '@/lib/cn';

const STATES: { value: RequirementState; label: string }[] = [
  { value: 'satisfied', label: 'Satisfied' },
  { value: 'missing', label: 'Missing' },
  { value: 'pending', label: 'Pending' },
  { value: 'error', label: 'Error' },
];

type Props = {
  requirementId: RequirementId;
  current: RequirementState;
  onChange: (state: RequirementState) => void;
};

export function RequirementControl({ requirementId, current, onChange }: Props) {
  const group = `req-${requirementId}`;

  return (
    <fieldset data-testid={`sim-req-${requirementId}`} className="min-w-0">
      <legend className="mb-1.5 text-xs font-semibold text-muted">{requirementLabel(requirementId)}</legend>
      <div className="inline-flex overflow-hidden rounded-lg border border-slate-300 text-sm">
        {STATES.map(({ value, label }) => {
          const selected = current === value;
          return (
            <label
              key={value}
              className={cn(
                'flex cursor-pointer items-center border-l border-slate-200 px-3 py-2 first:border-l-0',
                'focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary',
                selected ? 'bg-primary text-white' : 'bg-white text-muted hover:bg-slate-50',
              )}
            >
              <input
                type="radio"
                name={group}
                value={value}
                checked={selected}
                onChange={() => onChange(value)}
                className="sr-only"
              />
              {label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
