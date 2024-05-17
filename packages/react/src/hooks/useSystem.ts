import { Game, QueryComponentFilter, system, SystemRunner } from '0g';
import { useGame } from './useGame.js';
import { useStableCallback } from './internal.js';
import { useEffect, useMemo } from 'react';

/**
 * Similar to system(), but within a React component.
 * Allows you to selectively invoke a system based on component
 * mount, and use a system to manipulate React state.
 * You could even theoretically change the system's behavior
 * function whenever you want. Not sure you want to.
 *
 * Experimental! Things may act strangely. I'm not sure!
 */
export function useSystem<Filter extends QueryComponentFilter, Result>(
  filter: Filter,
  runner: SystemRunner<Filter, Result>,
  options?: {
    phase?: 'step' | 'preStep' | 'postStep' | (string & {});
    initialResult?: Result;
  },
) {
  const game = useGame();
  const run = useStableCallback(runner);
  const capturedInitialResult = useMemo(() => options?.initialResult, []);
  useEffect(() => {
    const sys = system.unregistered(filter, runner, options);
    return sys(game);
  }, [game, run, capturedInitialResult, options?.phase]);
}
