import * as g from '0g';

export type TileData = {
  x: number;
  y: number;
  width: number;
  height: number;
  gap?: number;
};

export const sprite = g.store<
  'sprite',
  {
    source: string;
    tileData?: TileData;
  }
>('sprite', {
  source: '<invalid>',
});
