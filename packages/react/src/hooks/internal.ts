import { useCallback, useRef } from 'react';

export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
) {
  const ref = useRef(callback);
  ref.current = callback;
  return useCallback((...args: Parameters<T>) => ref.current(...args), []);
}
