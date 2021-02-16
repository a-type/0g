import { ComponentType } from '0g';
import { useGame } from '@0g/react';
import * as React from 'react';
import {
  MenuArrow,
  MenuContent,
  MenuItem,
  MenuLabel,
  MenuRoot,
  MenuTrigger,
} from './components/Menu';

export type AddComponentButtonProps = { entityId: number };

export function AddComponentButton({ entityId }: AddComponentButtonProps) {
  const game = useGame();
  const addComponent = (C: ComponentType) => {
    game.archetypeManager.addComponent(entityId, new C());
  };

  return (
    <MenuRoot>
      <MenuTrigger>Add Component</MenuTrigger>
      <MenuContent>
        <MenuLabel>Component Type</MenuLabel>
        {game.componentManager.componentTypes.map((Type) => (
          <MenuItem key={Type.id} onClick={() => addComponent(Type)}>
            {Type.name}
          </MenuItem>
        ))}
        <MenuArrow />
      </MenuContent>
    </MenuRoot>
  );
}
