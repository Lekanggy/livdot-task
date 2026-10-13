import { isSatisfied } from '@/domain/requirements';
import type { Event } from '@/domain/types';
import { Card } from '@/components/ui/Card';
import { RequirementRow } from './RequirementRow';

export function ReadinessPanel({ event }: { event: Event }) {
  const total = event.requirements.length;
  const satisfied = event.requirements.filter(isSatisfied).length;
  const progressPct = total > 0 ? Math.round((satisfied / total) * 100) : 0;

  return (
    <Card
      title="Readiness"
      aside={`${satisfied} of ${total} satisfied`}
      testId="readiness-summary"
    >
      <div className="mt-3">
        <div
          className="h-2 rounded-full bg-zinc-200"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${satisfied} of ${total} requirements satisfied`}
        >
          <div
            className="h-2 rounded-full bg-emerald-600"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
      <ul className="mt-4 flex flex-col gap-0 border-t border-[--border] pt-4">
        {event.requirements.map((entry) => (
          <RequirementRow key={entry.id} entry={entry} />
        ))}
      </ul>
      {satisfied === total && total > 0 && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
          <span aria-hidden>✓</span>
          All requirements met.
        </div>
      )}
    </Card>
  );
}
