import * as p from 'planck-js';
import { useEffect } from 'react';
import { usePhysics } from './Physics';
import { BodyBehavior } from './useBody';

export type ContactEvent = {
  self: p.Fixture;
  other: p.Fixture;
  contact: p.Contact;
};

export function useCollisions(
  bodyBehavior: BodyBehavior,
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
        const body = bodyBehavior.getState().body;
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
  }, [world, onBeginContact, onEndContact, bodyBehavior]);
}
