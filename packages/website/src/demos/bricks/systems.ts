import { system } from '0g';
import { EntityContact, systems as box2dSystems } from '@0g/box2d';
import { vecNormalize, vecScale } from 'math2d';
import { stores } from './stores';

export const { physicsWorld } = box2dSystems;

export const ballMovement = system(
  'ballMovement',
  {
    ball: {
      all: [
        stores.ballConfig,
        stores.ballState,
        stores.transform,
        stores.contacts,
        stores.body,
      ],
      none: [],
    },
    uninitialized: {
      all: [stores.ballConfig],
      none: [stores.ballState],
    },
  },
  function () {
    this.queries.uninitialized.entities.forEach((entity) => {
      entity.add(stores.ballState, { needsLaunch: true });
    });

    this.queries.ball.entities.forEach((entity) => {
      const transform = entity.get(stores.transform);
      const body = entity.get(stores.body);
      const config = entity.get(stores.ballConfig);
      const contacts = entity.get(stores.contacts);
      const state = entity.get(stores.ballState);

      if (Math.abs(transform.y) > 75 || Math.abs(transform.x) > 75) {
        body.value.SetPositionXY(0, 0);
      }

      const currentSpeed = body.value.GetLinearVelocity().Length();

      // just exited a collision?
      if (state.needsLaunch) {
        console.log(
          `speed ${currentSpeed} target ${
            config.speed
          } mass ${body.value.GetMass()}`
        );
        body.value.ApplyLinearImpulseToCenter({
          x: 0,
          y: config.speed * body.value.GetMass(),
        });
        state.needsLaunch = false;
      } else if (!!contacts.ended.length && !contacts.current.length) {
        // speed up to required speed
        if (Math.abs(currentSpeed - config.speed) > 0.1) {
          body.value.ApplyLinearImpulseToCenter(
            vecScale(
              vecNormalize(body.value.GetLinearVelocity()),
              (config.speed - currentSpeed) * body.value.GetMass()
            )
          );
        }
      }
    });
  }
);

export const brickBreaker = system(
  'brickBreaker',
  {
    ball: {
      all: [stores.ballConfig, stores.contacts],
      none: [],
    },
  },
  function (game) {
    this.queries.ball.entities.forEach((entity) => {
      const contacts = entity.get(stores.contacts);
      let contact: EntityContact;
      for (contact of contacts.began) {
        if (!contact.otherId) continue;
        const other = game.get(contact.otherId);
        if (!other) continue;
        const info = other.maybeGet(stores.blockInfo);
        if (!info) continue; // not a block
        game.destroy(other.id);
        // also make paddle a little smaller
        const paddle = game.get('paddle')!;
        const paddleBodyConfig = paddle.get(stores.bodyConfig);
        if (paddleBodyConfig.shape.shape === 'rectangle') {
          paddleBodyConfig.shape.width *= 0.9;
        }
      }
    });
  }
);

export const paddleMovement = system(
  'paddleMovement',
  {
    paddle: {
      all: [stores.paddleConfig, stores.body, stores.transform],
      none: [],
    },
  },
  function (game) {
    this.queries.paddle.entities.forEach((entity) => {
      const body = entity.get(stores.body);
      const config = entity.get(stores.paddleConfig);

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
    });
  }
);

export const debrisCleanup = system(
  'debrisCleanup',
  {
    debris: {
      all: [stores.debrisConfig, stores.transform],
      none: [],
    },
  },
  function (game) {
    this.queries.debris.entities.forEach((entity) => {
      const transform = entity.get(stores.transform);
      if (Math.abs(transform.x) > 75 || Math.abs(transform.y) > 75) {
        console.debug(`Removing debris ${entity.id}`);
        game.destroy(entity.id);
      }
    });
  }
);

export const blockSpawner = system(
  'blockSpawner',
  {
    spawner: {
      all: [stores.blocksConfig, stores.transform],
      none: [],
    },
  },
  function (game) {
    this.queries.spawner.entities.forEach((entity) => {
      const config = entity.get(stores.blocksConfig);
      if (config.alreadySpawned) return;
      config.alreadySpawned = true;

      const { x, y } = entity.get(stores.transform);

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
              .add(stores.transform, {
                x: x + v * config.blockWidth + hOffset,
                y: y + h * config.blockHeight + vOffset,
              })
              .add(stores.bodyConfig, {
                shape: {
                  shape: 'rectangle',
                  width: config.blockWidth,
                  height: config.blockHeight,
                },
              })
              .add(stores.blockInfo, {
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
);

export const debrisSpawner = system(
  'debrisSpawner',
  {
    spawner: {
      all: [stores.debrisControllerConfig],
      none: [],
    },
  },
  function (game) {
    this.queries.spawner.entities.forEach((entity) => {
      const config = entity.get(stores.debrisControllerConfig);
      if (config.alreadySpawned) return;
      config.alreadySpawned = true;

      config.items.forEach((d, i) => {
        game
          .create(`debris-${d.key}`)
          .add(stores.transform, {
            x: d.x,
            y: d.y,
            angle: d.angle,
          })
          .add(stores.bodyConfig, {
            shape: {
              shape: 'rectangle',
              width: d.size,
              height: d.size,
            },
          })
          .add(stores.debrisConfig, {
            text: d.text,
            index: i,
          });
      });
    });
  }
);
