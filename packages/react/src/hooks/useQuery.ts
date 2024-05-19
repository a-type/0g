import { useState, useSyncExternalStore } from 'react';
import { QueryComponentFilter } from '0g';
import { useGame } from './useGame.js';

export function useQuery(queryDef: QueryComponentFilter) {
  const game = useGame();
  // stored as a static reference.
  const [query] = useState(() => {
    const q = game.queryManager.create(queryDef);
    return q;
  });

  useSyncExternalStore(
    (onChange) => {
      const cleanup = [
        query.subscribe('entityAdded', onChange),
        query.subscribe('entityRemoved', onChange),
      ];

      return () => {
        for (const unsub of cleanup) {
          unsub();
        }
      };
    },
    () => query.generation,
  );

  return query;
}
