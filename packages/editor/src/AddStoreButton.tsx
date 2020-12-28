import { Store } from '0g';
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

export type AddStoreButtonProps = { entityId: string };

export function AddStoreButton({ entityId }: AddStoreButtonProps) {
  const game = useGame();
  const entity = game.get(entityId);
  const addStore = (store: Store) => {
    entity.add(store);
  };

  return (
    <MenuRoot>
      <MenuTrigger>Add Store</MenuTrigger>
      <MenuContent>
        <MenuLabel>Store Type</MenuLabel>
        {Object.keys(game.storeSpecs).map((storeName) => (
          <MenuItem
            key={storeName}
            onClick={() => addStore(game.storeSpecs[storeName])}
          >
            {storeName}
          </MenuItem>
        ))}
        <MenuArrow />
      </MenuContent>
    </MenuRoot>
  );
}
