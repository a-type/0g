import { useEffect, useLayoutEffect, useRef } from 'react';
import { Query, UserQueryDef, QueryIteratorFn } from '0g';
import { useGame } from './useGame';
import { EntityImpostor } from '0g/dist-esm/EntityImpostor';

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
    function run() {
      ref.current();
    }
    game.on('step', run);
    return () => {
      game.off('step', run);
    };
  }, [game, ref]);
}

/**
 * Iterates over a query result entity list every
 * game step
 */
export function useQueryFrame<Q extends Query>(
  input: Q,
  callback: QueryIteratorFn<Q>,
) {
  useFrame(() => {
    for (const ent of input) {
      callback(ent);
    }
  });
}
