import { useLayoutEffect, useState } from 'react';
import { QueryDef } from '0g';
import { useGame } from './useGame';

export function useQuery(queryDef: QueryDef) {
  const game = useGame();
  // stored as a static reference.
  const [query] = useState(() => game.queries.create(queryDef));
  const [_, setForceUpdate] = useState(Math.random());

  useLayoutEffect(() => {
    function onEntitiesChanged() {
      setForceUpdate(Math.random());
    }

    query.events.on('entityAdded', onEntitiesChanged);
    query.events.on('entityRemoved', onEntitiesChanged);

    return () => {
      query.events.off('entityAdded', onEntitiesChanged);
      query.events.off('entityRemoved', onEntitiesChanged);
    };
  }, [query]);

  return query;
}
