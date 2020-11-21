import { box2d } from './box2d';
import { b2World } from '@flyover/box2d';

const world = new b2World({ x: 0, y: 0 });

export const plugins = {
  box2d: box2d(world),
};

export type Plugins = typeof plugins;
