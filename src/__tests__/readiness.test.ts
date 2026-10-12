import { describe, expect, it } from 'vitest';
import { getReadiness } from '@/domain/readiness';
import { makeEvent } from './helpers/eventFactory';

describe('getReadiness', () => {
  it('counts satisfied of total', () => {
    const e = makeEvent({
      requirementStates: { crew: 'satisfied', ingest: 'missing', pricing: 'pending' },
    });
    const r = getReadiness(e);
    expect(r.satisfied).toBe(1);
    expect(r.total).toBe(3);
    expect(r.isReady).toBe(false);
  });

  it('isReady only when all satisfied', () => {
    const ready = makeEvent({
      requirementStates: { crew: 'satisfied', ingest: 'satisfied', pricing: 'satisfied' },
    });
    expect(getReadiness(ready).isReady).toBe(true);
    expect(getReadiness(ready).blockers).toEqual([]);
  });

  it('lists a blocker line per unsatisfied requirement with its label', () => {
    const e = makeEvent({
      requirementStates: { crew: 'missing', ingest: 'error', pricing: 'satisfied' },
    });
    const blockers = getReadiness(e).blockers;
    expect(blockers).toHaveLength(2);
    expect(blockers[0]).toMatch(/[Cc]rew/);
    expect(blockers[1]).toMatch(/[Ii]ngest/);
  });
});
