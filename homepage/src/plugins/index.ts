import { matterjs } from './matterjs';
import { Engine, World } from 'matter-js';

// for debug....
export const engine = Engine.create({
  world: World.create({
    gravity: {
      x: 0,
      y: 0,
      scale: 0,
    },
  }),
});

export const plugins = {
  matter: matterjs(engine),
};

export type Plugins = typeof plugins;
