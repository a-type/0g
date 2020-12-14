import React from 'react';
import { entity } from '0g';
import { Paddle, Ball, Wall, BlockSpawner, DebrisController } from './entities';
import { Physics } from '@0g/box2d';

export const GameScene = entity('GameScene', {}, () => (
  <>
    <Physics id="physics" initial={{}} />
    <Paddle id="paddle" initial={{ transform: { x: 0, y: 25 } }} />
    <Ball id="ball" initial={{ transform: { x: 0, y: 0 } }} />
    <Wall
      id="leftWall"
      initial={{
        body: { config: { shape: 'rectangle', width: 0.5, height: 50 } },
        transform: { x: -25, y: 0 },
      }}
    />
    <Wall
      id="rightWall"
      initial={{
        body: { config: { shape: 'rectangle', width: 0.5, height: 50 } },
        transform: { x: 25, y: 0 },
      }}
    />
    <Wall
      id="topWall"
      initial={{
        body: { config: { shape: 'rectangle', width: 50, height: 0.5 } },
        transform: { x: 0, y: -25 },
      }}
    />
    <BlockSpawner id="blockSpawner" initial={{ transform: { x: 0, y: -10 } }} />
    <DebrisController id="debrisController" initial={{}} />
  </>
));
