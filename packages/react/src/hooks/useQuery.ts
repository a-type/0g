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

    query.on('entityAdded', onEntitiesChanged);
    query.on('entityRemoved', onEntitiesChanged);

    return () => {
      query.off('entityAdded', onEntitiesChanged);
      query.off('entityRemoved', onEntitiesChanged);
    };
  }, [query]);

  return query;
}
