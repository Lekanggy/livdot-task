'use client';

import { useCallback, useRef } from 'react';
import { useEventDispatch } from './useEventState';
import { actionStart, actionFail } from './eventActions';

export function useFlight() {
  const dispatch = useEventDispatch();
  const tokenRef = useRef(0);

  const begin = useCallback(
    (action: string): number => {
      tokenRef.current += 1;
      dispatch(actionStart(action));
      return tokenRef.current;
    },
    [dispatch],
  );

  const isStale = useCallback((token: number): boolean => token !== tokenRef.current, []);

  const fail = useCallback((token: number, message: string) => {
    if (isStale(token)) return;
    dispatch(actionFail(message));
  }, [dispatch, isStale]);

  return { begin, isStale, fail, currentToken: () => tokenRef.current };
}
