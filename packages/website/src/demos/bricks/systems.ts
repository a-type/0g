import { useGame, useQuery, useQueryFrame } from '0g';
import { EntityContact, systems as box2dSystems } from '@0g/box2d';
import { vecNormalize, vecScale } from 'math2d';
import { stores } from './stores';

export const { PhysicsWorld } = box2dSystems;

export const BallMovement = () => {
  const balls = useQuery({
    all: [
      stores.BallConfig,
      stores.BallState,
      stores.Transform,
      stores.Contacts,
      stores.Body,
    ],
    none: [],
  });
  const uninitialized = useQuery({
    all: [stores.BallConfig],
    none: [stores.BallState],
  });

  useQueryFrame(uninitialized, (entity) => {
    entity.add(stores.BallState, { needsLaunch: true });
  });

  useQueryFrame(balls, (entity) => {
    const transform = entity.get(stores.Transform);
    const body = entity.get(stores.Body);
    const config = entity.get(stores.BallConfig);
    const contacts = entity.get(stores.Contacts);
    const state = entity.get(stores.BallState);

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

  return null;
};

export const BrickBreaker = () => {
  const game = useGame();

  const balls = useQuery({
    all: [stores.BallConfig, stores.Contacts],
    none: [],
  });

  useQueryFrame(balls, (entity) => {
    const contacts = entity.get(stores.Contacts);
    let contact: EntityContact;
    for (contact of contacts.began) {
      if (!contact.otherId) continue;
      const other = game.get(contact.otherId);
      if (!other) continue;
      const info = other.maybeGet(stores.BlockInfo);
      if (!info) continue; // not a block
      game.destroy(other.id);
      // also make paddle a little smaller
      const paddle = game.get('paddle')!;
      const paddleBodyConfig = paddle.get(stores.BodyConfig);
      if (paddleBodyConfig.shape.shape === 'rectangle') {
        paddleBodyConfig.shape.width *= 0.9;
        paddleBodyConfig.mark();
      }
    }
  });

  return null;
};

export const PaddleMovement = () => {
  const game = useGame();

  const paddles = useQuery({
    all: [stores.PaddleConfig, stores.Body, stores.Transform],
    none: [],
  });

  useQueryFrame(paddles, (entity) => {
    const body = entity.get(stores.Body);
    const config = entity.get(stores.PaddleConfig);

    const velocity = { x: 0, y: 0 };
    if (
      game.input.keyboard.getKeyPressed('a') ||
      game.input.keyboard.getKeyPressed('ArrowLeft')
    ) {
      velocity.x -= config.speed;
    } else if (
      game.input.keyboard.getKeyPressed('d') ||
      game.input.keyboard.getKeyPressed('ArrowRight')
    ) {
      velocity.x += config.speed;
    }

    body.value.SetLinearVelocity(velocity);
    body.mark();
  });

  return null;
};

export const DebrisCleanup = () => {
  const game = useGame();

  const debris = useQuery({
    all: [stores.DebrisConfig, stores.Transform],
    none: [],
  });

  useQueryFrame(debris, (entity) => {
    const transform = entity.get(stores.Transform);
    if (Math.abs(transform.x) > 75 || Math.abs(transform.y) > 75) {
      game.destroy(entity.id);
    }
  });

  return null;
};

export const BlockSpawner = () => {
  const game = useGame();

  const spawner = useQuery({
    all: [stores.BlocksConfig, stores.Transform],
    none: [],
  });

  useQueryFrame(spawner, (entity) => {
    const config = entity.get(stores.BlocksConfig);
    if (config.alreadySpawned) return;
    config.set({ alreadySpawned: true });

    const { x, y } = entity.get(stores.Transform);

    const totalWidth =
      config.blocks.reduce((max, row) => Math.max(max, row.length), 0) *
      config.blockWidth;
    const totalHeight = config.blocks.length * config.blockHeight;

    const hOffset = -totalWidth / 4;
    const vOffset = -totalHeight / 4;

    config.blocks.forEach((row, h) => {
      row.forEach((info, v) => {
        if (info) {
          game
            .create(info.key)
            .add(stores.Transform, {
              x: x + v * config.blockWidth + hOffset,
              y: y + h * config.blockHeight + vOffset,
            })
            .add(stores.BodyConfig, {
              shape: {
                shape: 'rectangle',
                width: config.blockWidth,
                height: config.blockHeight,
              },
            })
            .add(stores.BlockInfo, {
              spawnerId: entity.id,
              key: info.key,
              fontSize: config.fontSize,
              text: info.text,
            });
        }
      });
    });
  });

  return null;
};

export const DebrisSpawner = () => {
  const game = useGame();

  const spawner = useQuery({
    all: [stores.DebrisControllerConfig],
    none: [],
  });

  useQueryFrame(spawner, (entity) => {
    const config = entity.get(stores.DebrisControllerConfig);
    if (config.alreadySpawned) return;
    config.alreadySpawned = true;

    config.items.forEach((d, i) => {
      game
        .create(`debris-${d.key}`)
        .add(stores.Transform, {
          x: d.x,
          y: d.y,
          angle: d.angle,
        })
        .add(stores.BodyConfig, {
          shape: {
            shape: 'rectangle',
            width: d.size,
            height: d.size,
          },
        })
        .add(stores.DebrisConfig, {
          text: d.text,
          index: i,
        });
    });
  });

  return null;
};
