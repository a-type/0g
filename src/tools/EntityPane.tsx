import * as React from 'react';
import { EntityData } from '../types';
import { StorePanel } from './StorePanel';

export type EntityPaneProps = {
  entity: EntityData;
};

export function EntityPane({ entity }: EntityPaneProps) {
  return (
    <div>
      {Object.keys(entity.stores).map((storeName) => (
        <StorePanel
          key={storeName}
          title={storeName}
          entityId={entity.id}
          store={entity.stores[storeName]}
        />
      ))}
    </div>
  );
}
