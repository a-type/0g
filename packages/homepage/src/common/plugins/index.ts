import { box2d as box2dPlugin } from './box2d/box2d';
import { b2World } from '@flyover/box2d';

export { pixi } from './pixi';

const world = new b2World({ x: 0, y: 0 });

export const box2d = box2dPlugin(world);
