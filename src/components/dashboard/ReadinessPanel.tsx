import { isSatisfied } from '@/domain/requirements';
import type { Event } from '@/domain/types';
import { RequirementRow } from './RequirementRow';

export function ReadinessPanel({ event }: { event: Event }) {
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
          <RequirementRow key={entry.id} entry={entry} />
        ))}
      </ul>
    </section>
  );
}
