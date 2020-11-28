import { r2d } from '../../../..';
import defaultTex from '../../demos/collect/assets/roguelikeChar_transparent.png';

export type TileData = {
  x: number;
  y: number;
  width: number;
  height: number;
  gap?: number;
};

export type SpriteStoreData = {
  source: string;
  tileData?: TileData;
};

export const sprite = r2d.system({
  stores: {
    sprite: r2d.store<SpriteStoreData>({
      source: defaultTex,
      tileData: {
        x: 0,
        y: 0,
        width: 16,
        height: 16,
      },
    }),
  },
  run: () => {
    // Doesn't do anything... yet
    return;
  },
});
