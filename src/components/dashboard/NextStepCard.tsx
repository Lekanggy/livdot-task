import type { AvailableAction } from '@/domain/actions';
import { ACTION_LABELS } from '@/domain/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BlockedReason, blockedReasonsFor } from './BlockedReason';
import type { Event } from '@/domain/types';

type Props = {
  nextAction: AvailableAction | null;
  otherActions: AvailableAction[];
  event: Event;
  flight: string | null;
  onRun: (action: AvailableAction) => void;
};

/** Plain-language "becomes available once …" lines per action. */
const GATE: Partial<Record<string, string>> = {
  schedule: 'a schedule date is set.',
  goLive: 'the event is Ready for Streaming.',
  enableReplay: 'replay processing finishes.',
};

export function NextStepCard({ nextAction, otherActions, event, flight, onRun }: Props) {
  if (!nextAction) {
    return (
      <Card title="Next step" testId="next-step-card">
        <p className="text-sm">No further actions.</p>
      </Card>
    );
  }

  const action = nextAction;
  const isBusy = flight === action.action;
  const reasons = action.enabled ? [] : blockedReasonsFor(action, event);
  const describedBy = action.enabled || reasons.length === 0 ? undefined : `blocked-${action.action}`;
  const others = otherActions.filter((a) => a.enabled && a !== action);

  return (
    <Card title="Next step" testId="next-step-card">
      <p id="why" className="mt-1 mb-4 text-muted">
        {action.enabled ? 'Ready when you are.' : gateCopy(action, reasons)}
      </p>

      <Button
        size="lg"
        busy={isBusy}
        disabled={!action.enabled}
        describedBy={describedBy}
        onClick={() => onRun(action)}
        data-testid={`action-${action.action}`}
      >
        {ACTION_LABELS[action.action]}
      </Button>

      {describedBy && <BlockedReason id={describedBy} reasons={reasons} />}

      {others.length > 0 && (
        <>
          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-muted">Other actions</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {others.map((a) => (
              <Button key={a.action} variant="secondary" onClick={() => onRun(a)} data-testid={`action-${a.action}`}>
                {ACTION_LABELS[a.action]}
              </Button>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}

function gateCopy(action: AvailableAction, reasons: string[]): string {
  if (reasons.length === 0) {
    return `${ACTION_LABELS[action.action]} becomes available once the earlier steps are done.`;
  }
  const gate = GATE[action.action] ?? 'the earlier steps are done.';
  return `${ACTION_LABELS[action.action]} becomes available once ${gate}`;
}
