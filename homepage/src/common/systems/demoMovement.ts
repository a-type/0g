import { r2d } from '../../../..';
import { Store } from '../../../../src';

export const demoMovement = r2d.system<{
  transform: Store<{ x: number; y: number }>;
}>({
  name: 'demoMovement',
  runsOn: (prefab) => !!prefab.stores.useDemoMovement,
  run: (stores, _, { frame: { delta }, entity: { id } }) => {
    console.debug(`running on ${id}`);
    stores.transform.x = Math.cos(delta / 1000) * 100;
    stores.transform.y = Math.sin(delta / 1000) * 100;
  },
});
