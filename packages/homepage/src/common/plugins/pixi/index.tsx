import * as r2d from 'r2d';
import { Stage } from 'react-pixi-fiber';
import { spriteConfig } from './stores/spriteConfig';

export const pixi = r2d.plugin({
  api: {},
  stores: {
    spriteConfig,
  },
});
