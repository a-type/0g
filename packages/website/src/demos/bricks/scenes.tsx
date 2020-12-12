import React from 'react';
import { entity } from '0g';
import { Paddle, Ball, Wall, BlockSpawner, Debris } from './entities';
import { Physics } from '@0g/box2d';
import { vecScale } from 'math2d';

const randomUnit = () => {
  const rand = Math.random() * Math.PI * 2;
  return {
    x: Math.cos(rand),
    y: Math.sin(rand),
  };
};

const debris = new Array(20).fill(null).map((_, i) => ({
  text: '%',
  size: Math.random() * 2 + 1,
  x: Math.random() * 40 - 20,
  y: Math.random() * 40 - 20,
  angle: Math.random() * Math.PI * 2,
  key: i,
  velocity: vecScale(randomUnit(), Math.random() * 0.1),
  angularVelocity: Math.random() * 0.05 - 0.025,
}));

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
    {debris.map((d) => (
      <Debris
        id={`debris-${d.key}`}
        initial={{
          transform: { x: d.x, y: d.y, angle: d.angle },
          body: {
            config: {
              shape: 'rectangle',
              width: d.size,
              height: d.size,
            },
            forces: {
              velocity: d.velocity,
            } as any,
          },
          config: { text: d.text },
        }}
      />
    ))}
  </>
));
