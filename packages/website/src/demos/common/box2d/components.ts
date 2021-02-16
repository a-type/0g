import { BodyShape } from './types';
import { Component } from '0g';

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
}

export class WorldConfig extends Component {
  gravity = { x: 0, y: 0 };
  velocityIterations = 8;
  positionIterations = 3;
  particleIterations = undefined as number | undefined;
}
