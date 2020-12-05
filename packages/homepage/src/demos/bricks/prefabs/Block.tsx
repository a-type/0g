import * as React from 'react';
import * as r2d from 'r2d';
import { box2d } from '../../../common/plugins';
import { useBodyRef } from '../../../common/hooks/useBodyRef';

export const Block = r2d.prefab({
  name: 'Block',
  stores: {
    transform: box2d.stores.transform(),
    bodyConfig: box2d.stores.bodyConfig(),
    contacts: box2d.stores.contacts(),
    forces: box2d.stores.forces(),
    spawner: r2d.store('blockSpawner', {
      id: null as string | null,
      x: 0,
      y: 0,
    })(),
  },
  Component: ({ stores }) => {
    return <button ref={useBodyRef(stores)}>Boop</button>;
  },
});
