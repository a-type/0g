import { useLayoutEffect, useState } from 'react';
import { UserQueryDef } from '0g';
import { useGame } from './useGame';

export function useQuery(queryDef: UserQueryDef) {
  const game = useGame();
  // stored as a static reference.
  const [query] = useState(() => game.queryManager.createTracking(queryDef));
  const [_, setForceUpdate] = useState(Math.random());

  useLayoutEffect(() => {
    function onEntitiesChanged() {
      setForceUpdate(Math.random());
    }

    query.on('change', onEntitiesChanged);

    return () => {
      query.off('change', onEntitiesChanged);
    };
  }, [query]);

  return query.entities;
}
