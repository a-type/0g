import { BodyShape } from './types';
import { Component, State } from '0g';
import { b2Body } from '@flyover/box2d';
import { EntityContact } from './ContactListener';

export class Transform extends Component(() => ({
  x: 0,
  y: 0,
  angle: 0,
})) {
  get position() {
    return {
      x: this.x,
      y: this.y,
    };
  }
}

export class BodyConfig extends Component(() => ({
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
})) {}

export class Body extends State(() => ({
  value: (null as any) as b2Body,
})) {}

export class Contacts extends State(() => ({
  began: new Array<EntityContact>(),
  ended: new Array<EntityContact>(),
  current: new Array<EntityContact>(),
})) {}

export class ContactsCache extends State(() => ({
  began: new Set<EntityContact>(),
  ended: new Set<EntityContact>(),
})) {
  onBeginContact(contact: EntityContact) {
    this.began.add(contact);
    this.updated = true;
  }
  onEndContact(contact: EntityContact) {
    this.ended.add(contact);
    this.updated = true;
  }
}

export class WorldConfig extends Component(() => ({
  gravity: { x: 0, y: 0 },
})) {}
