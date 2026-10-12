'use client';

import { useCallback, useEffect, type ReactNode } from 'react';
import { autoTransition } from '@/domain/lifecycle';
import { STATUS_LABELS } from '@/domain/types';
import type { EventStatus, RequirementId, RequirementState } from '@/domain/types';
import { getEvent, setRequirement, transition } from '@/services/mockEventApi';
import { EventStateProvider, useEventDispatch, useEventState } from './useEventState';
import {
  actionFail,
  actionStart,
  loadError,
  loadStart,
  loadSuccess,
  noticeCleared,
  requirementUpdated,
  statusChanged,
} from './eventActions';

export function EventProvider({ children }: { children: ReactNode }) {
  return (
    <EventStateProvider>
      <Orchestrator>{children}</Orchestrator>
    </EventStateProvider>
  );
}

function Orchestrator({ children }: { children: ReactNode }) {
  const dispatch = useEventDispatch();
  const state = useEventState();

  useEffect(() => {
    if (state.event || state.async.kind !== 'idle') return;
    void load(dispatch);
  }, [dispatch, state.event, state.async.kind]);

  return <>{children}</>;
}

async function load(dispatch: ReturnType<typeof useEventDispatch>) {
  dispatch(loadStart());
  const result = await getEvent();
  if (result.ok) {
    dispatch(loadSuccess(result.value));
  } else {
    dispatch(loadError(result.error.message));
  }
}

export function useEventCommands() {
  const dispatch = useEventDispatch();
  const reload = useCallback(async () => {
    await load(dispatch);
  }, [dispatch]);

  const updateRequirement = useCallback(
    async (id: RequirementId, state: RequirementState) => {
      dispatch(actionStart('requirement'));
      const result = await setRequirement(id, state);
      if (!result.ok) {
        dispatch(actionFail(result.error.message));
        return;
      }
      const promoted = autoTransition(result.value);
      const next = promoted ? { ...result.value, status: promoted } : result.value;
      if (promoted) {
        dispatch(
          statusChanged(
            next,
            promoted === 'ready'
              ? 'All requirements satisfied — auto-promoted to Ready for Streaming.'
              : 'A requirement was lost — demoted to Scheduled.',
          ),
        );
      } else {
        dispatch(requirementUpdated(next));
      }
    },
    [dispatch],
  );

  const runTransition = useCallback(
    async (action: string, to: EventStatus) => {
      dispatch(actionStart(action));
      const result = await transition(to);
      if (!result.ok) {
        dispatch(actionFail(result.error.message));
        return;
      }
      dispatch(statusChanged(result.value, `Event is now ${STATUS_LABELS[result.value.status]}.`));
    },
    [dispatch],
  );

  const clearNotice = useCallback(() => dispatch(noticeCleared()), [dispatch]);

  return { setRequirement: updateRequirement, runTransition, clearNotice, reload };
}
