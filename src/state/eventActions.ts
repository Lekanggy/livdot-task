import type { Event } from '@/domain/types';
import type { State } from './eventState';

export type EventAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; event: Event }
  | { type: 'LOAD_ERROR'; message: string }
  | { type: 'REQUIREMENT_UPDATED'; event: Event }
  | { type: 'STATUS_CHANGED'; event: Event; notice?: string }
  | { type: 'ACTION_START'; action: string }
  | { type: 'ACTION_FAIL'; message: string }
  | { type: 'NOTICE_CLEARED' };

export const loadStart = (): EventAction => ({ type: 'LOAD_START' });
export const loadSuccess = (event: Event): EventAction => ({ type: 'LOAD_SUCCESS', event });
export const loadError = (message: string): EventAction => ({ type: 'LOAD_ERROR', message });
export const requirementUpdated = (event: Event): EventAction => ({
  type: 'REQUIREMENT_UPDATED',
  event,
});
export const statusChanged = (event: Event, notice?: string): EventAction => ({
  type: 'STATUS_CHANGED',
  event,
  notice,
});
export const actionStart = (action: string): EventAction => ({ type: 'ACTION_START', action });
export const actionFail = (message: string): EventAction => ({ type: 'ACTION_FAIL', message });
export const noticeCleared = (): EventAction => ({ type: 'NOTICE_CLEARED' });
