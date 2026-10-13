import type { AvailableAction } from '@/domain/actions';
import { ACTION_LABELS } from '@/domain/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { BlockedReason } from './BlockedReason';
import { Spinner } from '@/components/ui/Spinner';

type Props = {
  nextAction: AvailableAction | undefined;
  otherActions: AvailableAction[];
  flight: string | null;
  onRun: (action: AvailableAction) => void;
};

export function NextStepCard({ nextAction, otherActions, flight, onRun }: Props) {
  const isBusy = nextAction ? flight === nextAction.action : false;

  if (!nextAction) {
    return (
      <Card title="Next step" testId="next-step-card">
        <p className="text-sm text-[--muted]">No further actions</p>
      </Card>
    );
  }

  const terminal = nextAction.action === 'enableReplay' &&
    nextAction.enabled === false &&
    nextAction.reason?.includes('processing');

  return (
    <Card title="Next step" aside={ACTION_LABELS[nextAction.action]} testId="next-step-card">
      <div className="mt-4 flex flex-col gap-4">
        <Button
          variant="primary"
          size="md"
          busy={isBusy}
          disabled={!nextAction.enabled}
          describedBy={!nextAction.enabled ? `blocked-${nextAction.action}` : undefined}
          onClick={() => onRun(nextAction)}
          data-testid={`action-${nextAction.action}`}
          className="w-full"
        >
          {isBusy ? (
            <>
              <Spinner label="" />
              <span className="sr-only">Working…</span>
            </>
          ) : (
            ACTION_LABELS[nextAction.action]
          )}
        </Button>

        {!nextAction.enabled && nextAction.reason && (
          <BlockedReason
            id={`blocked-${nextAction.action}`}
            reasons={[nextAction.reason]}
          />
        )}

        {nextAction.enabled && otherActions.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-[--muted]">
              Other actions
            </span>
            <div className="flex flex-wrap gap-2">
              {otherActions
                .filter((a) => a.enabled)
                .map((a) => (
                  <Button
                    key={a.action}
                    variant="ghost"
                    size="sm"
                    onClick={() => onRun(a)}
                    data-testid={`action-${a.action}`}
                  >
                    {ACTION_LABELS[a.action]}
                  </Button>
                ))}
            </div>
          </div>
        )}

        {terminal && (
          <Alert tone="ok" icon="✓">
            No further actions
          </Alert>
        )}
      </div>
    </Card>
  );
}
