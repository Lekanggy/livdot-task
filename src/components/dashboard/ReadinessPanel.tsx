'use client';

import type { RequirementId, RequirementState } from '@/domain/types';
import { isSatisfied } from '@/domain/requirements';
import type { Event } from '@/domain/types';
import { useEvent } from '@/state/useEvent';
import { RequirementRow } from './RequirementRow';

export function ReadinessPanel({ event, editable = false }: { event: Event; editable?: boolean }) {
  const { setRequirement } = useEvent();
  const total = event.requirements.length;
  const satisfied = event.requirements.filter(isSatisfied).length;

  return (
    <section aria-label="Operational readiness" className="rounded border p-4">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-zinc-500">
        Readiness
      </h2>
      <p className="mb-3 text-sm" data-testid="readiness-summary">
        <strong>{satisfied}</strong> of <strong>{total}</strong> requirements satisfied
      </p>
      <ul className="flex flex-col gap-2">
        {event.requirements.map((entry) => (
          <RequirementRow
            key={entry.id}
            entry={entry}
            {...(editable
              ? {
                  onSatisfy: (id: string) => void setRequirement(id as RequirementId, 'satisfied' as RequirementState),
                  onMissing: (id: string) => void setRequirement(id as RequirementId, 'missing' as RequirementState),
                }
              : {})}
          />
        ))}
      </ul>
    </section>
  );
}
