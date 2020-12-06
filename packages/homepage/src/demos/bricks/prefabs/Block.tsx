import * as React from 'react';
import { useBodyRef } from '../../../common/hooks/useBodyRef';
import { game } from '../game';

export const Block = game.prefab({
  name: 'Block',
  stores: {
    transform: game.stores.transform(),
    bodyConfig: game.stores.bodyConfig(),
    contacts: game.stores.contacts(),
    forces: game.stores.forces(),
    spawner: game.stores.blockSpawner(),
  },
  Component: ({ stores }) => {
    return <button ref={useBodyRef(stores)}>Boop</button>;
  },
});
