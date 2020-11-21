import { r2d } from '../../../src';
import { Engine } from 'matter-js';

export const matterjs = (engine: Engine) =>
  r2d.plugin({
    api: {
      engine,
    },
    run: (ctx) => {
      Engine.update(engine, ctx.delta);
    },
  });
