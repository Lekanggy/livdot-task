import type { Event, RequirementId, RequirementState } from '@/domain/types';

const base = {
  id: 'evt_1',
  details: {
    name: 'Fall Product Launch Keynote',
    startsAt: '2026-10-20T19:00:00Z',
    ticketPrice: 25,
  },
};

type ReqSpec = Partial<Record<RequirementId, RequirementState>>;

const defaultReqs: ReqSpec = {
  crew: 'missing',
  ingest: 'missing',
  pricing: 'missing',
};

function requirements(spec: ReqSpec): Event['requirements'] {
  const merged: ReqSpec = { ...defaultReqs, ...spec };
  const ids: RequirementId[] = ['crew', 'ingest', 'pricing'];
  return ids.map((id) => ({ id, state: merged[id] ?? 'missing' }));
}

const ALL_SATISFIED: ReqSpec = {
  crew: 'satisfied',
  ingest: 'satisfied',
  pricing: 'satisfied',
};

export type ScenarioId =
  | 'draft-incomplete'
  | 'scheduled-missing-crew'
  | 'scheduled-almost-ready'
  | 'ready'
  | 'live'
  | 'completed';

export type Scenario = { id: ScenarioId; event: Event };

export const SCENARIOS: Record<ScenarioId, Scenario> = {
  'draft-incomplete': {
    id: 'draft-incomplete',
    event: {
      ...base,
      status: 'draft',
      requirements: requirements({ crew: 'satisfied', ingest: 'missing' }),
      replayProcessed: false,
    },
  },
  'scheduled-missing-crew': {
    id: 'scheduled-missing-crew',
    event: {
      ...base,
      status: 'scheduled',
      requirements: requirements({ crew: 'missing', ingest: 'satisfied', pricing: 'satisfied' }),
      replayProcessed: false,
    },
  },
  'scheduled-almost-ready': {
    id: 'scheduled-almost-ready',
    event: {
      ...base,
      status: 'scheduled',
      requirements: requirements({ crew: 'satisfied', ingest: 'pending', pricing: 'satisfied' }),
      replayProcessed: false,
    },
  },
  ready: {
    id: 'ready',
    event: {
      ...base,
      status: 'ready',
      requirements: requirements(ALL_SATISFIED),
      replayProcessed: false,
    },
  },
  live: {
    id: 'live',
    event: {
      ...base,
      status: 'live',
      requirements: requirements(ALL_SATISFIED),
      replayProcessed: false,
    },
  },
  completed: {
    id: 'completed',
    event: {
      ...base,
      status: 'completed',
      requirements: requirements(ALL_SATISFIED),
      replayProcessed: false,
    },
  },
};

export const SCENARIO_IDS = Object.keys(SCENARIOS) as ScenarioId[];

export function getScenario(id: ScenarioId): Event {
  return structuredClone(SCENARIOS[id].event);
}
