import * as React from 'react';
import { Container, Sprite } from '@inlet/react-pixi';
import { r2d } from '../../../../..';
import { forces } from '../../../common/stores/forces';
import { transform } from '../../../common/stores/transform';
import { rigidBody } from '../../../common/systems/rigidBody';
import { spritesheets } from '../assets';
import { sprite } from '../../../pixi/systems/sprite';
import { Rectangle } from 'pixi.js';
import { useTextureTile } from '../../../pixi/hooks/useTextureTile';

const movement = r2d.system({
  stores: {
    transform: transform,
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
    baseSprite: sprite,
    clothesSprite: sprite,
    rigidBody: rigidBody,
  },
  Component: ({ stores: { transform, sprite } }) => {
    const { source, tileData } = sprite;
    // you can use hooks here!

    // suspense-based asset loading
    const baseTexture = useTextureTile(source, tileData);

    return (
      <Container x={transform.x} y={transform.y}>
        {/* Body */}
        <Sprite texture={baseTexture} />
        {/* Clothes */}
        {/* <Sprite texture={clothesTexture} /> */}
      </Container>
    );
  },
});
