import { Game } from '0g';
import {
  Asteroid,
  Bullet,
  ColliderTag,
  Damageable,
  Player,
  SpriteConfig,
} from './components';
import {
  Transform,
  BodyConfig,
  Contacts,
  WorldConfig,
} from '../common/box2d/components';

export function playerPrefab(game: Game, { x, y }: { x: number; y: number }) {
  const id = game.create();
  game.add(id, Player);
  game.add(id, SpriteConfig, {
    path: 'm -2 -2 l 4 2 l -4 2 l 1 -2 l -1 -2',
  });
  game.add(id, Transform, { x, y });
  game.add(id, BodyConfig, {
    shape: {
      shape: 'polygon',
      vertices: [
        { x: -2, y: -2 },
        { x: 2, y: 0 },
        { x: -2, y: 2 },
        { x: -1, y: 0 },
      ],
    },
    angularDamping: 0.01,
    linearDamping: 0.01,
    restitution: 0.5,
  });
  game.add(id, Contacts);
  game.add(id, Damageable, { damageFrom: ['asteroid'] });
  game.add(id, ColliderTag, { group: 'player' });
  return id;
}

// 3 sizes x 3 variants
const asteroidPaths = [
  [
    'm 0 -1 l 1 1 l 0 1 l -2 0 l 1 -2',
    'm 0 -1 l 1 1 l -1 1 l -1 -1 l 1 -1',
    'm 0 -1 l 1 1 l -1 1 l 0 -1 l 0 -1',
  ],
  [
    'm 0.5 -2.5 l 2 1 l 0 2 l -1 1 l -1 0 l -1 1 l -2 -1 l 1 -3 l 2 -1',
    'm -0.5 -2.5 l 2 1 l 1 2 l -1 2 l -3 0 l -1 -2 l 1 -1 l -1 -1 l 2 -1',
    'm 0.5 -2.5 l 2 2 l -1 1 l 0 1 l -2 1 l -2 -2 l 0 -1 l 1 -1 l 2 -1',
  ],
  [
    'm 0 -4 l 3 1 l 0 1 l -1 1 l 2 1 l 0 2 l -3 2 l -3 -2 l -1 1 l -1 -3 l 1 -3 l 3 -1',
    'm -2 -3 l 3 -1 l 2 1 l 1 1 l -1 2 l -1 3 l -3 1 l -1 -2 l -1 0 l -1 -3 l 2 -1 l 0 -1',
    'm -3 -3 l 5 -1 l 2 1 l 0 3 l -1 1 l -2 2 l -3 1 l -1 -1 l 0 -2 l 1 -1 l -1 -1 l 0 -2',
  ],
];
const asteroidSizes = [1, 3, 5];

export function asteroidPrefab(
  game: Game,
  { size, x, y }: { size: number; x: number; y: number }
) {
  const id = game.create();
  const variant = Math.floor(Math.random() * 3);
  game.add(id, Asteroid, {
    size,
    variant,
  });
  game.add(id, SpriteConfig, {
    path: asteroidPaths[size][variant],
  });
  game.add(id, Transform, { x, y });
  game.add(id, BodyConfig, {
    shape: {
      shape: 'circle',
      radius: asteroidSizes[size],
    },
    restitution: 0.5,
    angularDamping: 0,
    linearDamping: 0,
    density: 0.5,
  });
  game.add(id, Contacts);
  game.add(id, Damageable, {
    invulnerableFrames: 0,
    damageFrom: ['bullet', 'player'],
  });
  game.add(id, ColliderTag, { group: 'asteroid' });
  return id;
}

export function bulletPrefab(
  game: Game,
  { x, y, angle }: { x: number; y: number; angle: number }
) {
  const id = game.create();
  game.add(id, Bullet);
  game.add(id, SpriteConfig, {
    path: 'M 0 0 L 1 0',
  });
  game.add(id, Transform, { x, y, angle });
  game.add(id, BodyConfig, {
    shape: {
      shape: 'rectangle',
      width: 0.5,
      height: 1,
    },
    bullet: true,
    sensor: true,
  });
  game.add(id, Contacts);
  game.add(id, ColliderTag, { group: 'bullet' });
  console.log('made bullet', id);
  (window as any).bulletId = id;
  return id;
}

export function worldPrefab(game: Game) {
  const id = game.create();
  game.add(id, WorldConfig, { gravity: { x: 0, y: 0 } });
  return id;
}
