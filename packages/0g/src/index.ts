import { AssetLoader } from './Assets.js';

export * from './Game.js';
export * from './Query.js';
export * from './Component2.js';
export * from './System.js';
export * from './filters.js';
export * from './Effect.js';
export * from './compose.js';
export { Entity } from './Entity.js';

export interface Globals {
  [key: string]: any;
}

export interface AssetLoaders {
  [key: string]: AssetLoader;
}
