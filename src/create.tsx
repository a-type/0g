import { withConfig } from './internal/withConfig';
import { System } from './system';
import {
  InferredPrefabsStores,
  NormalizeStoresAndStoreCreators,
  Plugin,
  Prefab,
  StoreCreator,
  Stores,
  SystemConfig,
} from './types';
import { World } from './World';

export function create<Prefabs extends Record<string, Prefab<Stores>>>(
  prefabs: Prefabs,
  plugins: Record<string, Plugin> = {}
) {
  const systems: System<any, any>[] = Object.values(plugins).reduce(
    (all, plugin) => {
      return [...all, ...Object.values(plugin.systems ?? {})];
    },
    new Array<System<any, any>>()
  );

  return {
    World: withConfig(prefabs, systems, plugins)(World),
    // TODO: type these with typings derived from Cfg
    system: <A extends Record<string, unknown>>(
      // @ts-ignore
      cfg: SystemConfig<A, InferredPrefabsStores<Prefabs>>
    ) => {
      const sys = new System<any, any>(cfg);
      systems.push(sys);
      return sys;
    },
  };
}

export function createPlugin<
  Stores extends Record<string, StoreCreator<any, any>>
>(stores: Stores) {
  const systems: System<any, Stores>[] = [];

  return {
    system: <A extends Record<string, unknown>>(
      cfg: SystemConfig<A, NormalizeStoresAndStoreCreators<Stores>>
    ) => {
      const sys = new System<A, Stores>(cfg);
      systems.push(sys);
      return sys;
    },
  };
}
