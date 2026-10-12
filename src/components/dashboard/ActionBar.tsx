import { Button } from '@/components/ui/Button';
import { ACTION_LABELS } from '@/domain/types';
import type { AvailableAction } from '@/domain/actions';
import { cn } from '@/lib/cn';

export function ActionBar({
  actions,
  flight,
  onRun,
}: {
  actions: AvailableAction[];
  flight: string | null;
  onRun: (action: AvailableAction) => void;
}) {
  return (
    <section aria-label="Actions" className="rounded border p-4">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">
        Actions
      </h2>
      <div className="flex flex-col gap-3">
        {actions.map((a) => (
          <ActionSlot key={a.action} action={a} flight={flight} onRun={onRun} />
        ))}
      </div>
    </section>
  );
}

function ActionSlot({
  action,
  flight,
  onRun,
}: {
  action: AvailableAction;
  flight: string | null;
  onRun: (action: AvailableAction) => void;
}) {
  const busy = flight === action.action;
  const describedBy = !action.enabled ? `blocked-${action.action}` : undefined;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3">
        <Button
          busy={busy}
          disabled={!action.enabled}
          describedBy={describedBy}
          onClick={() => onRun(action)}
          data-testid={`action-${action.action}`}
        >
          {actionLabel(action)}
        </Button>
        {busy && <small className="text-zinc-500">Working…</small>}
      </div>
      {!action.enabled && action.reason && (
        <BlockedReason
          id={`blocked-${action.action}`}
          reason={action.reason}
        />
      )}
    </div>
  );
}

export function actionLabel(a: AvailableAction): string {
  return ACTION_LABELS[a.action];
}

export function BlockedReason({ id, reason }: { id: string; reason: string }) {
  return (
    <p id={id} data-testid={id} className={cn('text-xs text-zinc-500')}>
      Why blocked: {reason}
    </p>
  );
}
