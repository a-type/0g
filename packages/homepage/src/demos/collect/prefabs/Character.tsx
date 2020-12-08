import * as React from 'react';
import { Container, Sprite } from '@inlet/react-pixi';
import * as g from '0g';
import charSheet from '../assets/roguelikeChar_transparent.png';
import { game } from '../game';
import { useSprite } from '@0g/pixi';

export const Character = game.prefab({
  name: 'Character',
  stores: {
    spriteConfig: game.stores.sprite({
      source: charSheet,
      tileData: {
        x: 0,
        y: 0,
        width: 16,
        height: 16,
        gap: 1,
      },
    }),
    clothesSpriteConfig: game.stores.sprite({
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
    bodyConfig: game.stores.body({
      config: {
        shape: 'rectangle',
        width: 16,
        height: 16,
        density: 1,
      },
    }),
    config: game.stores.characterConfig,
  },
  Component: ({ stores }) => {
    const { transform, spriteConfig, clothesSpriteConfig } = g.useProxy(stores);
    const { source, tileData } = spriteConfig;
    // you can use hooks here!

    // suspense-based asset loading
    const baseTexture = useSprite(source, tileData);
    const clothesTexture = useSprite(
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
