import * as g from '0g';
import { EntityContact } from './ContactListener';
import { IVec, vecAdd } from 'math2d';
import { DEFAULT_WORLD_NAME } from './constants';

export const transform = g.store('transform', {
  x: 0,
  y: 0,
  angle: 0,
  get position() {
    return {
      x: this.x,
      y: this.y,
    };
  },
});

export type BodyConfigData = {
  friction?: number;
  isStatic?: boolean;
  angle?: number;
  restitution?: number;
  bullet?: boolean;
  fixedRotation?: boolean;
  density?: number;
  angularDamping?: number;
  linearDamping?: number;
  worldName?: string;
} & (
  | {
      shape: 'circle';
      radius: number;
    }
  | {
      shape: 'rectangle';
      width: number;
      height: number;
    }
);

export const body = g.store('body', {
  mass: 0,
  velocity: { x: 0, y: 0 },
  angularVelocity: 0,
  config: {
    shape: 'circle',
    radius: 1,
    density: 1,
    frictionAir: 0,
    friction: 0,
    isStatic: false,
    angle: 0,
    restitution: 0,
    bullet: false,
    fixedRotation: false,
    worldName: DEFAULT_WORLD_NAME,
  } as BodyConfigData,
  forces: {
    velocity: null as IVec | null,
    impulse: null as IVec | null,
    force: null as IVec | null,
    addVelocity(vel: IVec) {
      this.velocity = vecAdd(this.velocity ?? { x: 0, y: 0 }, vel);
    },
    addImpulse(force: IVec) {
      this.impulse = vecAdd(this.impulse ?? { x: 0, y: 0 }, force);
    },
    addForce(force: IVec) {
      this.force = vecAdd(this.force ?? { x: 0, y: 0 }, force);
    },
  },
});

export const contacts = g.store('contacts', {
  began: new Array<EntityContact>(),
  current: new Array<EntityContact>(),
  ended: new Array<EntityContact>(),
});

export const worldConfig = g.store('worldConfig', {
  gravity: { x: 0, y: 0 },
  velocityIterations: 8,
  positionIterations: 3,
  particleIterations: undefined as number | undefined,
  /** This is used in the game's globals registry */
  worldName: DEFAULT_WORLD_NAME as string | undefined,
});
