import { Component, State } from '0g';

export class Player extends Component(() => ({
  rotateSpeed: 3,
  thrustForce: 2,
})) {}

export class Damageable extends Component(() => ({
  maxHealth: 3,
  health: 3,
  invulnerableFrames: 5 * 60, // ~5s,
  damageFrom: ['bullet'],
})) {
  // ephemeral state
  private __invulnerableTimer = 0;
  addDamage(force = false) {
    if (!this.vulnerable && !force) return;
    this.health = Math.max(0, this.health - 1);
    this.__invulnerableTimer = this.invulnerableFrames;
    this.updated = true;
  }
  get vulnerable() {
    return this.__invulnerableTimer === 0;
  }
  get dead() {
    return this.health === 0;
  }
  tickInvulnerability() {
    this.__invulnerableTimer = Math.max(0, this.__invulnerableTimer - 1);
  }
}

export class ColliderTag extends Component(() => ({
  group: 'bullet',
})) {}

export class Asteroid extends Component(() => ({
  size: 3,
  variant: Math.floor(Math.random() * 3),
})) {}

export class Bullet extends Component(() => ({
  speed: 8,
})) {}

export class SpriteConfig extends Component(() => ({
  path: 'm 0 0 l 5 0 l 0 5 l -5 0 l 0 -5',
  stroke: 'white',
  dashGap: 0,
})) {}

export class Sprite extends State(() => ({
  element: (null as any) as SVGGElement,
  path: (null as any) as SVGPathElement,
})) {}
