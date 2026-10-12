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

  return {
    event,
    async: state.async,
    actionFlight: state.actionFlight,
    notice: state.notice,
    readiness: event
      ? getReadiness(event)
      : { satisfied: 0, total: 0, isReady: false, blockers: [] },
    actions: event ? getAvailableActions(event) : [],
    steps: event ? stepStates(event.status) : [],
    setRequirement: commands.setRequirement,
    runAction: (action: ActionId, to: EventStatus) => commands.runTransition(action, to),
    clearNotice: commands.clearNotice,
  };
}
