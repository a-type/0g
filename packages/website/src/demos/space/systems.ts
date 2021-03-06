import { any, changed, compose, makeEffect, makeSystem } from '0g';
import { vecNormalize, vecScale } from 'math2d';
import { Body, Contacts, Transform } from '../common/box2d/components';
import {
  Asteroid,
  Bullet,
  ColliderTag,
  Damageable,
  Player,
  Sprite,
  SpriteConfig,
} from './components';
import { asteroidPrefab, bulletPrefab } from './prefabs';
import { createSVGElement } from './utils';

const createSpriteEffect = makeEffect([SpriteConfig], async (entity, game) => {
  const element = createSVGElement('g');
  const pathEl = createSVGElement('path');
  const { path, stroke, dashGap } = entity.get(SpriteConfig);
  pathEl.setAttribute('d', path);
  pathEl.setAttribute('stroke', stroke);
  pathEl.setAttribute('stroke-width', '1px');
  pathEl.setAttribute('vector-effect', 'non-scaling-stroke');
  pathEl.setAttribute(
    'stroke-dasharray',
    dashGap ? dashGap.toString() : 'none'
  );
  element.appendChild(pathEl);

  const root = await game.globals.load('root');

  root.appendChild(element);

  game.add(entity.id, Sprite, { element, path: pathEl });

  return () => {
    game.remove(entity.id, Sprite);
    root.removeChild(element);
  };
});

const updateSpriteSystem = makeSystem(
  [changed(SpriteConfig), Sprite],
  (entity) => {
    const { path, stroke, dashGap } = entity.get(SpriteConfig);
    const { path: pathEl } = entity.get(Sprite);
    pathEl.setAttribute('d', path);
    pathEl.setAttribute('stroke', stroke);
    pathEl.setAttribute(
      'stroke-dasharray',
      dashGap ? dashGap.toString() : 'none'
    );
  }
);

const transformSpriteSystem = makeSystem(
  [changed(Transform), Sprite],
  (entity) => {
    const { element } = entity.get(Sprite);
    const { x, y, angle } = entity.get(Transform);
    element.setAttribute(
      'transform',
      `translate(${x}, ${y}) rotate(${angle * (180 / Math.PI)})`
    );
  }
);

const asteroidInitialSpinEffect = makeEffect([Asteroid, Body], (entity) => {
  entity.get(Body).value.SetAngularVelocity(Math.random() - 0.5);
});

const bulletInitialVelocityEffect = makeEffect(
  [Bullet, Transform, Body],
  (entity) => {
    // get forward direction
    const angle = entity.get(Transform).angle;
    const forward = { x: Math.cos(angle), y: Math.sin(angle) };
    entity
      .get(Body)
      .value.ApplyLinearImpulseToCenter(
        vecScale(forward, entity.get(Bullet).speed)
      );
  }
);

const playerMovementSystem = makeSystem(
  [Player, Body, Transform],
  (entity, game) => {
    const keyboard = game.globals.immediate('keyboard')!;

    let rotation = 0;
    if (keyboard.getKeyPressed('a')) {
      rotation -= 1;
    }
    if (keyboard.getKeyPressed('d')) {
      rotation += 1;
    }

    let thrust = 0;
    if (keyboard.getKeyPressed('w')) {
      thrust += 1;
    }
    if (keyboard.getKeyPressed('s')) {
      thrust -= 1;
    }

    const { rotateSpeed, thrustForce } = entity.get(Player);

    const body = entity.get(Body);
    body.value.SetAngularVelocity(rotation * rotateSpeed);
    // get forward for thrust
    const angle = entity.get(Transform).angle;
    const forward = { x: Math.cos(angle), y: Math.sin(angle) };
    body.value.ApplyLinearImpulseToCenter(
      vecScale(forward, thrust * thrustForce),
      true
    );
  }
);

const damageSystem = makeSystem(
  [Damageable, changed(Contacts)],
  (entity, game) => {
    const contacts = entity.get(Contacts);
    const damageable = entity.get(Damageable);
    let tookDamage = false;
    for (const contact of contacts.began) {
      if (!contact.otherId) continue;

      const other = game.get(contact.otherId);
      const colliderTag = other?.get(ColliderTag);

      if (!colliderTag) continue;

      tookDamage =
        tookDamage || damageable.damageFrom.includes(colliderTag.group);
    }
    if (tookDamage) {
      damageable.addDamage();
    }
  }
);

const damageCooldownSystem = makeSystem([Damageable], (entity) => {
  entity.get(Damageable).tickInvulnerability();
});

const shootSystem = makeSystem([Player, Transform], (entity, game) => {
  const keyboard = game.globals.immediate('keyboard')!;

  if (keyboard.getKeyDown(' ') || keyboard.getKeyDown('Control')) {
    const { x, y, angle } = entity.get(Transform);
    bulletPrefab(game, { x, y, angle });
  }
});

const playerDestroySystem = makeSystem(
  [Player, changed(Damageable)],
  (entity, game) => {
    const damageable = entity.get(Damageable);
    if (damageable.dead) {
      game.destroy(entity.id);
    }
  }
);

const asteroidDestroySystem = makeSystem(
  [Asteroid, changed(Damageable), Transform],
  (entity, game) => {
    const damageable = entity.get(Damageable);
    if (damageable.dead) {
      const { x, y } = entity.get(Transform);
      const { size } = entity.get(Asteroid);

      if (size > 0) {
        // create more!
        for (let i = 0; i < 2; i++) {
          asteroidPrefab(game, {
            size: size - 1,
            x: x + Math.random() - 0.5,
            y: y + Math.random() - 0.5,
          });
        }
      }

      game.destroy(entity.id);
    }
  }
);

const bulletDestroySystem = makeSystem(
  [Bullet, changed(Contacts)],
  (entity, game) => {
    for (const contact of entity.get(Contacts).began) {
      if (!contact.otherId) continue;

      const other = game.get(contact.otherId);
      const colliderTag = other?.get(ColliderTag);

      if (colliderTag?.group !== 'asteroid') continue;

      game.destroy(entity.id);
    }
  }
);

const asteroidRecoilSystem = makeSystem(
  [Asteroid, Body, Transform, changed(Contacts)],
  (entity, game) => {
    const transform = entity.get(Transform);
    for (const contact of entity.get(Contacts).began) {
      if (!contact.otherId) continue;

      const other = game.get(contact.otherId);

      if (!other) continue;

      const colliderTag = other.get(ColliderTag);

      if (colliderTag?.group !== 'bullet') continue;

      const otherTransform = other.get(Transform);

      if (!otherTransform) continue;

      // a rough collision normal calculation using difference
      // of both objects' positions.
      const direction = {
        x: transform.x - otherTransform.x,
        y: transform.y - otherTransform.y,
      };
      const normal = vecNormalize(direction);

      const body = entity.get(Body);
      body.value.ApplyLinearImpulseToCenter(
        vecScale(normal, body.value.GetMass()),
        true
      );
    }
  }
);

const damageVisualizerSystem = makeSystem(
  [changed(Damageable), SpriteConfig],
  (entity) => {
    const { health, maxHealth } = entity.get(Damageable);
    const gap =
      health === maxHealth ? 0 : Math.round((health / maxHealth) * 10);
    entity.get(SpriteConfig).update((self) => (self.dashGap = gap));
  }
);

const cleanupBulletsSystem = makeSystem(
  [Bullet, changed(Transform)],
  (entity, game) => {
    const { x, y } = entity.get(Transform);
    if (x < -10 || x > 110 || y < -10 || y > 110) {
      game.destroy(entity.id);
    }
  }
);

function wrap(v: number, buffer = 2) {
  const size = 100 + buffer * 2;
  return v > 100 + buffer ? v - size : v < -buffer ? v + size : v;
}
const wrapObjectsSystem = makeSystem(
  [any(Player, Asteroid), Transform, Body],
  (entity, game) => {
    const transform = entity.get(Transform);
    const wrappedX = wrap(transform.x);
    const wrappedY = wrap(transform.y);

    if (wrappedX !== transform.x || wrappedY !== transform.y) {
      const body = entity.get(Body);
      body.value.SetPositionXY(wrappedX, wrappedY);
    }
  }
);

export const systems = compose(
  createSpriteEffect,
  updateSpriteSystem,
  transformSpriteSystem,
  asteroidInitialSpinEffect,
  bulletInitialVelocityEffect,
  playerMovementSystem,
  damageSystem,
  damageCooldownSystem,
  shootSystem,
  playerDestroySystem,
  asteroidDestroySystem,
  bulletDestroySystem,
  damageVisualizerSystem,
  cleanupBulletsSystem,
  wrapObjectsSystem,
  asteroidRecoilSystem
);
