import { r2d } from '../../../src';
import { b2World } from '@flyover/box2d';

export const box2d = (world: b2World) =>
  r2d.plugin({
    api: {
      world,
    },
    run: () => {
      world.Step(60 / 1000, 8, 3);
    },
  });
