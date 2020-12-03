import * as r2d from '../../../../src';

export type TileData = {
  x: number;
  y: number;
  width: number;
  height: number;
  gap?: number;
};

export const spriteConfig = r2d.store<
  'spriteConfig',
  {
    source: string;
    tileData?: TileData;
  }
>('spriteConfig', {
  source: '<invalid>',
});
