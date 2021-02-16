import { useGame, useQuery } from '@0g/react';
import * as React from 'react';
import { List, ListItem } from './components/List';
import { useForceUpdate } from './hooks/useForceUpdate';
import { useStore } from './useStore';
import shallow from 'zustand/shallow';

export type EntityListProps = {};

export function EntityList({}: EntityListProps) {
  const allEntities = useQuery([]);

  const [selectedId, select] = useStore(
    (s) => [s.selectedEntityId, s.api.selectEntity],
    shallow,
  );

  return (
    <List css={{ width: '100%' }}>
      {allEntities.map((entityId) => (
        <ListItem
          as="button"
          key={entityId}
          state={entityId === selectedId ? 'selected' : 'default'}
          onClick={() => select(entityId)}
        >
          {entityId}
        </ListItem>
      ))}
    </List>
  );
}
