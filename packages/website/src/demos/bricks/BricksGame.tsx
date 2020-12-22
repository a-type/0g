import * as React from 'react';
import { World, Game } from '0g';
import * as systems from './systems';
import { stores } from './stores';
import * as renderers from './renderers';

const game = new Game({
  systems: [
    systems.physicsWorld,
    systems.ballMovement,
    systems.paddleMovement,
    systems.brickBreaker,
    systems.debrisSpawner,
    systems.debrisCleanup,
    systems.blockSpawner,
  ],
  stores: stores,
  // initialPlayState: 'paused',
});

(window as any).game = game;

game.create('physics').add(stores.worldConfig, { gravity: { x: 0, y: 0 } });

game
  .create('paddle')
  .add(stores.paddleConfig)
  .add(stores.transform, {
    x: 0,
    y: 10,
  })
  .add(stores.bodyConfig, {
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
  .add(stores.ballConfig)
  .add(stores.transform)
  .add(stores.contacts)
  .add(stores.bodyConfig, {
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
  .add(stores.wallTag)
  .add(stores.transform, {
    x: -25,
    y: 0,
  })
  .add(stores.bodyConfig, {
    shape: {
      shape: 'rectangle',
      width: 0.5,
      height: 50,
    },
    restitution: 1,
    isStatic: true,
    friction: 0,
  })
  .add(stores.contacts);

game
  .create('rightWall')
  .add(stores.wallTag)
  .add(stores.transform, {
    x: 25,
    y: 0,
  })
  .add(stores.bodyConfig, {
    shape: {
      shape: 'rectangle',
      width: 0.5,
      height: 50,
    },
    restitution: 1,
    isStatic: true,
    friction: 0,
  })
  .add(stores.contacts);

game
  .create('topWall')
  .add(stores.wallTag)
  .add(stores.transform, {
    x: 0,
    y: -25,
  })
  .add(stores.bodyConfig, {
    shape: {
      shape: 'rectangle',
      width: 50,
      height: 0.5,
    },
    restitution: 1,
    isStatic: true,
    friction: 0,
  })
  .add(stores.contacts);

game.create('blockSpawner').add(stores.blocksConfig).add(stores.transform, {
  x: 0,
  y: -10,
});

game
  .create('debrisController')
  .add(stores.debrisControllerConfig)
  .add(stores.transform);

const rendererList = Object.values(renderers);

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
        <World game={game} renderers={rendererList} />
      </div>
    </div>
  );
}
