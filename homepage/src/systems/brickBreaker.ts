import { r2d } from '../../../src';
import { EntityContact } from '../plugins/box2d';
import { contacts } from '../stores/contacts';

export const brickBreaker = r2d.system({
  stores: {
    contacts: contacts,
  },
  run: ({ contacts }, _, ctx) => {
    let contact: EntityContact;
    for (contact of contacts.began) {
      // not a game object?
      if (!contact.otherId) continue;
      const other = ctx.get(contact.otherId);
      if (!other) continue;
      if (other.prefab === 'Block') {
        ctx.destroy(other.id);
      }
    }
  },
});
