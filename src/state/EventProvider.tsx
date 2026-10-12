'use client';

import { useCallback, useEffect, type ReactNode } from 'react';
import { autoTransition } from '@/domain/lifecycle';
import { STATUS_LABELS } from '@/domain/types';
import type { EventStatus, RequirementId, RequirementState } from '@/domain/types';
import {
  configureApi,
  getEvent,
  markReplayProcessed,
  setRequirement,
  setStreamFailure,
  transition,
} from '@/services/mockEventApi';
import type { ScenarioId } from '@/services/fixtures';
import { EventStateProvider, useEventDispatch, useEventState } from './useEventState';
import { useFlight } from './useFlight';
import {
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
  const { begin } = useFlight();

  useEffect(() => {
    if (state.event || state.async.kind !== 'idle') return;
    begin('load');
    void (async () => {
      dispatch(loadStart());
      const result = await getEvent();
      if (result.ok) dispatch(loadSuccess(result.value));
      else dispatch(loadError(result.error.message));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, state.event, state.async.kind]);

  return <>{children}</>;
}

export function useEventCommands() {
  const dispatch = useEventDispatch();
  const { begin, fail } = useFlight();

  const updateRequirement = useCallback(
    async (id: RequirementId, state: RequirementState) => {
      const token = begin('requirement');
      const result = await setRequirement(id, state);
      if (!result.ok) return fail(token, result.error.message);
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
    [dispatch, begin, fail],
  );

  const runTransition = useCallback(
    async (action: string, to: EventStatus) => {
      const token = begin(action);
      const result = await transition(to);
      if (!result.ok) return fail(token, result.error.message);
      dispatch(statusChanged(result.value, `Event is now ${STATUS_LABELS[result.value.status]}.`));
    },
    [dispatch, begin, fail],
  );

  const switchScenario = useCallback(
    async (id: ScenarioId) => {
      configureApi({ scenario: id });
      const token = begin('load');
      dispatch(loadStart());
      const result = await getEvent();
      if (!result.ok) return fail(token, result.error.message);
      dispatch(loadSuccess(result.value));
      dispatch(noticeCleared());
    },
    [dispatch, begin, fail],
  );

  const triggerStreamFailure = useCallback(
    async (on: boolean) => {
      setStreamFailure(on);
      const token = begin('sim');
      const result = await getEvent();
      if (!result.ok) return fail(token, result.error.message);
      dispatch(
        statusChanged(result.value, on ? 'Stream failure simulated.' : 'Stream restored.'),
      );
    },
    [dispatch, begin, fail],
  );

  const processReplay = useCallback(() => {
    markReplayProcessed();
    dispatch(noticeCleared());
  }, [dispatch]);

  const clearNotice = useCallback(() => dispatch(noticeCleared()), [dispatch]);

  const reload = useCallback(async () => {
    const token = begin('load');
    dispatch(loadStart());
    const result = await getEvent();
    if (result.ok) dispatch(loadSuccess(result.value));
    else fail(token, result.error.message);
  }, [dispatch, begin, fail]);

  return {
    setRequirement: updateRequirement,
    runTransition,
    clearNotice,
    reload,
    switchScenario,
    triggerStreamFailure,
    processReplay,
  };
}
