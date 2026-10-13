import { missingBlocker } from './requirements';
import {
  EVENT_STATUSES,
  STATUS_LABELS,
  type Blocker,
  type Event,
  type EventStatus,
  type StepState,
} from './types';

export const STATUS_ORDER: readonly EventStatus[] = EVENT_STATUSES;

type Guard = (event: Event) => Blocker | null;

type Transition = {
  to: EventStatus;
  guard?: Guard;
};

const allowed: Guard = () => null;

function needsScheduleDate(event: Event): Blocker | null {
  if (event.details.startsAt) return null;
  return { code: 'unscheduled_event', message: 'Set a schedule date first.' };
}

const TRANSITIONS: Record<EventStatus, Transition[]> = {
  draft: [{ to: 'scheduled', guard: needsScheduleDate }],
  scheduled: [{ to: 'ready', guard: (e) => missingBlocker(e) }],
  ready: [{ to: 'live', guard: allowed }],
  live: [{ to: 'completed', guard: allowed }],
  completed: [
    {
      to: 'replay',
      guard: (e) =>
        e.replayProcessed
          ? null
          : { code: 'replay_not_processed', message: 'Replay is still processing.' },
    },
  ],
  replay: [],
};

export function canTransition(event: Event, to: EventStatus): Blocker | null {
  const target = TRANSITIONS[event.status].find((t) => t.to === to);
  if (!target) {
    return invalidBlocker(event, to);
  }
  return target.guard ? target.guard(event) : null;
}

function invalidBlocker(event: Event, to: EventStatus): Blocker {
  const gate = firstBlockingGateOnPath(event, to);
  const base = `"${STATUS_LABELS[event.status]}" cannot move to "${STATUS_LABELS[to]}".`;
  return {
    code: 'invalid_transition',
    message: gate ? `${base} Blocked upstream: ${gate}` : base,
  };
}

function pathBetween(from: EventStatus, to: EventStatus): EventStatus[] {
  const start = STATUS_ORDER.indexOf(from);
  const end = STATUS_ORDER.indexOf(to);
  if (start < 0 || end < 0 || end <= start) return [];
  return STATUS_ORDER.slice(start, end + 1);
}

function firstBlockingGateOnPath(event: Event, to: EventStatus): string | null {
  const path = pathBetween(event.status, to);
  for (let i = 0; i < path.length - 1; i++) {
    const gate = TRANSITIONS[path[i]].find((t) => t.to === path[i + 1])?.guard;
    const blocker = gate ? gate(event) : null;
    if (blocker) return blocker.message;
  }
  return null;
}

export function autoTransition(event: Event): EventStatus | null {
  const missing = missingBlocker(event);
  if (event.status === 'scheduled' && !missing) return 'ready';
  if (event.status === 'ready' && missing) return 'scheduled';
  return null;
}

export function stepStates(status: EventStatus): StepState[] {
  const idx = STATUS_ORDER.indexOf(status);
  return STATUS_ORDER.map((_, i) =>
    i < idx ? 'complete' : i === idx ? 'current' : 'upcoming',
  );
}

export function statusLabel(status: EventStatus): string {
  return STATUS_LABELS[status];
}

export function nextStatus(status: EventStatus): EventStatus | null {
  const idx = STATUS_ORDER.indexOf(status);
  if (idx < 0 || idx >= STATUS_ORDER.length - 1) return null;
  return STATUS_ORDER[idx + 1];
}
