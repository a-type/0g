import { ComponentType } from '0g';
import { useGame } from '0g-react';
import * as React from 'react';
import {
  MenuArrow,
  MenuContent,
  MenuItem,
  MenuLabel,
  MenuRoot,
  MenuTrigger,
} from './components/Menu';

export type AddComponentButtonProps = { entityId: string };

export function AddComponentButton({ entityId }: AddComponentButtonProps) {
  const game = useGame();
  const entity = game.get(entityId);
  const addComponent = (component: ComponentType) => {
    entity.add(component);
  };

  return (
    <MenuRoot>
      <MenuTrigger>Add Component</MenuTrigger>
      <MenuContent>
        <MenuLabel>Component Type</MenuLabel>
        {Object.keys(game.componentTypes).map((componentName) => (
          <MenuItem
            key={componentName}
            onClick={() => addComponent(game.componentTypes[componentName])}
          >
            {componentName}
          </MenuItem>
        ))}
        <MenuArrow />
      </MenuContent>
    </MenuRoot>
  );
}
