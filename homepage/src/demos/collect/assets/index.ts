import { createAsset } from 'use-asset';

export const spritesheets = {
  characters: createAsset(
    () =>
      (import('./roguelikeChar_transparent.png') as unknown) as Promise<string>,
    Infinity
  ),
  environment: createAsset(
    () =>
      (import('./roguelikeSheet_transparent.png') as unknown) as Promise<
        string
      >,
    Infinity
  ),
};

export type SpritesheetName = keyof typeof spritesheets;
