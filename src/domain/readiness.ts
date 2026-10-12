import { isSatisfied, requirementFailureText, requirementLabel } from './requirements';
import type { Event, RequirementStatus } from './types';

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
  return `${requirementLabel(entry.id)}: ${requirementFailureText(entry)}`;
}
