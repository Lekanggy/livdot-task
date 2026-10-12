import { describe, expect, it } from 'vitest';
import {
  isSatisfied,
  missingBlocker,
  missingReasons,
  missingRequirements,
  requirementFailureText,
  REQUIREMENT_IDS,
} from '@/domain/requirements';
import { makeEvent } from './helpers/eventFactory';
import type { RequirementState } from '@/domain/types';

const STATES: RequirementState[] = ['satisfied', 'missing', 'pending', 'error'];

describe('requirement registry', () => {
  it('registers exactly crew, ingest, pricing', () => {
    expect(REQUIREMENT_IDS).toEqual(['crew', 'ingest', 'pricing']);
  });

  it('only satisfied counts', () => {
    const results = STATES.map((s) => isSatisfied({ id: 'crew', state: s }));
    expect(results).toEqual([true, false, false, false]);
  });
});

describe('requirementFailureText', () => {
  it('labels each unsatisfied state distinctly', () => {
    expect(requirementFailureText({ id: 'crew', state: 'missing' })).toMatch(/missing/i);
    expect(requirementFailureText({ id: 'crew', state: 'pending' })).toMatch(/pending/i);
    expect(requirementFailureText({ id: 'crew', state: 'error' })).toMatch(/failed/i);
    expect(requirementFailureText({ id: 'crew', state: 'satisfied' })).toBe('');
  });

  it('appends detail when present', () => {
    const text = requirementFailureText({ id: 'crew', state: 'error', detail: 'api 500' });
    expect(text).toContain('api 500');
  });
});

describe('missingRequirements / missingBlocker', () => {
  it('returns entries for every unsatisfied requirement', () => {
    const e = makeEvent({
      requirementStates: { crew: 'satisfied', ingest: 'pending', pricing: 'error' },
    });
    expect(missingRequirements(e).map((r) => r.id)).toEqual(['ingest', 'pricing']);
  });

  it('returns [] / null when all satisfied', () => {
    const e = makeEvent({
      requirementStates: { crew: 'satisfied', ingest: 'satisfied', pricing: 'satisfied' },
    });
    expect(missingRequirements(e)).toEqual([]);
    expect(missingBlocker(e)).toBeNull();
  });

  it('blocked message names the requirement for every unsatisfied state', () => {
    for (const state of STATES.filter((s) => s !== 'satisfied')) {
      const e = makeEvent({ requirementStates: { crew: state } });
      const blocker = missingBlocker(e);
      expect(blocker?.code).toBe('missing_requirements');
      expect(blocker?.message).toMatch(/crew/i);
    }
  });

  it('combines multiple blockers into one readable message', () => {
    const e = makeEvent({
      requirementStates: { crew: 'error', ingest: 'missing' },
    });
    const message = missingBlocker(e)?.message ?? '';
    expect(message).toContain('Crew');
    expect(message).toContain('Ingest');
  });

  it('reasons mirror missing entries incl. state wording', () => {
    const e = makeEvent({
      requirementStates: { crew: 'satisfied', ingest: 'satisfied', pricing: 'pending' },
    });
    expect(missingReasons(e)[0]).toMatch(/pricing/i);
    expect(missingReasons(e)[0]).toMatch(/pending/i);
  });
});
