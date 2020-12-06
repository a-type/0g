import * as React from 'react';
import { Container, Sprite } from '@inlet/react-pixi';
import * as r2d from 'r2d';
import { useTextureTile } from '../../../common/plugins/pixi/hooks/useTextureTile';
import charSheet from '../assets/roguelikeChar_transparent.png';
import { game } from '../game';

export const Character = game.prefab({
  name: 'Character',
  stores: {
    spriteConfig: game.stores.spriteConfig({
      source: charSheet,
      tileData: {
        x: 0,
        y: 0,
        width: 16,
        height: 16,
        gap: 1,
      },
    }),
    clothesSpriteConfig: game.stores.spriteConfig({
      source: charSheet,
      tileData: {
        x: 6,
        y: 0,
        width: 16,
        height: 16,
        gap: 1,
      },
    }),
    transform: game.stores.transform({
      x: 200,
      y: 200,
    }),
    bodyConfig: game.stores.bodyConfig({
      shape: 'rectangle',
      width: 16,
      height: 16,
    }),
    forces: game.stores.forces(),
    config: game.stores.characterConfig,
  },
  Component: ({ stores }) => {
    const { transform, spriteConfig, clothesSpriteConfig } = r2d.useProxy(
      stores
    );
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
