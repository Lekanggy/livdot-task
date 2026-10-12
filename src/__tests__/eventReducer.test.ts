import { describe, expect, it } from 'vitest';
import { eventReducer } from '@/state/eventReducer';
import { initialState } from '@/state/eventState';
import { makeEvent } from './helpers/eventFactory';
import {
  actionFail,
  actionStart,
  loadError,
  loadStart,
  loadSuccess,
  noticeCleared,
  requirementUpdated,
  statusChanged,
} from '@/state/eventActions';

const event = makeEvent({ status: 'scheduled', requirementStates: { crew: 'missing' } });

describe('eventReducer', () => {
  it('LOAD_START moves idle→loading and clears notice', () => {
    const s = eventReducer(
      { ...initialState, notice: 'old' },
      loadStart(),
    );
    expect(s.async).toEqual({ kind: 'loading' });
    expect(s.notice).toBeNull();
    expect(s.event).toBeNull();
  });

  it('LOAD_SUCCESS stores event and resets transient flags', () => {
    const loading = eventReducer(initialState, loadStart());
    const s = eventReducer(loading, loadSuccess(event));
    expect(s.event).toEqual(event);
    expect(s.async).toEqual({ kind: 'idle' });
    expect(s.actionFlight).toBeNull();
  });

  it('LOAD_ERROR surfaces message without touching any event', () => {
    const loading = eventReducer(initialState, loadStart());
    const s = eventReducer(loading, loadError('boom'));
    expect(s.async).toEqual({ kind: 'error', message: 'boom' });
    expect(s.event).toBeNull();
  });

  it('REQUIREMENT_UPDATED swaps event data and ends the flight', () => {
    const mid = eventReducer({ ...initialState, event }, actionStart('requirement'));
    const updated = makeEvent({ status: 'scheduled', requirementStates: { crew: 'satisfied' } });
    const s = eventReducer(mid, requirementUpdated(updated));
    expect(s.event?.requirements[0].state).toBe('satisfied');
    expect(s.actionFlight).toBeNull();
  });

  it('STATUS_CHANGED swaps event and sets notice, clears flight', () => {
    const ready = makeEvent({
      status: 'ready',
      requirementStates: { crew: 'satisfied', ingest: 'satisfied', pricing: 'satisfied' },
    });
    const mid = eventReducer({ ...initialState, event }, actionStart('schedule'));
    const s = eventReducer(mid, statusChanged(ready, 'promoted'));
    expect(s.event?.status).toBe('ready');
    expect(s.notice).toBe('promoted');
    expect(s.actionFlight).toBeNull();
  });

  it('ACTION_START records flight and clears stale notice', () => {
    const s = eventReducer(
      { ...initialState, event, notice: 'stale' },
      actionStart('goLive'),
    );
    expect(s.actionFlight).toBe('goLive');
    expect(s.notice).toBeNull();
  });

  it('ACTION_FAIL clears flight and exposes error WITHOUT touching event', () => {
    const mid = eventReducer({ ...initialState, event }, actionStart('goLive'));
    const s = eventReducer(mid, actionFail('Stream is offline'));
    expect(s.actionFlight).toBeNull();
    expect(s.notice).toBe('Stream is offline');
    expect(s.event).toEqual(event);
  });

  it('NOTICE_CLEARED resets notice only', () => {
    const mid = eventReducer({ ...initialState, event }, actionFail('x'));
    const s = eventReducer(mid, noticeCleared());
    expect(s.notice).toBeNull();
    expect(s.event).toEqual(event);
  });

  it('is pure: same (state, action) → same result; input state untouched', () => {
    const before = structuredClone(initialState);
    const a = eventReducer(initialState, loadStart());
    const b = eventReducer(initialState, loadStart());
    expect(a).toEqual(b);
    expect(initialState).toEqual(before);
  });

  it('unknown action returns state unchanged (exhaustive switch default)', () => {
    const s = eventReducer(initialState, { type: 'NOPE' } as never);
    expect(s).toBe(initialState);
  });
});

describe('auto-promote/demote flow (via orchestrator contract)', () => {
  it('promotes: STATUS_CHANGED notice mentions Ready', () => {
    const ready = makeEvent({
      status: 'ready',
      requirementStates: { crew: 'satisfied', ingest: 'satisfied', pricing: 'satisfied' },
    });
    const s = eventReducer(
      { ...initialState, event },
      statusChanged(ready, 'All requirements satisfied — auto-promoted to Ready for Streaming.'),
    );
    expect(s.event?.status).toBe('ready');
    expect(s.notice).toMatch(/auto-promoted/i);
  });

  it('demotes: STATUS_CHANGED notice mentions demotion', () => {
    const back = makeEvent({ status: 'scheduled', requirementStates: { crew: 'missing' } });
    const s = eventReducer(
      { ...initialState, event: readyEvent() },
      statusChanged(back, 'A requirement was lost — demoted to Scheduled.'),
    );
    expect(s.event?.status).toBe('scheduled');
    expect(s.notice).toMatch(/demoted/i);
  });
});

function readyEvent() {
  return makeEvent({
    status: 'ready',
    requirementStates: { crew: 'satisfied', ingest: 'satisfied', pricing: 'satisfied' },
  });
}
