import type { EventStatus, RequirementState } from '@/domain/types';

export type Tone = 'neutral' | 'info' | 'ok' | 'bad' | 'warn';

export const TONE: Record<Tone, { chip: string; icon: string; box: string; dot: string; border: string }> = {
  neutral: {
    chip: 'bg-slate-100 text-slate-700',
    icon: 'bg-slate-100 text-slate-600',
    box: 'bg-slate-50 text-slate-800',
    dot: 'bg-slate-500',
    border: 'border-slate-300',
  },
  info: {
    chip: 'bg-indigo-100 text-indigo-800',
    icon: 'bg-indigo-100 text-indigo-800',
    box: 'bg-indigo-50 text-indigo-900',
    dot: 'bg-indigo-600',
    border: 'border-indigo-300',
  },
  ok: {
    chip: 'bg-green-100 text-green-800',
    icon: 'bg-green-100 text-green-800',
    box: 'bg-green-50 text-green-900',
    dot: 'bg-green-600',
    border: 'border-green-300',
  },
  bad: {
    chip: 'bg-red-100 text-red-800',
    icon: 'bg-red-100 text-red-800',
    box: 'bg-red-50 text-red-900',
    dot: 'bg-red-600',
    border: 'border-red-300',
  },
  warn: {
    chip: 'bg-amber-100 text-amber-900',
    icon: 'bg-amber-100 text-amber-900',
    box: 'bg-amber-100 text-amber-900',
    dot: 'bg-amber-600',
    border: 'border-amber-300',
  },
};

export const STATUS_TONE: Record<EventStatus, Tone> = {
  draft: 'neutral',
  scheduled: 'info',
  ready: 'ok',
  live: 'bad',
  completed: 'neutral',
  replay: 'info',
};

export const REQUIREMENT_TONE: Record<RequirementState, Tone> = {
  satisfied: 'ok',
  missing: 'bad',
  pending: 'warn',
  error: 'bad',
};
