import type { Event, RequirementId, RequirementState } from '@/domain/types';

export type Patch = Partial<Event> & {
  requirementStates?: Partial<Record<RequirementId, RequirementState>>;
};

export const baseEvent: Event = {
  id: 'evt_1',
  status: 'draft',
  details: {
    name: 'Launch Night Keynote',
    startsAt: '2026-10-20T19:00:00Z',
    ticketPrice: 25,
  },
  requirements: [
    { id: 'crew', state: 'missing' },
    { id: 'ingest', state: 'missing' },
    { id: 'pricing', state: 'missing' },
  ],
};

export function makeEvent(patch: Patch = {}): Event {
  const { requirementStates, ...rest } = patch;
  const requirements = baseEvent.requirements.map((entry) => ({
    ...entry,
    state: requirementStates?.[entry.id] ?? entry.state,
  }));
  return { ...baseEvent, ...rest, requirements };
}
