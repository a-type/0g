import { System } from '0g';
import { EntityContact, systems as box2dSystems } from '0g-box2d';
import { vecNormalize, vecScale } from 'math2d';
import { components } from './components';

export const { PhysicsWorld } = box2dSystems;

export class BallMovement extends System {
  balls = this.query({
    all: [
      components.BallConfig,
      components.BallState,
      components.Transform,
      components.Contacts,
      components.Body,
    ],
    none: [],
  });
  uninitialized = this.query({
    all: [components.BallConfig],
    none: [components.BallState],
  });

  initBalls = this.step(this.uninitialized, (entity) => {
    entity.add(components.BallState, { needsLaunch: true });
  });

  run = this.step(this.balls, (entity) => {
    const transform = entity.get(components.Transform);
    const body = entity.get(components.Body);
    const config = entity.get(components.BallConfig);
    const contacts = entity.get(components.Contacts);
    const state = entity.get(components.BallState);

    if (Math.abs(transform.y) > 75 || Math.abs(transform.x) > 75) {
      body.value.SetPositionXY(0, 0);
      body.mark();
    }

    const currentSpeed = body.value.GetLinearVelocity().Length();

    // just exited a collision?
    if (state.needsLaunch) {
      body.value.ApplyLinearImpulseToCenter({
        x: 0,
        y: config.speed * body.value.GetMass(),
      });
      body.mark();
      state.set({ needsLaunch: false });
    } else if (!!contacts.ended.length && !contacts.current.length) {
      // speed up to required speed
      if (Math.abs(currentSpeed - config.speed) > 0.1) {
        body.value.ApplyLinearImpulseToCenter(
          vecScale(
            vecNormalize(body.value.GetLinearVelocity()),
            (config.speed - currentSpeed) * body.value.GetMass()
          )
        );
        body.mark();
      }
    }
  });
}

export class BrickBreaker extends System {
  balls = this.query({
    all: [components.BallConfig, components.Contacts],
    none: [],
  });

  run = this.step(this.balls, (entity) => {
    const contacts = entity.get(components.Contacts);
    let contact: EntityContact;
    for (contact of contacts.began) {
      if (!contact.otherId) continue;
      const other = this.game.get(contact.otherId);
      if (!other) continue;
      const info = other.maybeGet(components.BlockInfo);
      if (!info) continue; // not a block
      this.game.destroy(other.id);
      // also make paddle a little smaller
      const paddle = this.game.get('paddle')!;
      const paddleBodyConfig = paddle.get(components.BodyConfig);
      if (paddleBodyConfig.shape.shape === 'rectangle') {
        paddleBodyConfig.shape.width *= 0.9;
        paddleBodyConfig.mark();
      }
    }
  });
}

export class PaddleMovement extends System {
  paddles = this.query({
    all: [components.PaddleConfig, components.Body, components.Transform],
    none: [],
  });

  run = this.step(this.paddles, (entity) => {
    const body = entity.get(components.Body);
    const config = entity.get(components.PaddleConfig);

    const velocity = { x: 0, y: 0 };
    if (
      this.game.input.keyboard.getKeyPressed('a') ||
      this.game.input.keyboard.getKeyPressed('ArrowLeft')
    ) {
      velocity.x -= config.speed;
    } else if (
      this.game.input.keyboard.getKeyPressed('d') ||
      this.game.input.keyboard.getKeyPressed('ArrowRight')
    ) {
      velocity.x += config.speed;
    }

    body.value.SetLinearVelocity(velocity);
    body.mark();
  });
}

export class DebrisCleanup extends System {
  debris = this.query({
    all: [components.DebrisConfig, components.Transform],
    none: [],
  });

  run = this.step(this.debris, (entity) => {
    const transform = entity.get(components.Transform);
    if (Math.abs(transform.x) > 75 || Math.abs(transform.y) > 75) {
      this.game.destroy(entity.id);
    }
  });
}

export class BlockSpawner extends System {
  spawner = this.query({
    all: [components.BlocksConfig, components.Transform],
    none: [],
  });

  run = this.step(this.spawner, (entity) => {
    const config = entity.get(components.BlocksConfig);
    if (config.alreadySpawned) return;
    config.set({ alreadySpawned: true });

    const { x, y } = entity.get(components.Transform);

    const totalWidth =
      config.blocks.reduce((max, row) => Math.max(max, row.length), 0) *
      config.blockWidth;
    const totalHeight = config.blocks.length * config.blockHeight;

    const hOffset = -totalWidth / 4;
    const vOffset = -totalHeight / 4;

    config.blocks.forEach((row, h) => {
      row.forEach((info, v) => {
        if (info) {
          this.game
            .create(info.key)
            .add(components.Transform, {
              x: x + v * config.blockWidth + hOffset,
              y: y + h * config.blockHeight + vOffset,
            })
            .add(components.BodyConfig, {
              shape: {
                shape: 'rectangle',
                width: config.blockWidth,
                height: config.blockHeight,
              },
            })
            .add(components.BlockInfo, {
              spawnerId: entity.id,
              key: info.key,
              fontSize: config.fontSize,
              text: info.text,
            });
        }
      });
    });
  });
}

export class DebrisSpawner extends System {
  spawner = this.query({
    all: [components.DebrisControllerConfig],
    none: [],
  });

  run = this.step(this.spawner, (entity) => {
    const config = entity.get(components.DebrisControllerConfig);
    if (config.alreadySpawned) return;
    config.set({ alreadySpawned: true });

    config.items.forEach((d, i) => {
      this.game
        .create(`debris-${d.key}`)
        .add(components.Transform, {
          x: d.x,
          y: d.y,
          angle: d.angle,
        })
        .add(components.BodyConfig, {
          shape: {
            shape: 'rectangle',
            width: d.size,
            height: d.size,
          },
        })
        .add(components.DebrisConfig, {
          text: d.text,
          index: i,
        });
    });
  });
}
