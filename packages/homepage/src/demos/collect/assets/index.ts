import { Texture } from 'pixi.js';
import { createAsset } from 'use-asset';

async function loadTexture(importPromise: Promise<any>) {
  const { default: url } = await (importPromise as Promise<{
    default: string;
  }>);
  return await Texture.fromURL(url);
}

export const spritesheets = {
  characters: createAsset(
    () => loadTexture(import('./roguelikeChar_transparent.png')),
    Infinity
  ),
  environment: createAsset(
    () => loadTexture(import('./roguelikeSheet_transparent.png')),
    Infinity
  ),
};

export type SpritesheetName = keyof typeof spritesheets;
