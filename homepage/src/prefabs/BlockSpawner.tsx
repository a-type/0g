import { r2d } from '../../../src';
import { blockSpawner } from '../systems/blockSpawner';

export const BlockSpawner = r2d.prefab({
  name: 'BlockSpawner',
  systems: {
    blockSpawner: blockSpawner,
  },
  Component: () => null,
});
