import * as stores from './stores';
import * as r2d from 'r2d';
import { box2d } from '@r2d/box2d';
import { pixi } from '@r2d/pixi';
import { b2World } from '@flyover/box2d';

const world = new b2World({
  x: 0,
  y: 0,
});

export const game = r2d.create(stores, { box2d: box2d(world), pixi });
