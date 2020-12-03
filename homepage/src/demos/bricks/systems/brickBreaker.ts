import * as r2d from '../../../../..';
import { EntityContact } from '../../../common/plugins/box2d';
import { contacts } from '../../../common/stores/contacts';
import { game } from '../game';

export const brickBreaker = game.system<{
  contacts: ReturnType<typeof contacts>;
}>({
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
        ctx.world.remove(other.id);
      }
    }
  },
});
