import { useEffect, useLayoutEffect, useRef } from 'react';
import { Entity } from '../entity';
import { Query, QueryDef } from '../queries';
import { useGame } from './useGame';

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
export function useQueryFrame(
  input: Query<QueryDef>,
  callback: (entity: Entity) => void,
) {
  useFrame(() => {
    input.entities.forEach(callback);
  });
}
