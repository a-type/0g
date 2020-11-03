import * as p from 'planck-js';
import { useCallback, useEffect } from 'react';
import { Entity } from '../behaviors';
import { usePhysics } from './Physics';

export type ContactEvent = {
  self: p.Fixture;
  other: p.Fixture;
  contact: p.Contact;
};

export function useContactEvents(
  body: p.Body,
  events: {
    onBeginContact?: (ev: ContactEvent) => void;
    onEndContact?: (ev: ContactEvent) => void;
  }
) {
  const world = usePhysics();

  // subscribe to world collision events and filter for our own
  // TODO: optimize
  const { onBeginContact, onEndContact } = events || {};
  useEffect(() => {
    function wrapContactHandler(handler?: (ev: ContactEvent) => void) {
      return function (contact: p.Contact) {
        const bodyA = contact.getFixtureA().getBody();
        const bodyB = contact.getFixtureB().getBody();
        if (bodyA === body) {
          handler?.({
            self: contact.getFixtureA(),
            other: contact.getFixtureB(),
            contact,
          });
        } else if (bodyB === body) {
          handler?.({
            self: contact.getFixtureB(),
            other: contact.getFixtureA(),
            contact,
          });
        }
      };
    }

    const handleBeginContact = wrapContactHandler(onBeginContact);
    world.on('begin-contact', handleBeginContact);

    const handleEndContact = wrapContactHandler(onEndContact);
    world.on('end-contact', handleEndContact);

    return function () {
      world.off('begin-contact', handleBeginContact);
      world.off('end-contact', handleEndContact);
    };
  }, [world, onBeginContact, onEndContact, body]);
}

export const useContacts = (
  entity: Entity<{ contacts: Set<p.Contact>; body: p.Body }>
) => {
  const onBeginContact = useCallback(
    (ev: ContactEvent) => {
      entity.contacts.add(ev.contact);
    },
    [entity]
  );
  const onEndContact = useCallback(
    (ev: ContactEvent) => {
      entity.contacts.delete(ev.contact);
    },
    [entity]
  );

  useContactEvents(entity.body, {
    onBeginContact,
    onEndContact,
  });
};
