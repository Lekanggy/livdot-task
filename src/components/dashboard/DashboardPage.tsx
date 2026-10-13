'use client';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import type { ActionId, EventStatus } from '@/domain/types';
import { useEvent } from '@/state/useEvent';
import { EventHeader } from './EventHeader';
import { EventDetails } from './EventDetails';
import { LifecycleStepper } from './LifecycleStepper';
import { NextStepCard } from './NextStepCard';
import { ReadinessPanel } from './ReadinessPanel';
import { StreamFailureBanner } from './StreamFailureBanner';
import { SimulationPanel } from '@/components/simulation/SimulationPanel';
import { DashboardSkeleton } from './DashboardSkeleton';

const TARGET: Record<ActionId, EventStatus> = {
  schedule: 'scheduled',
  goLive: 'live',
  endEvent: 'completed',
  enableReplay: 'replay',
};

export function DashboardPage() {
  const { event, async, steps, notice, clearNotice, actions, actionFlight, runAction, nextAction } =
    useEvent();

  if (async.kind === 'error' && !event) return <ErrorState message={async.message} />;
  if (!event) return <DashboardSkeleton />;

  const otherActions = actions.filter(a => a.action !== nextAction?.action);

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6" data-testid="dashboard">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <EventHeader event={event} />

        <div className="space-y-3">
          <LifecycleStepper steps={steps} />
          <StreamFailureBanner event={event} />
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <ReadinessPanel event={event} />
          </div>
          <div className="lg:col-span-5">
            <NextStepCard
              nextAction={nextAction}
              otherActions={otherActions}
              flight={actionFlight}
              onRun={(a) => void runAction(a.action, TARGET[a.action])}
            />
            <EventDetails event={event} />
          </div>
        </div>

        {notice && (
          <Alert tone="info" className="mx-auto max-w-4xl">
            {notice}{' '}
            <button
              onClick={clearNotice}
              className="ml-1 underline underline-offset-2 hover:no-underline"
              data-testid="notice-dismiss"
            >
              Dismiss
            </button>
          </Alert>
        )}

        {async.kind === 'loading' && (
          <Alert tone="info" className="mx-auto max-w-4xl" data-testid="dashboard-updating">
            Updating…
          </Alert>
        )}

        <SimulationPanel />
      </div>
    </main>
  );
}

function ErrorState({ message }: { message: string }) {
  const { reload } = useEvent();
  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6" data-testid="dashboard-error">
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        <Alert tone="bad" icon="✕">
          Failed to load the event: {message}
        </Alert>
        <Button data-testid="retry" onClick={() => void reload()}>
          Retry
        </Button>
      </div>
    </main>
  );
}
