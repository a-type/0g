import { r2d } from '../../../../..';
import { transform } from '../../../common/stores/transform';

export const BlockSpawner = r2d.prefab({
  name: 'BlockSpawner',
  stores: {
    transform: transform(),
    spawnerConfig: r2d.store('blockSpawnerConfig', {
      horizontalCount: 6,
      verticalCount: 3,
      blockWidth: 5,
      blockHeight: 2.5,
    })(),
  },
  Component: () => null,
});
