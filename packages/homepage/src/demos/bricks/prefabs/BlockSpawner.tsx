import * as r2d from 'r2d';
import { box2d } from '../../../common/plugins';

export const BlockSpawner = r2d.prefab({
  name: 'BlockSpawner',
  stores: {
    transform: box2d.stores.transform(),
    spawnerConfig: r2d.store('blockSpawnerConfig', {
      horizontalCount: 6,
      verticalCount: 3,
      blockWidth: 5,
      blockHeight: 2.5,
    })(),
  },
  Component: () => null,
});
