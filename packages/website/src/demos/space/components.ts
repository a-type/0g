import { component, state } from '0g';

export const Player = component('Player', () => ({
  rotateSpeed: 3,
  thrustForce: 2,
}));

export const Damageable = component(
  'Damageable',
  () => ({
    maxHealth: 3,
    health: 3,
    invulnerableFrames: 5 * 60, // ~5s,
    damageFrom: ['bullet'],
    __invulnerableTimer: 0,
  }),
  {
    extensions: {
      addDamage:
        (i) =>
        (force = false) => {
          if (i.__invulnerableTimer > 0 && !force) return;
          i.health = Math.max(0, i.health - 1);
          i.__invulnerableTimer = i.invulnerableFrames;
          i.$.changed = true;
        },
      vulnerable(i) {
        return i.__invulnerableTimer === 0;
      },
      dead(i) {
        return i.health === 0;
      },
      tickInvulnerability: (i) => () => {
        i.__invulnerableTimer = Math.max(0, i.__invulnerableTimer - 1);
      },
    },
  },
);

export const ColliderTag = component('ColliderTag', () => ({
  group: 'bullet',
}));

export const Asteroid = component('Asteroid', () => ({
  size: 3,
  variant: Math.floor(Math.random() * 3),
}));

export const Bullet = component('Bullet', () => ({
  speed: 8,
}));

export const SpriteConfig = component('SpriteConfig', () => ({
  path: 'm 0 0 l 5 0 l 0 5 l -5 0 l 0 -5',
  stroke: 'white',
  dashGap: 0,
}));

export const Sprite = state('Sprite', () => ({
  element: null as any as SVGGElement,
  path: null as any as SVGPathElement,
}));
