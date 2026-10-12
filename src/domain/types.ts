export const EVENT_STATUSES = [
  'draft',
  'scheduled',
  'ready',
  'live',
  'completed',
  'replay',
] as const;

export type EventStatus = (typeof EVENT_STATUSES)[number];

export const STATUS_LABELS: Record<EventStatus, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  ready: 'Ready for Streaming',
  live: 'Live',
  completed: 'Completed',
  replay: 'Replay Available',
};

import type { RequirementId } from './requirements';

export type { RequirementId };

export type RequirementState = 'satisfied' | 'missing' | 'pending' | 'error';

export type RequirementStatus = {
  id: RequirementId;
  state: RequirementState;
  detail?: string;
};

export type EventDetails = {
  name: string;
  startsAt: string;
  ticketPrice: number;
};

export type Event = {
  id: string;
  status: EventStatus;
  details: EventDetails;
  requirements: RequirementStatus[];
  streamFailure?: boolean;
  replayProcessed?: boolean;
};

export type BlockerCode =
  | 'missing_requirements'
  | 'unscheduled_event'
  | 'replay_not_processed'
  | 'invalid_transition';

export type Blocker = {
  code: BlockerCode;
  message: string;
};

export const ACTION_IDS = [
  'schedule',
  'goLive',
  'endEvent',
  'enableReplay',
] as const;

export type ActionId = (typeof ACTION_IDS)[number];

export const ACTION_LABELS: Record<ActionId, string> = {
  schedule: 'Schedule',
  goLive: 'Go Live',
  endEvent: 'End Event',
  enableReplay: 'Enable Replay',
};

export type StepState = 'complete' | 'current' | 'upcoming';
