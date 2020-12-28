import { useGame } from '0g-react';
import * as React from 'react';
import { List, ListItem } from './components/List';
import { useForceUpdate } from './hooks/useForceUpdate';
import { useStore } from './useStore';
import shallow from 'zustand/shallow';

export type EntityListProps = {};

export function EntityList({}: EntityListProps) {
  const update = useForceUpdate();

  const game = useGame();

  React.useEffect(() => {
    game.entities.on('entityAdded', update);
    game.entities.on('entityRemoved', update);
    return () => {
      game.entities.off('entityAdded', update);
      game.entities.off('entityRemoved', update);
    };
  }, []);

  const [selectedId, select] = useStore(
    (s) => [s.selectedEntityId, s.api.selectEntity],
    shallow,
  );

  return (
    <List css={{ width: '100%' }}>
      {game.entities.entityList.map((entity) => (
        <ListItem
          as="button"
          key={entity.id}
          state={entity.id === selectedId ? 'selected' : 'default'}
          onClick={() => select(entity.id)}
        >
          {entity.id}
        </ListItem>
      ))}
    </List>
  );
}
