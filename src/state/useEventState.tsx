'use client';

import {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react';
import { eventReducer } from './eventReducer';
import { initialState, type State } from './eventState';
import type { EventAction } from './eventActions';

export const EventStateContext = createContext<State | null>(null);
export const EventDispatchContext = createContext<Dispatch<EventAction> | null>(null);

export function EventStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(eventReducer, initialState);
  return (
    <EventDispatchContext.Provider value={dispatch}>
      <EventStateContext.Provider value={state}>{children}</EventStateContext.Provider>
    </EventDispatchContext.Provider>
  );
}

export function useEventState(): State {
  const ctx = useContext(EventStateContext);
  if (!ctx) throw new Error('useEventState outside provider');
  return ctx;
}

export function useEventDispatch(): Dispatch<EventAction> {
  const ctx = useContext(EventDispatchContext);
  if (!ctx) throw new Error('useEventDispatch outside provider');
  return ctx;
}
