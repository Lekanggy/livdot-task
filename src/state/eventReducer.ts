import type { EventAction } from './eventActions';
import type { State } from './eventState';
import { initialState } from './eventState';

export function eventReducer(state: State = initialState, action: EventAction): State {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, async: { kind: 'loading' }, notice: null };
    case 'LOAD_SUCCESS':
      return {
        ...state,
        event: action.event,
        async: { kind: 'idle' },
        actionFlight: null,
        notice: null,
      };
    case 'LOAD_ERROR':
      return {
        ...state,
        async: { kind: 'error', message: action.message },
        actionFlight: null,
      };
    case 'REQUIREMENT_UPDATED':
      return { ...state, event: action.event, notice: null };
    case 'STATUS_CHANGED':
      return {
        ...state,
        event: action.event,
        notice: action.notice ?? null,
        actionFlight: null,
      };
    case 'ACTION_START':
      return { ...state, actionFlight: action.action, notice: null };
    case 'ACTION_FAIL':
      return { ...state, actionFlight: null, notice: action.message };
    case 'NOTICE_CLEARED':
      return { ...state, notice: null };
    default:
      return state;
  }
}
