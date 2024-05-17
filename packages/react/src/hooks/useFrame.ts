import { useEffect, useLayoutEffect, useRef } from 'react';
import { Query, QueryComponentFilter, QueryIteratorFn } from '0g';
import { useGame } from './useGame.js';

/**
 * Runs a callback every game step
 */
export function useFrame(callback: () => void, phase?: string) {
  const game = useGame();

  const ref = useRef(callback);
  useLayoutEffect(() => {
    ref.current = callback;
  }, [callback]);

  useEffect(() => {
    return game.subscribe(
      phase ? `phase:${phase}` : 'stepComplete',
      ref.current,
    );
  }, [game, ref]);
}
