import { EntityContact } from '@r2d/box2d';
import { game } from '../game';

export const brickBreaker = game.system({
  name: 'brickBreaker',
  runsOn: (prefab) => prefab.name === 'Ball',
  run: (entity, _, ctx) => {
    const contacts = game.stores.contacts.get(entity)!;
    let contact: EntityContact;
    for (contact of contacts.began) {
      // not a game object?
      if (!contact.otherId) continue;
      const other = ctx.world.get(contact.otherId);
      if (!other) continue;
      if (other.prefab === 'Block') {
        const spawnerStore = game.stores.blockSpawner.get(other);
        if (!spawnerStore) throw new Error('Block without spawnerStore?');
        const spawnerId = spawnerStore.id!;
        const spawner = ctx.world.get(spawnerId);
        if (!spawner) throw new Error('No spawner');
        // tell spawner to stop rendering it
        game.stores.spawnerConfig.get(spawner)!.blocks[
          other.storesData.spawner.x
        ][other.storesData.spawner.y] = false;
      }
    }
  },
});
