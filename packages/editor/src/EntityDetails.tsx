import { Entity } from '0g';
import { useGame } from '0g-react';
import * as React from 'react';
import { AddStoreButton } from './AddStoreButton';
import { List, ListItem } from './components/List';
import { PanelHeader } from './components/Panel';
import { useForceUpdate } from './hooks/useForceUpdate';
import { StoreEditor } from './StoreEditor';
import { useStore } from './useStore';

export type EntityDetailsProps = {
  children?: React.ReactNode;
};

export function EntityDetails({}: EntityDetailsProps) {
  const update = useForceUpdate();

  const entityId = useStore((s) => s.selectedEntityId);
  const game = useGame();

  const entity = entityId && game.get(entityId);

  // rerender if stores change
  React.useEffect(() => {
    if (!entityId) return;
    function updateIfEntity(entity: Entity) {
      if (entity.id === entityId) update();
    }
    game.entities.on('entityStoreAdded', updateIfEntity);
    game.entities.on('entityStoreRemoved', updateIfEntity);
    return () => {
      game.entities.off('entityStoreAdded', updateIfEntity);
      game.entities.off('entityStoreRemoved', updateIfEntity);
    };
  }, [entityId]);

  if (!entityId || !entity) {
    return <React.Fragment>No entity</React.Fragment>;
  }

  return (
    <React.Fragment key={entityId}>
      <PanelHeader>
        <h3>{entityId}</h3>
        <AddStoreButton entityId={entityId} />
      </PanelHeader>
      <List css={{ minWidth: 400 }}>
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
    </React.Fragment>
  );
}