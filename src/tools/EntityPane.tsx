import * as React from 'react';
import { EntityData } from '../types';
import { StorePanel } from './StorePanel';
import { Accordion } from '@chakra-ui/react';

export type EntityPaneProps = {
  entity: EntityData;
};

export function EntityPane({ entity }: EntityPaneProps) {
  return (
    <Accordion defaultIndex={[0]} minW={200}>
      {Object.keys(entity.stores).map((storeName) => (
        <StorePanel
          key={storeName}
          title={storeName}
          entityId={entity.id}
          store={entity.stores[storeName]}
        />
      ))}
    </Accordion>
  );
}
