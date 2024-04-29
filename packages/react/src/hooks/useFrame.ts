import { useEffect, useLayoutEffect, useRef } from 'react';
import { Query, QueryComponentFilter, QueryIteratorFn } from '0g';
import { useGame } from './useGame.js';

/**
 * Runs a callback every game step
 */
export function useFrame(callback: () => void) {
  const game = useGame();

  const ref = useRef(callback);
  useLayoutEffect(() => {
    ref.current = callback;
  }, [callback]);

  useEffect(() => {
    return game.subscribe('step', ref.current);
  }, [game, ref]);
}

/**
 * Iterates over a query result entity list every
 * game step
 */
export function useQueryFrame<Q extends Query<QueryComponentFilter>>(
  input: Q,
  callback: QueryIteratorFn<Q>,
) {
  useFrame(() => {
    for (const ent of input) {
      // FIXME:
      callback(ent as any);
    }
  });
}
