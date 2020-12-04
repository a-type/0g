import * as r2d from 'r2d';

export const forces = r2d.store<
  'forces',
  {
    velocity: { x: number; y: number } | null;
    impulse: { x: number; y: number } | null;
  }
>('forces', {
  velocity: null,
  impulse: null,
});
