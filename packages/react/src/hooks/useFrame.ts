import { useEffect, useLayoutEffect, useRef } from 'react';
import { useGame } from './useGame.js';

/**
 * Runs a callback every game step
 */
export function useFrame(callback: () => void, phase: string = 'step') {
  const game = useGame();

  const ref = useRef(callback);
  useLayoutEffect(() => {
    ref.current = callback;
  }, [callback]);

  useEffect(() => {
    return game.subscribe(`phase:${phase}`, ref.current);
  }, [game, ref]);
}
