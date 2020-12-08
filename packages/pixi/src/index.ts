import * as g from '0g';
import * as stores from './stores';

export * as stores from './stores';
export * from './useSprite';

export const pixi = g.plugin({
  api: {},
  stores,
});
