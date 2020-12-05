import { EntityContact } from '../../../common/plugins/box2d/box2d';
import { game } from '../game';

export const brickBreaker = game.system({
  name: 'brickBreaker',
  runsOn: (prefab) => prefab.name === 'Ball',
  run: (entity, _, ctx) => {
    const contacts = entity.getStore('contacts');
    let contact: EntityContact;
    for (contact of contacts.began) {
      // not a game object?
      if (!contact.otherId) continue;
      const other = ctx.world.get(contact.otherId);
      if (!other) continue;
      if (other.prefab === 'Block') {
        // TODO: store api or entity wrapper here!!!
        const spawnerId = other.storesData.spawner.id;
        const spawner = ctx.world.get(spawnerId);
        if (!spawner) throw new Error('No spawner');
        // tell spawner to stop rendering it
        spawner.storesData.spawnerConfig.blocks[other.storesData.spawner.x][
          other.storesData.spawner.y
        ] = false;
      }
    }
  },
});
