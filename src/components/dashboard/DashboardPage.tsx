'use client';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type { ActionId, EventStatus } from '@/domain/types';
import { STATUS_LABELS } from '@/domain/types';
import { useEvent } from '@/state/useEvent';
import { EventHeader } from './EventHeader';
import { EventDetails } from './EventDetails';
import { LifecycleStepper } from './LifecycleStepper';
import { ReadinessPanel } from './ReadinessPanel';
import { ActionBar } from './ActionBar';
import { StreamFailureBanner } from './StreamFailureBanner';
import { SimulationPanel } from '@/components/simulation/SimulationPanel';

const TARGET: Record<ActionId, EventStatus> = {
  schedule: 'scheduled',
  goLive: 'live',
  endEvent: 'completed',
  enableReplay: 'replay',
};

export function DashboardPage() {
  const { event, async, steps, notice, clearNotice, actions, actionFlight, runAction } =
    useEvent();

  if (async.kind === 'loading') return <LoadingState />;
  if (async.kind === 'error') return <ErrorState message={async.message} />;
  if (!event) return <LoadingState />;

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 p-6" data-testid="dashboard">
      <EventHeader event={event} />
      <LifecycleStepper steps={steps} />
      <StreamFailureBanner event={event} />
      <EventDetails event={event} />
      <ReadinessPanel event={event} />
      <ActionBar
        actions={actions}
        flight={actionFlight}
        onRun={(a) => void runAction(a.action, TARGET[a.action])}
      />
      {notice && (
        <Alert tone="info">
          {notice}{' '}
          <button onClick={clearNotice} className="ml-1 underline" data-testid="notice-dismiss">
            dismiss
          </button>
        </Alert>
      )}
      <SimulationPanel />
    </main>
  );
}

function LoadingState() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-2 p-6" data-testid="dashboard-loading">
      <Spinner label="Loading event…" />
      <div className="h-6 w-64 animate-pulse rounded bg-zinc-200" />
      <div className="h-24 animate-pulse rounded bg-zinc-100" />
    </main>
  );
}

function ErrorState({ message }: { message: string }) {
  const { reload } = useEvent();
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-3 p-6" data-testid="dashboard-error">
      <Alert tone="error">Failed to load the event: {message}</Alert>
      <Button data-testid="retry" onClick={() => void reload()}>
        Retry
      </Button>
    </main>
  );
}
