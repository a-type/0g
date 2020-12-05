import { Prefab, PrefabConfig, Stores } from './types';

export function prefab<S extends Stores>(config: PrefabConfig<S>): Prefab<S> {
  config.Component.displayName = config.name;

  return config;
}
