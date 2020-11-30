import { r2d } from '../../../../..';
import { EntityContact } from '../../../common/plugins/box2d';
import { contacts } from '../../../common/stores/contacts';

export const brickBreaker = r2d.system<{
  contacts: ReturnType<typeof contacts>;
}>({
  name: 'brickBreaker',
  runsOn: prefab => prefab.name === 'Ball',
  run: ({ contacts }, _, ctx) => {
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
