import { useGame } from '0g-react';
import * as React from 'react';
import { List, ListItem } from './components/List';
import { StoreEditor } from './StoreEditor';
import { useStore } from './useStore';

export type EntityDetailsProps = {
  children?: React.ReactNode;
};

export function EntityDetails({}: EntityDetailsProps) {
  const entityId = useStore((s) => s.selectedEntityId);
  const game = useGame();

  const entity = entityId && game.get(entityId);

  if (!entity) {
    return <div>No entity</div>;
  }

  return (
    <div>
      <div>{entityId}</div>
      <List>
        {entity.__stores.map((Store) => {
          const store = entity.maybeGet(Store);
          if (!store) return null;
          return (
            <ListItem key={Store.name}>
              <StoreEditor store={store} />
            </ListItem>
          );
        })}
      </List>
    </div>
  );
}
