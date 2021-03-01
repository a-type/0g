import { useGame } from '@0g/react';
import * as React from 'react';
import { AddComponentButton } from './AddComponentButton';
import { List, ListItem } from './components/List';
import { PanelHeader } from './components/Panel';
import { useForceUpdate } from './hooks/useForceUpdate';
import { ComponentEditor } from './ComponentEditor';
import { useStore } from './useStore';
import { ComponentInstance } from '0g';

export type EntityDetailsProps = {
  children?: React.ReactNode;
};

export function EntityDetails({}: EntityDetailsProps) {
  const update = useForceUpdate();

  const entityId = useStore((s) => s.selectedEntityId);
  const game = useGame();

  const [components, setComponents] = React.useState(
    new Array<ComponentInstance<unknown>>(),
  );

  // rerender if stores change
  React.useEffect(() => {
    if (!entityId) return;

    const ent = game.get(entityId);
    setComponents(Array.from(ent?.components.values() ?? []));

    function onAddComponent(id: number, component: ComponentInstance<unknown>) {
      if (id !== entityId) return;
      setComponents((cur) => {
        cur[component.type] = component;
        return cur;
      });
    }

    function onRemoveComponent(id: number, componentType: number) {
      if (id !== entityId) return;
      setComponents((cur) => {
        delete cur[componentType];
        return cur;
      });
    }

    game.archetypeManager.on('entityComponentAdded', onAddComponent);
    game.archetypeManager.on('entityComponentRemoved', onRemoveComponent);
    return () => {
      game.archetypeManager.off('entityComponentAdded', onAddComponent);
      game.archetypeManager.off('entityComponentRemoved', onRemoveComponent);
    };
  }, [entityId]);

  if (!entityId) {
    return <React.Fragment>No entity</React.Fragment>;
  }

  return (
    <React.Fragment key={entityId}>
      <PanelHeader>
        <h3>{entityId}</h3>
        <AddComponentButton entityId={entityId} />
      </PanelHeader>
      <List css={{ minWidth: 400 }}>
        {components.map((comp) => {
          if (!comp) return null;
          return (
            <ListItem key={Object.getPrototypeOf(comp).name}>
              <ComponentEditor component={comp} />
            </ListItem>
          );
        })}
      </List>
    </React.Fragment>
  );
}
