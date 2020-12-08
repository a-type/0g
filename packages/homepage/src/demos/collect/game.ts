import * as stores from './stores';
import * as g from '0g';
import { box2d } from '@0g/box2d';
import { pixi } from '@0g/pixi';
import { b2World } from '@flyover/box2d';

const world = new b2World({
  x: 0,
  y: 0,
});

export const game = g.create(stores, { box2d: box2d(world), pixi });
