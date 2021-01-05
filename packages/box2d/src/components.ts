import { ContactListener, EntityContact } from './ContactListener';
import { DEFAULT_WORLD_NAME } from './constants';
import { BodyShape } from './types';
import { b2Body, b2World } from '@flyover/box2d';
import { Component, StateComponent } from '0g';

export class Transform extends Component {
  x = 0;
  y = 0;
  angle = 0;
  get position() {
    return {
      x: this.x,
      y: this.y,
    };
  }
}

export class BodyConfig extends Component {
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
}

export class Body extends StateComponent {
  value: b2Body = (null as unknown) as b2Body;
}

export class Contacts extends StateComponent {
  began = new Array<EntityContact>();
  current = new Array<EntityContact>();
  ended = new Array<EntityContact>();
}

export class ContactsCache extends StateComponent {
  began = new Set<EntityContact>();
  ended = new Set<EntityContact>();
  onBeginContact(contact: EntityContact) {
    this.began.add(contact);
  }
  onEndContact(contact: EntityContact) {
    this.ended.add(contact);
  }
}

export class WorldConfig extends Component {
  gravity = { x: 0, y: 0 };
  velocityIterations = 8;
  positionIterations = 3;
  particleIterations = undefined as number | undefined;
  /** This is used in the game's globals registry */
  worldName = DEFAULT_WORLD_NAME as string | undefined;
}

export class World extends StateComponent {
  value: b2World = (null as unknown) as b2World;
  contacts: ContactListener = (null as unknown) as ContactListener;
}
