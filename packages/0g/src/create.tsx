import { withConfig } from './internal/withConfig';
import { System } from './system';
import {
  CombineStores,
  Plugin,
  Prefab,
  PrefabConfig,
  Store,
  StoreData,
  SystemConfig,
} from './types';
import { World } from './World';

export function create<
  Stores extends Record<string, Store<string, any, any>>,
  Plugins extends Record<string, Plugin<any, any>>
>(stores: Stores, plugins: Plugins) {
  const systems: System<any, any>[] = Object.values(plugins).reduce(
    (all, plugin) => {
      return [...all, ...Object.values(plugin.systems ?? {})];
    },
    new Array<System<any, any>>(),
  );
  const prefabs: Record<string, Prefab<any>> = {};
  const allStores = {
    ...stores,
    ...Object.values(plugins).reduce((acc, plugin) => {
      Object.assign(acc, plugin.stores);
      return acc;
    }, {} as Record<string, Store<string, any, any>>),
  };

  return {
    World: withConfig(prefabs, systems, plugins)(World),
    // TODO: type these with typings derived from Cfg
    system: <A extends Record<string, unknown>>(
      // @ts-ignore
      cfg: SystemConfig<A>,
    ) => {
      const sys = new System<any, any>(cfg);
      systems.push(sys);
      return sys;
    },
    prefab: <S extends Record<string, StoreData>>(config: PrefabConfig<S>) => {
      // not much to do...
      prefabs[config.name] = config;
      config.Component.displayName = config.name;
      return config;
    },
    stores: allStores as CombineStores<Stores, Plugins>,
  };
}
