import * as React from 'react';
import { Container, Sprite } from '@inlet/react-pixi';
import * as r2d from '../../../../..';
import { forces } from '../../../common/stores/forces';
import { transform } from '../../../common/stores/transform';
import { useTextureTile } from '../../../pixi/hooks/useTextureTile';
import charSheet from '../assets/roguelikeChar_transparent.png';
import { spriteConfig } from '../../../pixi/stores/spriteConfig';
import { bodyConfig } from '../../../common/stores/bodyConfig';
import { characterConfig } from '../systems/characterMovement';

export const Character = r2d.prefab({
  name: 'Character',
  stores: {
    spriteConfig: spriteConfig({
      source: charSheet,
      tileData: {
        x: 0,
        y: 0,
        width: 16,
        height: 16,
        gap: 2,
      },
    }),
    transform: transform({
      x: 200,
      y: 200,
    }),
    bodyConfig: bodyConfig({
      shape: 'rectangle',
      width: 16,
      height: 16,
    }),
    forces: forces(),
    config: characterConfig(),
  },
  Component: ({ stores: { transform, spriteConfig } }) => {
    const { source, tileData } = spriteConfig;
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
