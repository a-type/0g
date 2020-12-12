import { System } from '0g';
import { EntityContact, systems as box2dSystems } from '@0g/box2d';
import { vecGetLength } from 'math2d';
import { stores } from './stores';

export const { rigidBody, physicsWorld } = box2dSystems;

export const ballMovement = new System({
  name: 'ballMovement',
  requires: [stores.ballConfig],
  state: {
    started: false,
  },
  run: (entity, state) => {
    const transform = stores.transform.get(entity)!;
    const body = stores.body.get(entity)!;
    const config = stores.ballConfig.get(entity)!;

    if (!state.started) {
      state.started = true;
      // TODO: transform.position = setter
      transform.x = 0;
      transform.y = 0;
      const currentSpeed = vecGetLength(body.velocity);
      if (currentSpeed < config.speed) {
        body.forces.addImpulse({
          x: 0,
          y: (config.speed - currentSpeed) * body.mass,
        });
      }
    }

    if (transform.y > 75) {
      state.started = false;
      body.velocity = { x: 0, y: 0 };
    }
  },
});

export const brickBreaker = new System({
  name: 'brickBreaker',
  requires: [stores.ballConfig],
  run: (entity, _, ctx) => {
    const contacts = stores.contacts.get(entity)!;
    let contact: EntityContact;
    for (contact of contacts.began) {
      if (!contact.otherId) continue;
      const other = ctx.game.get(contact.otherId);
      if (!other) continue;
      const info = stores.blockInfo.get(other);
      if (!info) continue; // not a block
      const spawnerId = info.spawnerId!;
      const spawner = ctx.game.get(spawnerId)!;
      stores.blocksConfig.get(spawner)?.removeBlock(info.key!);
      // also make paddle a little smaller
      const paddle = ctx.game.get('paddle')!;
      const paddleBody = stores.body.get(paddle)!;
      if (paddleBody.config.shape === 'rectangle') {
        paddleBody.config.width *= 0.9;
      }
    }
  },
});

export const paddleMovement = new System({
  name: 'paddleMovement',
  requires: [stores.paddleConfig],
  state: {
    initialY: null as null | number,
  },
  run: (entity, state, ctx) => {
    const transform = stores.transform.get(entity)!;
    const body = stores.body.get(entity)!;
    const config = stores.paddleConfig.get(entity)!;

    if (state.initialY === null) state.initialY = transform.y;

    const velocity = { x: 0, y: 0 };
    if (
      ctx.game.input.keyboard.getKeyPressed('a') ||
      ctx.game.input.keyboard.getKeyPressed('ArrowLeft')
    ) {
      velocity.x -= config.speed;
    } else if (
      ctx.game.input.keyboard.getKeyPressed('d') ||
      ctx.game.input.keyboard.getKeyPressed('ArrowRight')
    ) {
      velocity.x += config.speed;
    }

    body.forces.addVelocity(velocity);
    // transform.y = state.initialY || transform.y;
  },
});
