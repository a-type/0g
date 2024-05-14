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
  }),
  {
    extensions: {
      addDamage:
        (i) =>
        (dmg = 1) => {
          i.health = Math.max(0, i.health - dmg);
          i.$.changed = true;
        },
      dead(i) {
        return i.health === 0;
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
