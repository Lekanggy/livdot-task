'use client';

import { getAvailableActions } from '@/domain/actions';
import { getReadiness } from '@/domain/readiness';
import { stepStates } from '@/domain/lifecycle';
import type { ActionId, EventStatus } from '@/domain/types';
import { useEventState } from './useEventState';
import { useEventCommands } from './EventProvider';

export function useEvent() {
  const state = useEventState();
  const commands = useEventCommands();

  const event = state.event;
  const actions = event ? getAvailableActions(event) : [];
  // Pure selector: the one action targeting the next lifecycle status (§7).
  const nextAction = (event ? actions.find((a) => a.action === nextActionId(event.status)) : undefined) ?? null;
  const otherActions = actions.filter((a) => a !== nextAction && a.enabled);

  return {
    event,
    async: state.async,
    actionFlight: state.actionFlight,
    notice: state.notice,
    readiness: event
      ? getReadiness(event)
      : { satisfied: 0, total: 0, isReady: false, blockers: [] },
    nextAction,
    otherActions,
    steps: event ? stepStates(event.status) : [],
    setRequirement: commands.setRequirement,
    runAction: (action: ActionId, to: EventStatus) => commands.runTransition(action, to),
    clearNotice: commands.clearNotice,
    reload: commands.reload,
    switchScenario: commands.switchScenario,
    triggerStreamFailure: commands.triggerStreamFailure,
    processReplay: commands.processReplay,
  };
}

function nextActionId(status: EventStatus): ActionId | undefined {
  const map: Record<EventStatus, ActionId | undefined> = {
    draft: 'schedule',
    scheduled: 'goLive',
    ready: 'goLive',
    live: 'endEvent',
    completed: 'enableReplay',
    replay: undefined,
  };
  return map[status];
}
