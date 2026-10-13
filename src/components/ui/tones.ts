import type { EventStatus, RequirementState } from '@/domain/types';

export type Tone = 'neutral' | 'info' | 'ok' | 'warn' | 'bad' | 'live';

export const STATUS_TONE: Record<EventStatus, Tone> = {
  draft: 'neutral',
  scheduled: 'info',
  ready: 'ok',
  live: 'live',
  completed: 'neutral',
  replay: 'info',
};

export const REQUIREMENT_TONE: Record<RequirementState, Tone> = {
  satisfied: 'ok',
  missing: 'bad',
  pending: 'warn',
  error: 'bad',
};

export const STATUS_TONE_FOR_REQ_STATE: Record<RequirementState, Tone> = {
  satisfied: 'ok',
  missing: 'bad',
  pending: 'warn',
  error: 'bad',
};

export const TONE_CLASSES: Record<Tone, string> = {
  neutral: 'bg-zinc-200 text-zinc-800',
  info: 'bg-blue-100 text-blue-800',
  ok: 'bg-emerald-100 text-emerald-800',
  warn: 'bg-amber-100 text-amber-800',
  bad: 'bg-red-100 text-red-800',
  live: 'bg-red-100 text-red-800',
};

export const TONE_BG: Record<Tone, string> = {
  neutral: 'bg-zinc-100',
  info: 'bg-blue-50',
  ok: 'bg-emerald-50',
  warn: 'bg-amber-50',
  bad: 'bg-red-50',
  live: 'bg-red-50',
};
