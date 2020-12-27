import { useRef } from 'react';

export function useId(provided?: string) {
  const idRef = useRef(provided ?? Math.random().toFixed(20).slice(2));
  return idRef.current;
}
