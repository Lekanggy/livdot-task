'use client';

import type { ActionId, EventStatus } from '@/domain/types';
import type { AvailableAction } from '@/domain/actions';
import { useEvent } from '@/state/useEvent';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { TopBar } from './TopBar';
import { EventHeader } from './EventHeader';
import { NoticeStack } from './NoticeStack';
import { LifecycleStepper } from './LifecycleStepper';
import { ReadinessPanel } from './ReadinessPanel';
import { NextStepCard } from './NextStepCard';
import { EventDetails } from './EventDetails';
import { DashboardSkeleton } from './DashboardSkeleton';
import { SimulationPanel } from '@/components/simulation/SimulationPanel';

const TARGET: Record<ActionId, EventStatus> = {
  schedule: 'scheduled',
  goLive: 'live',
  endEvent: 'completed',
  enableReplay: 'replay',
};

export function DashboardPage() {
  const { event, async, steps, actionFlight, nextAction, otherActions, setRequirement, runAction } = useEvent();

  if (async.kind === 'error' && !event) return <ErrorState message={async.message} />;
  if (!event) return <DashboardSkeleton />;

  const onRun = (a: AvailableAction) => void runAction(a.action, TARGET[a.action]);

  return (
    <div data-testid="dashboard">
      <TopBar eventName={event.details.name} />
      <main className="mx-auto flex max-w-[1200px] flex-col gap-6 px-6 py-8">
        <EventHeader event={event} />
        <NoticeStack event={event} />
        <LifecycleStepper steps={steps} />
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <ReadinessPanel event={event} onConfigure={(id) => void setRequirement(id, 'satisfied')} />
          </div>
          <div className="flex flex-col gap-6 lg:col-span-5">
            <NextStepCard
              nextAction={nextAction}
              otherActions={otherActions}
              event={event}
              flight={actionFlight}
              onRun={onRun}
            />
            <EventDetails event={event} />
          </div>
        </div>
        <SimulationPanel />
      </main>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  const { reload } = useEvent();
  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-6 py-8" data-testid="dashboard-error">
      <Alert tone="bad" title="Failed to load the event.">
        {plainError(message)} Reload to try again.
      </Alert>
      <Button data-testid="retry" className="self-start" onClick={() => void reload()}>
        Retry
      </Button>
    </div>
  );
}

function plainError(message: string): string {
  return /blocked upstream|cannot/i.test(message) ? 'Something went wrong.' : `${message.split(' — ')[0]} `;
}
