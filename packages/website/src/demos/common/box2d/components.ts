import { BodyShape } from './types.js';
import { namespace } from '0g';
import { b2Body } from '@flyover/box2d';
import { EntityContact } from './ContactListener.js';

const { component, state } = namespace('box2d');

export const Transform = component(
  'Transform',
  () => ({
    x: 0,
    y: 0,
    angle: 0,
  }),
  {
    extensions: {
      position(i) {
        return {
          x: i.x,
          y: i.y,
        };
      },
    },
  },
);

export const BodyConfig = component('BodyConfig', () => ({
  shape: {
    shape: 'circle',
    radius: 1,
  } as BodyShape,
  density: 1,
  friction: 0,
  // TODO: literal string to include kinematic
  isStatic: false,
  angle: 0,
  restitution: 0,
  bullet: false,
  fixedRotation: false,
  angularDamping: 0,
  linearDamping: 0,
  sensor: false,
}));

export const Body = state('Body', () => ({
  value: null as any as b2Body,
}));

export const Contacts = state('Contacts', () => ({
  began: new Array<EntityContact>(),
  ended: new Array<EntityContact>(),
  current: new Array<EntityContact>(),
}));

export const ContactsCache = state(
  'ContactsCache',
  () => ({
    began: new Set<EntityContact>(),
    ended: new Set<EntityContact>(),
  }),
  {
    extensions: {
      onBeginContact: (i) => (contact: EntityContact) => {
        i.began.add(contact);
        i.$.changed = true;
      },
      onEndContact: (i) => (contact: EntityContact) => {
        i.ended.add(contact);
        i.$.changed = true;
      },
    },
  },
);

export const WorldConfig = component('WorldConfig', () => ({
  gravity: { x: 0, y: 0 },
}));
