import { AssetLoader } from './Assets';

export * from './Game';
export * from './Query';
export * from './Component';
export * from './System';
export * from './filters';
export * from './Effect';
export * from './compose';

export interface Globals {
  [key: string]: any;
}

export interface AssetLoaders {
  [key: string]: AssetLoader;
}
