import * as r2d from 'r2d';
import * as stores from './stores';

export * as stores from './stores';
export * from './useSprite';

export const pixi = r2d.plugin({
  api: {},
  stores,
});
