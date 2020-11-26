import * as React from 'react';
import { Sprite } from 'react-pixi-fiber';
import { r2d } from '../../../../..';
import { forces } from '../../../common/stores/forces';
import { transform } from '../../../common/stores/transform';
import { rigidBody } from '../../../common/systems/rigidBody';
import { spritesheets } from '../assets';
import { sprite } from '../systems/sprite';
import { Texture } from 'pixi.js';

const movement = r2d.system({
  stores: {
    transform: transform,
    rigidBody: rigidBody,
    forces: forces,
    config: r2d.store({
      speed: 12,
    }),
  },
  run: ({ config, forces }, _, ctx) => {
    const velocity = { x: 0, y: 0 };
    if (ctx.world.input.keyboard.getKeyPressed('ArrowLeft'))
      velocity.x = -config.speed;
    if (ctx.world.input.keyboard.getKeyPressed('ArrowRight'))
      velocity.x = config.speed;
    if (ctx.world.input.keyboard.getKeyPressed('ArrowUp'))
      velocity.y = -config.speed;
    if (ctx.world.input.keyboard.getKeyPressed('ArrowDown'))
      velocity.y = config.speed;

    forces.velocity = velocity;
  },
});

export const Character = r2d.prefab({
  name: 'Character',
  systems: {
    movement,
    sprite: sprite,
  },
  Component: ({ stores: { transform, sprite } }) => {
    // you can use hooks!
    const sheet = spritesheets[sprite.sheetName].read();

    return (
      <Sprite
        x={transform.x}
        y={transform.y}
        texture={Texture.from(sheet as any)}
      />
    );
  },
});
