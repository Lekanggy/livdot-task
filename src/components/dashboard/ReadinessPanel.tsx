import type { Event, RequirementId } from '@/domain/types';
import { isSatisfied } from '@/domain/requirements';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { RequirementRow } from './RequirementRow';

type Props = {
  event: Event;
  onConfigure: (id: RequirementId) => void;
};

export function ReadinessPanel({ event, onConfigure }: Props) {
  const total = event.requirements.length;
  const satisfied = event.requirements.filter(isSatisfied).length;
  const pct = total > 0 ? Math.round((satisfied / total) * 100) : 0;

  return (
    <Card
      title="Operational readiness"
      aside={`${satisfied} of ${total} satisfied`}
      testId="readiness-summary"
    >
      <div
        aria-label="Readiness"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        role="progressbar"
        className="my-3.5 h-2 overflow-hidden rounded-full bg-line"
      >
        {/* The only permitted inline style: dynamic readiness width (spec §5). */}
        <div className="h-full bg-green-700" style={{ width: `${pct}%` }} />
      </div>

      <ul>
        {event.requirements.map((entry) => (
          <RequirementRow key={entry.id} entry={entry} onConfigure={() => onConfigure(entry.id)} />
        ))}
      </ul>

      {satisfied === total && total > 0 && (
        <Alert tone="ok" className="mt-4">
          All requirements met.
        </Alert>
      )}
    </Card>
  );
}
