import * as React from 'react';
import { Container, Sprite } from '@inlet/react-pixi';
import * as r2d from 'r2d';
import { useTextureTile } from '../../../pixi/hooks/useTextureTile';
import charSheet from '../assets/roguelikeChar_transparent.png';
import { spriteConfig } from '../../../pixi/stores/spriteConfig';
import { box2d } from '../../../common/plugins';

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
        gap: 1,
      },
    }),
    clothesSpriteConfig: spriteConfig({
      source: charSheet,
      tileData: {
        x: 6,
        y: 0,
        width: 16,
        height: 16,
        gap: 1,
      },
    }),
    transform: box2d.stores.transform({
      x: 200,
      y: 200,
    }),
    bodyConfig: box2d.stores.bodyConfig({
      shape: 'rectangle',
      width: 16,
      height: 16,
    }),
    forces: box2d.stores.forces(),
    config: r2d.store('characterConfig', {
      speed: 12,
    })(),
  },
  Component: ({ stores: { transform, spriteConfig, clothesSpriteConfig } }) => {
    const { source, tileData } = spriteConfig;
    // you can use hooks here!

    // suspense-based asset loading
    const baseTexture = useTextureTile(source, tileData);
    const clothesTexture = useTextureTile(
      clothesSpriteConfig.source,
      clothesSpriteConfig.tileData
    );

    return (
      <Container x={transform.x} y={transform.y}>
        {/* Body */}
        <Sprite texture={baseTexture} />
        {/* Clothes */}
        <Sprite texture={clothesTexture} />
      </Container>
    );
  },
});
