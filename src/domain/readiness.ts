import { REQUIREMENTS } from './requirements';
import type { Event, RequirementStatus } from './types';
import { isSatisfied, requirementFailureText } from './requirements';

export type Readiness = {
  satisfied: number;
  total: number;
  isReady: boolean;
  blockers: string[];
};

export function getReadiness(event: Event): Readiness {
  const unsatisfied = event.requirements.filter((r) => !isSatisfied(r));
  return {
    satisfied: event.requirements.length - unsatisfied.length,
    total: event.requirements.length,
    isReady: unsatisfied.length === 0,
    blockers: unsatisfied.map(failureText),
  };
}

function failureText(entry: RequirementStatus): string {
  return `${REQUIREMENTS[entry.id].label}: ${requirementFailureText(entry)}`;
}
