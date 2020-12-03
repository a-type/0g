import * as r2d from '../../../..';
import * as stores from '../stores';

export const demoMovement = new r2d.System<undefined, typeof stores>({
  name: 'demoMovement',
  runsOn: (prefab) => !!prefab.stores.useDemoMovement,
  run: (entity, _, { frame: { delta }, entity: { id } }) => {
    console.debug(`running on ${id}`);
    const transform = entity.getStore('transform');
    transform.x = Math.cos(delta / 1000) * 100;
    transform.y = Math.sin(delta / 1000) * 100;
  },
});
