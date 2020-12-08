import * as React from 'react';
import { useBodyRef } from '../../../common/hooks/useBodyRef';
import { game } from '../game';

export const Block = game.prefab({
  name: 'Block',
  stores: {
    transform: game.stores.transform(),
    body: game.stores.body({
      config: {
        shape: 'rectangle',
        width: 5,
        height: 2.5,
        isStatic: true,
        fixedRotation: true,
      },
    }),
    contacts: game.stores.contacts(),
    spawner: game.stores.blockSpawner(),
  },
  Component: ({ stores }) => {
    return <button ref={useBodyRef(stores)}>Boop</button>;
  },
});
