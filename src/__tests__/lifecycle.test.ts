import { describe, expect, it } from 'vitest';
import { canTransition, autoTransition, stepStates } from '@/domain/lifecycle';
import { STATUS_ORDER } from '@/domain/lifecycle';
import { makeEvent } from './helpers/eventFactory';
import type { Event, EventStatus } from '@/domain/types';

const all = (a: Event, b: EventStatus) => canTransition(a, b) === null;

describe('lifecycle transition table', () => {
  const event = makeEvent({
    status: 'draft',
    requirementStates: { crew: 'satisfied', ingest: 'satisfied', pricing: 'satisfied' },
  });

  it('never allows skipping or backward movement', () => {
    const ok = STATUS_ORDER.map((to) => all(event, to));
    expect(ok).toEqual([false, true, false, false, false, false]);
  });

  it('blocks Draft → Scheduled without a date', () => {
    const noDate = makeEvent({ status: 'draft', details: { name: 'x', startsAt: '', ticketPrice: 0 } });
    const blocker = canTransition(noDate, 'scheduled');
    expect(blocker).toMatchObject({ code: 'unscheduled_event' });
    expect(blocker?.message).toMatch(/schedule date/i);
  });

  it('blocks Draft → Scheduled until all requirements are satisfied', () => {
    const e = makeEvent({ status: 'scheduled', requirementStates: { crew: 'missing' } });
    const blocker = canTransition(makeEvent({ status: 'draft' }), 'draft');
    expect(blocker?.code).toBe('invalid_transition');

    const wrongDirection = canTransition(e, 'draft');
    expect(wrongDirection?.code).toBe('invalid_transition');
  });

  it('blocks Scheduled → Ready when any requirement is unsatisfied', () => {
    const cases: Record<string, string> = {
      crew: 'Crew',
      ingest: 'Ingest',
      pricing: 'pricing',
    };
    for (const [id, label] of Object.entries(cases)) {
      const e = makeEvent({ status: 'scheduled', requirementStates: { [id]: 'missing' } });
      const blocker = canTransition(e, 'ready');
      expect(blocker?.code).toBe('missing_requirements');
      expect(blocker?.message).toContain(label);
    }
  });

  it('blocks Scheduled → Ready with human-readable pending reason', () => {
    const e = makeEvent({ status: 'scheduled', requirementStates: { crew: 'pending' } });
    const blocker = canTransition(e, 'ready');
    expect(blocker?.message).toMatch(/crew/i);
    expect(blocker?.message).toMatch(/pending/i);
  });

  it('blocks Scheduled → Ready with human-readable error reason', () => {
    const e = makeEvent({ status: 'scheduled', requirementStates: { ingest: 'error' } });
    expect(canTransition(e, 'ready')?.message).toMatch(/ingest/i);
  });

  it('allows Scheduled → Ready when everything is satisfied', () => {
    const e = makeEvent({
      status: 'scheduled',
      requirementStates: { crew: 'satisfied', ingest: 'satisfied', pricing: 'satisfied' },
    });
    expect(all(e, 'ready')).toBe(true);
  });

  it('allows Ready → Live manually with no requirements re-check', () => {
    const e = makeEvent({ status: 'ready', requirementStates: { pricing: 'missing' } });
    expect(all(e, 'live')).toBe(true);
  });

  it('allows Live → Completed and blocks other exits from Live', () => {
    const e = makeEvent({ status: 'live' });
    expect(all(e, 'completed')).toBe(true);
    expect(all(e, 'draft')).toBe(false);
    expect(all(e, 'scheduled')).toBe(false);
    expect(all(e, 'ready')).toBe(false);
    expect(all(e, 'replay')).toBe(false);
  });

  it('gates Completed → Replay on replayProcessed', () => {
    const e = makeEvent({ status: 'completed' });
    const blocked = canTransition(e, 'replay');
    expect(blocked?.code).toBe('replay_not_processed');

    const processed = makeEvent({ status: 'completed', replayProcessed: true });
    expect(all(processed, 'replay')).toBe(true);
  });

  it('Replay Available is terminal', () => {
    const e = makeEvent({ status: 'replay', replayProcessed: true });
    STATUS_ORDER.forEach((to) => expect(all(e, to)).toBe(false));
  });
});

describe('autoTransition (promote / demote)', () => {
  it('auto-promotes Scheduled → Ready when last requirement lands', () => {
    const e = makeEvent({
      status: 'scheduled',
      requirementStates: { crew: 'satisfied', ingest: 'satisfied', pricing: 'satisfied' },
    });
    expect(autoTransition(e)).toBe('ready');
  });

  it('auto-demotes Ready → Scheduled when a requirement is lost', () => {
    const e = makeEvent({
      status: 'ready',
      requirementStates: { crew: 'satisfied', ingest: 'satisfied', pricing: 'missing' },
    });
    expect(autoTransition(e)).toBe('scheduled');
  });

  it('pending requirement keeps Scheduled from promoting (counts as not satisfied)', () => {
    const e = makeEvent({
      status: 'scheduled',
      requirementStates: { crew: 'satisfied', ingest: 'satisfied', pricing: 'pending' },
    });
    expect(autoTransition(e)).toBeNull();
  });

  it('never auto-moves Draft, Live, Completed, or Replay', () => {
    expect(autoTransition(makeEvent({ status: 'draft' }))).toBeNull();
    expect(autoTransition(makeEvent({ status: 'live' }))).toBeNull();
    expect(autoTransition(makeEvent({ status: 'completed' }))).toBeNull();
    expect(autoTransition(makeEvent({ status: 'replay' }))).toBeNull();
  });

  it('stays put when Scheduled is missing something', () => {
    const e = makeEvent({ status: 'scheduled', requirementStates: { crew: 'missing' } });
    expect(autoTransition(e)).toBeNull();
  });
});

describe('stepStates', () => {
  it('marks everything before as complete, itself current, rest upcoming', () => {
    expect(stepStates('draft')).toEqual([
      'current', 'upcoming', 'upcoming', 'upcoming', 'upcoming', 'upcoming',
    ]);
    expect(stepStates('ready')).toEqual([
      'complete', 'complete', 'current', 'upcoming', 'upcoming', 'upcoming',
    ]);
    expect(stepStates('replay')).toEqual([
      'complete', 'complete', 'complete', 'complete', 'complete', 'current',
    ]);
  });

  it('produces one entry per status, no drift', () => {
    STATUS_ORDER.forEach((s) => expect(stepStates(s)).toHaveLength(6));
  });
});
