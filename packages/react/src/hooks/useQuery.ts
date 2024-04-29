import { useLayoutEffect, useState } from 'react';
import { QueryComponentFilter } from '0g';
import { useGame } from './useGame.js';

export function useQuery(queryDef: QueryComponentFilter) {
  const game = useGame();
  // stored as a static reference.
  const [query] = useState(() => game.queryManager.create(queryDef));
  const [_, setForceUpdate] = useState(Math.random());

  useLayoutEffect(() => {
    function onEntitiesChanged() {
      setForceUpdate(Math.random());
    }

    const cleanup = [
      query.subscribe('entityAdded', onEntitiesChanged),
      query.subscribe('entityRemoved', onEntitiesChanged),
    ];

    return () => {
      for (const unsub of cleanup) {
        unsub();
      }
    };
  }, [query]);

  return query.entities;
}
