import type { ActionId, Event } from './types';
import { canTransition } from './lifecycle';
import { STATUS_LABELS } from './types';

export type AvailableAction = {
  action: ActionId;
  enabled: boolean;
  reason?: string;
};

const TARGETS: Partial<Record<ActionId, Event['status']>> = {
  schedule: 'scheduled',
  goLive: 'live',
  endEvent: 'completed',
  enableReplay: 'replay',
};

export function getAvailableActions(event: Event): AvailableAction[] {
  return (Object.keys(TARGETS) as ActionId[]).map((action) =>
    evaluate(event, action, TARGETS[action]),
  );
}

function evaluate(
  event: Event,
  action: ActionId,
  to: Event['status'] | undefined,
): AvailableAction {
  if (!to) return { action, enabled: false, reason: 'Unknown target.' };
  if (event.status === to) {
    return { action, enabled: false, reason: `Already ${STATUS_LABELS[to]}.` };
  }
  const blocker = canTransition(event, to);
  return blocker
    ? { action, enabled: false, reason: blocker.message }
    : { action, enabled: true };
}
