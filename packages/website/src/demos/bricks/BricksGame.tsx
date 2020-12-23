import * as React from 'react';
import { Game } from '0g';
import { World } from '@0g/react';
import { stores } from './stores';
import * as renderers from './renderers';
import * as systems from './systems';

const game = new Game({
  stores: stores,
  systems: [
    systems.PhysicsWorld,
    systems.BlockSpawner,
    systems.DebrisSpawner,
    systems.DebrisCleanup,
    systems.PaddleMovement,
    systems.BallMovement,
    systems.BrickBreaker,
  ],
  initialPlayState: 'paused',
});

(window as any).game = game;

game.create('physics').add(stores.WorldConfig, { gravity: { x: 0, y: 0 } });

game
  .create('paddle')
  .add(stores.PaddleConfig)
  .add(stores.Transform, {
    x: 0,
    y: 10,
  })
  .add(stores.BodyConfig, {
    shape: {
      shape: 'rectangle',
      width: 20,
      height: 4,
    },
    density: 1,
    restitution: 1,
    friction: 0.25,
    fixedRotation: true,
  });

game
  .create('ball')
  .add(stores.BallConfig)
  .add(stores.Transform)
  .add(stores.Contacts)
  .add(stores.BodyConfig, {
    shape: {
      shape: 'circle',
      radius: 1,
    },
    fixedRotation: true,
    friction: 0.25,
    restitution: 1,
    bullet: true,
  });

game
  .create('leftWall')
  .add(stores.WallTag)
  .add(stores.Transform, {
    x: -25,
    y: 0,
  })
  .add(stores.BodyConfig, {
    shape: {
      shape: 'rectangle',
      width: 0.5,
      height: 50,
    },
    restitution: 1,
    isStatic: true,
    friction: 0,
  })
  .add(stores.Contacts);

game
  .create('rightWall')
  .add(stores.WallTag)
  .add(stores.Transform, {
    x: 25,
    y: 0,
  })
  .add(stores.BodyConfig, {
    shape: {
      shape: 'rectangle',
      width: 0.5,
      height: 50,
    },
    restitution: 1,
    isStatic: true,
    friction: 0,
  })
  .add(stores.Contacts);

game
  .create('topWall')
  .add(stores.WallTag)
  .add(stores.Transform, {
    x: 0,
    y: -25,
  })
  .add(stores.BodyConfig, {
    shape: {
      shape: 'rectangle',
      width: 50,
      height: 0.5,
    },
    restitution: 1,
    isStatic: true,
    friction: 0,
  })
  .add(stores.Contacts);

game.create('blockSpawner').add(stores.BlocksConfig).add(stores.Transform, {
  x: 0,
  y: -10,
});

game
  .create('debrisController')
  .add(stores.DebrisControllerConfig)
  .add(stores.Transform);

export function BricksGame() {
  return (
    <div
      css={{
        position: 'relative',
        width: '100%',
        height: '100%',
        margin: 'auto',
        overflow: 'hidden',
      }}
    >
      <div
        css={{
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
        <World game={game}>
          <renderers.BallRenderer />
          <renderers.BlockRenderer />
          <renderers.PaddleRenderer />
          <renderers.WallRenderer />
          <renderers.DebrisRenderer />
        </World>
      </div>
    </div>
  );
}
