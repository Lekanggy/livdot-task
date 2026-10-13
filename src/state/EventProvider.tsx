'use client';

import { useCallback, useEffect, type ReactNode } from 'react';
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
  const state = useEventState();
  const { begin, isStale, fail } = useFlight();

  const updateRequirement = useCallback(
    async (id: RequirementId, nextState: RequirementState) => {
      const prevStatus = state.event?.status;
      const token = begin('requirement');
      const result = await setRequirement(id, nextState);
      if (!result.ok) return fail(token, result.error.message);
      if (isStale(token)) return; // a newer action won — drop this stale response
      // The server already applied any pending auto-promotion/demotion.
      const statusMoved = prevStatus !== undefined && result.value.status !== prevStatus;
      if (statusMoved) {
        dispatch(
          statusChanged(
            result.value,
            result.value.status === 'ready'
              ? 'All requirements satisfied — auto-promoted to Ready for Streaming.'
              : 'A requirement was lost — demoted to Scheduled.',
          ),
        );
      } else {
        dispatch(requirementUpdated(result.value));
      }
    },
    [dispatch, begin, isStale, fail, state.event?.status],
  );

  const runTransition = useCallback(
    async (action: string, to: EventStatus) => {
      const token = begin(action);
      const result = await transition(to);
      if (!result.ok) return fail(token, result.error.message);
      if (isStale(token)) return; // a newer action won — drop this stale response
      dispatch(statusChanged(result.value, `Event is now ${STATUS_LABELS[result.value.status]}.`));
    },
    [dispatch, begin, isStale, fail],
  );

  const switchScenario = useCallback(
    async (id: ScenarioId) => {
      configureApi({ scenario: id });
      const token = begin('load');
      dispatch(loadStart());
      const result = await getEvent();
      if (!result.ok) return fail(token, result.error.message);
      if (isStale(token)) return; // stale scenario switch — the newer load wins
      dispatch(loadSuccess(result.value));
      dispatch(noticeCleared());
    },
    [dispatch, begin, isStale, fail],
  );

  const triggerStreamFailure = useCallback(
    async (on: boolean) => {
      setStreamFailure(on);
      const token = begin('sim');
      const result = await getEvent();
      if (!result.ok) return fail(token, result.error.message);
      if (isStale(token)) return; // newer action in flight — drop stale snapshot
      dispatch(
        statusChanged(result.value, on ? 'Stream failure simulated.' : 'Stream restored.'),
      );
    },
    [dispatch, begin, isStale, fail],
  );

  const processReplay = useCallback(async () => {
    const token = begin('replay');
    markReplayProcessed();
    const result = await getEvent();
    if (!result.ok) return fail(token, result.error.message);
    if (isStale(token)) return; // stale replay processing — newer action in flight
    dispatch(statusChanged(result.value, 'Replay processing complete — now available.'));
  }, [dispatch, begin, isStale, fail]);

  const clearNotice = useCallback(() => dispatch(noticeCleared()), [dispatch]);

  const reload = useCallback(async () => {
    const token = begin('load');
    dispatch(loadStart());
    const result = await getEvent();
    if (!result.ok) return fail(token, result.error.message);
    if (isStale(token)) return; // newer load in flight — drop stale snapshot
    dispatch(loadSuccess(result.value));
  }, [dispatch, begin, isStale, fail]);

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
