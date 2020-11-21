export * from './World';
export * from './prefab';
export * from './useFrame';
export * from './types';
export * from './store';
export * from './system';
export * from './plugin';

import { store } from './store';
import { plugin } from './plugin';
import { prefab } from './prefab';
import { system } from './system';

export const r2d = {
  store,
  system,
  plugin,
  prefab,
};
