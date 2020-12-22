import * as g from '0g';
import { ContactListener, EntityContact } from './ContactListener';
import { DEFAULT_WORLD_NAME } from './constants';
import { BodyShape } from './types';
import { b2Body, b2World } from '@flyover/box2d';

export const transform = g.store(
  class Transform {
    x = 0;
    y = 0;
    angle = 0;
    get position() {
      return {
        x: this.x,
        y: this.y,
      };
    }
  },
  'persistent',
  'box2d_transform'
);

export const bodyConfig = g.store(
  class BodyConfig {
    shape = {
      shape: 'circle',
      radius: 1,
    } as BodyShape;
    density = 1;
    friction = 0;
    // TODO: literal string to include kinematic
    isStatic = false;
    angle = 0;
    restitution = 0;
    bullet = false;
    fixedRotation = false;
    angularDamping = 0;
    linearDamping = 0;
    worldName = DEFAULT_WORLD_NAME;
  },
  'persistent',
  'box2d_bodyConfig'
);

export const body = g.store(
  class Body {
    value: b2Body = (null as unknown) as b2Body;
    __cleanup = () => {};
  },
  'state',
  'box2d_body'
);

export const contacts = g.store(
  class Contacts {
    began = new Array<EntityContact>();
    current = new Array<EntityContact>();
    ended = new Array<EntityContact>();
  },
  'persistent',
  'box2d_contacts'
);

export const contactsCache = g.store(
  class ContactsCache {
    began = new Set<EntityContact>();
    ended = new Set<EntityContact>();
    onBeginContact(contact: EntityContact) {
      this.began.add(contact);
    }
    onEndContact(contact: EntityContact) {
      this.ended.add(contact);
    }
  },
  'state',
  'box2d_contactsCache'
);

export const worldConfig = g.store(
  class WorldConfig {
    gravity = { x: 0, y: 0 };
    velocityIterations = 8;
    positionIterations = 3;
    particleIterations = undefined as number | undefined;
    /** This is used in the game's globals registry */
    worldName = DEFAULT_WORLD_NAME as string | undefined;
  },
  'persistent',
  'box2d_worldConfig'
);

export const world = g.store(
  class World {
    value: b2World = (null as unknown) as b2World;
    contacts: ContactListener = (null as unknown) as ContactListener;
  },
  'state',
  'box2d_world'
);
