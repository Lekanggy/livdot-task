import type {
  Blocker,
  Event,
  RequirementState,
  RequirementStatus,
} from './types';

const REQUIREMENTS = {
  crew: {
    label: 'Crew assigned',
    blockedMessage: 'Crew is not confirmed yet.',
  },
  ingest: {
    label: 'Ingest configured',
    blockedMessage: 'Ingest points to no valid source.',
  },
  pricing: {
    label: 'Ticket pricing set',
    blockedMessage: 'Ticket pricing is missing.',
  },
} as const;

export type RequirementId = keyof typeof REQUIREMENTS;

export type RequirementDef = {
  label: string;
  blockedMessage: string;
};

export const REQUIREMENT_IDS = Object.keys(REQUIREMENTS) as RequirementId[];

const UNSATISFIED: Record<Exclude<RequirementState, 'satisfied'>, string> = {
  missing: 'Missing',
  pending: 'Pending verification',
  error: 'Verification failed',
};

export function requirementLabel(id: RequirementId): string {
  return REQUIREMENTS[id].label;
}

export function requirementFailureText(entry: RequirementStatus): string {
  if (entry.state === 'satisfied') return '';
  const base = UNSATISFIED[entry.state];
  return entry.detail ? `${base}: ${entry.detail}` : base;
}

export function isSatisfied(entry: RequirementStatus): boolean {
  return entry.state === 'satisfied';
}

export function missingRequirements(event: Event): RequirementStatus[] {
  return event.requirements.filter((entry) => !isSatisfied(entry));
}

export function missingReasons(event: Event): string[] {
  return missingRequirements(event).map(describeEntry);
}

export function missingBlocker(event: Event): Blocker | null {
  const reasons = missingReasons(event);
  if (reasons.length === 0) return null;
  return { code: 'missing_requirements', message: reasons.join(' ') };
}

function describeEntry(entry: RequirementStatus): string {
  const base = REQUIREMENTS[entry.id].blockedMessage;
  return [base, requirementFailureText(entry)].filter(Boolean).join(' — ');
}
