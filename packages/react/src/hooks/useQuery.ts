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

    query.on('entityAdded', onEntitiesChanged);
    query.on('entityRemoved', onEntitiesChanged);

    return () => {
      query.off('entityAdded', onEntitiesChanged);
      query.off('entityRemoved', onEntitiesChanged);
    };
  }, [query]);

  return query.entities;
}
