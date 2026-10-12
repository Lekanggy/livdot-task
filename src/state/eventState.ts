import type { Event } from '@/domain/types';

export type Async =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'error'; message: string };

export type State = {
  event: Event | null;
  async: Async;
  actionFlight: string | null;
  notice: string | null;
};

export const initialState: State = {
  event: null,
  async: { kind: 'idle' },
  actionFlight: null,
  notice: null,
};
