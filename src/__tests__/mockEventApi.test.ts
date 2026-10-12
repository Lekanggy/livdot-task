import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  configureApi,
  getEvent,
  resetApi,
  setRequirement,
  snapshot,
  transition,
} from '@/services/mockEventApi';
import { SCENARIO_IDS } from '@/services/fixtures';

const fast = { minMs: 0, maxMs: 1 };

beforeEach(() => {
  vi.useFakeTimers();
  resetApi();
  configureApi({ latency: fast });
});

afterEach(() => {
  vi.useRealTimers();
  resetApi();
});

const flush = () => vi.advanceTimersByTimeAsync(5);

describe('getEvent', () => {
  it('returns the seeded scenario', async () => {
    const pending = getEvent();
    await flush();
    const result = await pending;
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.status).toBe('draft');
  });

  it('seeds every scenario id', () => {
    expect(SCENARIO_IDS).toEqual([
      'draft-incomplete',
      'scheduled-missing-crew',
      'scheduled-almost-ready',
      'ready',
      'live',
      'completed',
    ]);
  });

  it('switches scenario via configureApi', async () => {
    configureApi({ scenario: 'ready' });
    const pending = getEvent();
    await flush();
    const result = await pending;
    if (result.ok) expect(result.value.status).toBe('ready');
  });
});

describe('server-side guard re-validation', () => {
  it('rejects an illegal transition even when called directly', async () => {
    const pending = transition('live');
    await flush();
    const result = await pending;
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('invalid_transition');
      expect(result.error.message).toMatch(/cannot move/i);
    }
    expect(snapshot().status).toBe('draft');
  });

  it('rejects Scheduled → Live (skip) with the upstream cause', async () => {
    configureApi({ scenario: 'scheduled-missing-crew' });
    const pending = transition('live');
    await flush();
    const result = await pending;
    if (!result.ok) expect(result.error.message).toMatch(/crew/i);
    expect(snapshot().status).toBe('scheduled');
  });

  it('rejects transition while a requirement is pending', async () => {
    configureApi({ scenario: 'scheduled-almost-ready' });
    const pending = transition('ready');
    await flush();
    const result = await pending;
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toMatch(/pending/i);
  });

  it('allows a legal transition and updates state', async () => {
    configureApi({ scenario: 'scheduled-missing-crew' });
    await flushAwait(setRequirement('crew', 'satisfied'));
    const pending = transition('ready');
    await flush();
    const result = await pending;
    expect(result.ok).toBe(true);
    expect(snapshot().status).toBe('ready');
  });

  it('rejects unknown requirement id with typed error', async () => {
    const pending = setRequirement('facility' as never, 'satisfied');
    await flush();
    const result = await pending;
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('invalid_requirement');
  });

  it('unknown id does not mutate state', async () => {
    const before = snapshot().requirements;
    await flushAwait(setRequirement('facility' as never, 'satisfied'));
    expect(snapshot().requirements).toEqual(before);
  });
});

describe('latency + failure are configurable, not hard-coded', () => {
  it('applies configured delay window', async () => {
    configureApi({ latency: { minMs: 100, maxMs: 100 } });
    const start = vi.getTimerCount();
    const pending = getEvent();
    expect(vi.getTimerCount()).toBeGreaterThan(start);
    await vi.advanceTimersByTimeAsync(100);
    await pending;
  });

  it('fails deterministically at failRate 1 and reports typed network error', async () => {
    configureApi({ latency: { minMs: 0, maxMs: 0, failRate: 1 } });
    const pending = setRequirement('crew', 'satisfied');
    await flush();
    const result = await pending;
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('network');
      expect(result.error.message).toBeTruthy();
    }
    const ingest = snapshot().requirements.find((r) => r.id === 'ingest');
    expect(ingest?.state).toBe('missing');
  });

  it('never fails at failRate 0', async () => {
    configureApi({ latency: { minMs: 0, maxMs: 0, failRate: 0 } });
    const pending = setRequirement('crew', 'satisfied');
    await flush();
    expect((await pending).ok).toBe(true);
  });
});

async function flushAwait(p: Promise<unknown>) {
  await flush();
  return p;
}
