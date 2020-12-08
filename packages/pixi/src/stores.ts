import * as r2d from 'r2d';

export type TileData = {
  x: number;
  y: number;
  width: number;
  height: number;
  gap?: number;
};

export const sprite = r2d.store<
  'sprite',
  {
    source: string;
    tileData?: TileData;
  }
>('sprite', {
  source: '<invalid>',
});
