import * as React from 'react';
import { create, Entity, store } from '0g';
import { box2d, EntityContact } from '@0g/box2d';
import { useBodyRef } from '@0g/box2d/web';
import { b2World } from '@flyover/box2d';
import { Box, Button, Text } from 'rebass';
import { vecGetLength } from 'math2d';

type BlockData = {
  key: string;
  text: string;
};

const stores = {
  ballConfig: store('ballConfig', { speed: 12 }),
  blockInfo: store('blockInfo', {
    spawnerId: null as string | null,
    key: null as string | null,
    text: 'TODO',
    fontSize: 80,
  }),
  blocksConfig: store('blocksConfig', {
    blockWidth: 6,
    blockHeight: 8,
    fontSize: 80,
    blocks: [
      [
        {
          key: 'title0',
          text: '0',
        },
        {
          key: 'titleG',
          text: 'G',
        },
      ],
    ] as Array<Array<BlockData | null>>,
    removeBlock(key: string) {
      this.blocks = this.blocks.map((row) =>
        row.map((item) => (item?.key === key ? null : item))
      );
    },
  }),
};

const game = create(stores, {
  box2d: box2d(new b2World({ x: 0, y: 0 })),
});

game.prefab({
  name: 'Ball',
  stores: {
    transform: game.stores.transform(),
    contacts: game.stores.contacts(),
    body: game.stores.body({
      config: {
        shape: 'circle',
        radius: 1,
        fixedRotation: true,
        friction: 0.25,
        restitution: 1,
        bullet: true,
      },
    }),
    config: game.stores.ballConfig(),
  },
  Component: ({ stores }) => {
    return (
      <Box
        sx={{
          borderRadius: '100%',
          backgroundColor: 'white',
        }}
        ref={useBodyRef(stores)}
        className="Ball"
      />
    );
  },
});

game.prefab({
  name: 'Block',
  stores: {
    transform: game.stores.transform(),
    body: game.stores.body({
      config: {
        shape: 'rectangle',
        width: 5,
        height: 2.5,
      },
    }),
    contacts: game.stores.contacts(),
    info: game.stores.blockInfo(),
  },
  Component: ({ stores }) => (
    <Text
      sx={{
        fontFamily: '"Major Mono Display", monospace',
      }}
      ref={useBodyRef(stores)}
      style={{ fontSize: stores.info.fontSize }}
    >
      {stores.info.text}
    </Text>
  ),
});

game.prefab({
  name: 'BlockSpawner',
  stores: {
    transform: game.stores.transform(),
    config: game.stores.blocksConfig(),
  },
  Component: ({
    stores: {
      transform: { x, y },
      config,
    },
    id,
  }) => {
    const totalWidth =
      config.blocks.reduce((max, row) => Math.max(max, row.length), 0) *
      config.blockWidth;
    const totalHeight = config.blocks.length * config.blockHeight;

    const hOffset = -totalWidth / 2;
    const vOffset = -totalHeight / 2;

    return (
      <>
        {config.blocks.map((row, h) => {
          return row.map((info, v) => {
            return (
              info && (
                <Entity
                  key={info.key}
                  id={`Block-${info.key}`}
                  prefab="Block"
                  initial={{
                    transform: {
                      x: x + v * config.blockWidth + hOffset,
                      y: y + h * config.blockHeight + vOffset,
                    },
                    body: {
                      config: {
                        width: config.blockWidth,
                        height: config.blockHeight,
                      },
                    },
                    info: {
                      spawnerId: id,
                      key: info.key,
                      fontSize: config.fontSize,
                      text: info.text,
                    },
                  }}
                />
              )
            );
          });
        })}
      </>
    );
  },
});

game.prefab({
  name: 'Paddle',
  stores: {
    transform: game.stores.transform(),
    body: game.stores.body({
      config: {
        shape: 'rectangle',
        density: 1,
        width: 20,
        height: 4,
        restitution: 1,
        angle: 0,
        friction: 0.25,
        fixedRotation: true,
      },
    }),
  },
  Component: ({ stores }) => <Button ref={useBodyRef(stores)}>Start</Button>,
});

game.prefab({
  name: 'Wall',
  stores: {
    transform: game.stores.transform(),
    body: game.stores.body({
      config: {
        shape: 'rectangle',
        width: 5,
        height: 50,
        restitution: 1,
        isStatic: true,
        friction: 0,
      },
    }),
  },
  Component: ({ stores }) => <div ref={useBodyRef(stores)} />,
});

game.system({
  name: 'ballMovement',
  runsOn: (prefab) => prefab.name === 'Ball',
  state: {
    started: false,
  },
  run: (entity, state) => {
    const transform = game.stores.transform.get(entity)!;
    const body = game.stores.body.get(entity)!;
    const config = game.stores.ballConfig.get(entity)!;

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

game.system({
  name: 'brickBreaker',
  runsOn: (prefab) => prefab.name === 'Ball',
  run: (entity, _, ctx) => {
    const contacts = game.stores.contacts.get(entity)!;
    let contact: EntityContact;
    for (contact of contacts.began) {
      if (!contact.otherId) continue;
      const other = ctx.world.get(contact.otherId);
      if (!other) continue;
      if (other.prefab !== 'Block') continue;
      const info = game.stores.blockInfo.get(other)!;
      const spawnerId = info.spawnerId!;
      const spawner = ctx.world.get(spawnerId)!;
      game.stores.blocksConfig.get(spawner)?.removeBlock(info.key!);
      // also make paddle a little smaller
      const paddle = ctx.world.get('paddle')!;
      const paddleBody = game.stores.body.get(paddle)!;
      if (paddleBody.config.shape === 'rectangle') {
        paddleBody.config.width *= 0.9;
      }
    }
  },
});

game.system({
  name: 'paddleMovement',
  runsOn: (prefab) => prefab.name === 'Paddle',
  state: {
    initialY: null as null | number,
  },
  run: (entity, state, ctx) => {
    const transform = game.stores.transform.get(entity)!;
    const body = game.stores.body.get(entity)!;

    if (state.initialY === null) state.initialY = transform.y;

    const velocity = { x: 0, y: 0 };
    if (
      ctx.world.input.keyboard.getKeyPressed('a') ||
      ctx.world.input.keyboard.getKeyPressed('ArrowLeft')
    ) {
      velocity.x -= 12;
    } else if (
      ctx.world.input.keyboard.getKeyPressed('d') ||
      ctx.world.input.keyboard.getKeyPressed('ArrowRight')
    ) {
      velocity.x += 12;
    }

    body.forces.addVelocity(velocity);
    transform.y = state.initialY || transform.y;
  },
});

const scene = {
  id: 'scene',
  prefab: 'Scene',
  storesData: {
    children: {
      paddle: {
        id: 'paddle',
        prefab: 'Paddle',
        initial: {
          transform: { x: 0, y: 25 },
        },
      },
      ball: {
        id: 'ball',
        prefab: 'Ball',
        initial: {
          transform: { x: 0, y: 0 },
        },
      },
      leftWall: {
        id: 'leftWall',
        prefab: 'Wall',
        initial: {
          body: {
            config: {
              width: 0.5,
              height: 50,
            },
          },
          transform: { x: -25, y: 0 },
        },
      },
      rightWall: {
        id: 'rightWall',
        prefab: 'Wall',
        initial: {
          body: {
            config: {
              width: 0.5,
              height: 50,
            },
          },
          transform: { x: 25, y: 0 },
        },
      },
      topWall: {
        id: 'topWall',
        prefab: 'Wall',
        initial: {
          body: {
            config: {
              width: 50,
              height: 0.5,
            },
          },
          transform: { x: 0, y: -25 },
        },
      },
      blockSpawner: {
        id: 'blockSpawner',
        prefab: 'BlockSpawner',
        initial: {
          transform: {
            y: -20,
          },
        },
      },
    },
  },
};

export function BricksGame() {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        margin: 'auto',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          overflow: 'visible',
          '& > *': {
            position: 'absolute',
            display: 'block',
          },
        }}
      >
        <game.World scene={scene} />
      </Box>
    </Box>
  );
}
