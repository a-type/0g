import * as React from 'react';
import shortid from 'shortid';
import mergeDeepRight from 'ramda/es/mergeDeepRight';
import { useFrame as useFrameDefault, FrameHook } from './useFrame';
import { proxy, useProxy } from 'valtio';
import {
  ExtractSystemsStates,
  Plugins,
  Prefab,
  Stores,
  WorldContext,
  GlobalStore,
  SystemStateRegistry,
  System,
  Entity,
} from './types';
import { PluginProviders } from './internal/PluginProviders';
import { keyboard, pointer } from './input';

const input = { keyboard, pointer };

export const worldContext = React.createContext<WorldContext | null>(null);

export type WorldProps = {
  prefabs: Record<string, Prefab>;
  useFrame?: FrameHook;
  plugins?: Plugins;
  scene?: GlobalStore;
};

export type ExtractPrefabNames<W extends WorldProps> = keyof W['prefabs'];

const initializeStores = (prefab: Prefab) => {
  return Object.values(prefab.systems).reduce<Stores>((s, system) => {
    return Object.entries(system.stores).reduce<Stores>(
      (stores, [alias, store]) => {
        // copy the default values
        stores[alias] = { ...store };
        return stores;
      },
      s
    );
  }, {});
};

const createGlobalStore = (initial = { entities: {} }) =>
  proxy<GlobalStore>(initial);

export const World: React.FC<WorldProps> = ({
  prefabs,
  useFrame = useFrameDefault,
  plugins = {},
  scene,
}) => {
  // TODO: initialize from scene
  const [globalStore] = React.useState(() => createGlobalStore());
  const snapshot = useProxy(globalStore);

  const [systemStates] = React.useState<SystemStateRegistry>(() => ({}));

  const contextRef = React.useRef<WorldContext>();
  const prefabsRef = React.useRef(prefabs);

  const pluginApis = React.useMemo(
    () =>
      Object.entries(plugins).reduce<Record<string, Record<string, unknown>>>(
        (apis, [name, plugin]) => {
          apis[name] = plugin.api;
          return apis;
        },
        {}
      ),
    [plugins]
  );

  const initializeSystemStates = (entity: Entity) => {
    const prefab = prefabsRef.current[entity.prefab];
    const systemStateInitCtx = Object.assign({}, contextRef.current, {
      entity,
    });
    return Object.entries(prefab.systems).reduce<
      ExtractSystemsStates<Prefab['systems']>
    >((states, [name, sys]) => {
      states[name] = { ...sys.state };
      sys.init?.(entity.stores, states[name], systemStateInitCtx);
      return states;
    }, {});
  };

  const get = React.useCallback(
    (id: string) => globalStore.entities[id] ?? null,
    [globalStore]
  );
  const create = React.useCallback(
    <N extends ExtractPrefabNames<WorldProps>>(
      prefabName: N,
      initialStores: Stores = {},
      manualId?: string
    ) => {
      const id = manualId || `${prefabName}-${shortid()}`;
      const entity = {
        id,
        prefab: prefabName,
        stores: mergeDeepRight(
          initializeStores(prefabsRef.current[prefabName]),
          initialStores
        ),
      };

      systemStates[id] = initializeSystemStates(entity);

      globalStore.entities[id] = entity;
      return entity;
    },
    [globalStore, systemStates]
  );
  const [destroyList] = React.useState(() => new Array<string>());
  const destroy = React.useCallback(
    (id: string) => {
      // delete globalStore.entities[id];
      destroyList.push(id);
    },
    [destroyList]
  );

  const disposeSystems = React.useCallback((entity: Entity) => {
    let pair: [string, System<any, any>];
    const prefab = prefabsRef.current[entity.prefab];
    const states = systemStates[entity.id];
    const context = Object.assign({}, contextRef.current, { entity });
    for (pair of Object.entries(prefab.systems)) {
      pair[1].dispose?.(entity.stores, states[pair[0]], context);
    }
  }, []);

  React.useMemo(() => {
    contextRef.current = {
      get,
      create,
      destroy,
      plugins: pluginApis,
      input,
      __internal: {
        globalStore,
      },
    };
  }, [get, create, destroy, pluginApis]);

  const ctx = React.useMemo(
    () => ({
      get,
      create,
      destroy,
      plugins: pluginApis,
      input,
      __internal: {
        globalStore,
      },
    }),
    [get, create, destroy, pluginApis]
  );

  // initialize scene if provided / changed
  React.useLayoutEffect(() => {
    if (!scene) return;
    for (const [id, entity] of Object.entries(scene?.entities)) {
      create(entity.prefab, entity.stores, id);
    }
  }, [scene, create]);

  const entitiesList = React.useMemo(() => Object.values(snapshot.entities), [
    snapshot.entities,
  ]);
  const pluginsList = React.useMemo(() => Object.values(plugins), [plugins]);

  const frameCtxRef = React.useRef({
    ...ctx,
    delta: 0,
    entity: (null as unknown) as Entity,
  });
  const loop = React.useCallback(
    (frameData) => {
      Object.assign(frameCtxRef.current, contextRef.current, frameData);

      let entity: Entity;
      let entry: [string, System<any, any>];
      for (entity of entitiesList) {
        for (entry of Object.entries(
          prefabsRef.current[entity.prefab].systems
        )) {
          frameCtxRef.current.entity = entity;
          entry[1].preStep?.(
            globalStore.entities[entity.id].stores,
            systemStates[entity.id]?.[entry[0]],
            frameCtxRef.current
          );
        }
      }

      for (const plugin of pluginsList) {
        plugin.run?.(frameCtxRef.current);
      }

      for (entity of entitiesList) {
        for (entry of Object.entries(
          prefabsRef.current[entity.prefab].systems
        )) {
          frameCtxRef.current.entity = entity;
          entry[1].run(
            globalStore.entities[entity.id].stores,
            systemStates[entity.id]?.[entry[0]],
            frameCtxRef.current
          );
        }
      }

      for (entity of entitiesList) {
        for (entry of Object.entries(
          prefabsRef.current[entity.prefab].systems
        )) {
          frameCtxRef.current.entity = entity;
          entry[1].postStep?.(
            globalStore.entities[entity.id].stores,
            systemStates[entity.id]?.[entry[0]],
            frameCtxRef.current
          );
        }
      }

      // process any destroy calls
      while (destroyList.length) {
        const id = destroyList.pop();
        if (!id) continue;
        // dispose all systems
        disposeSystems(globalStore.entities[id]);
        delete globalStore.entities[id];
      }

      keyboard.frame();
      pointer.frame();
    },
    [pluginsList, entitiesList, globalStore, destroyList]
  );
  useFrame(loop);

  return (
    <worldContext.Provider value={ctx}>
      <PluginProviders plugins={plugins}>
        <>
          {entitiesList.map((entity) => {
            const Prefab = prefabs[entity.prefab].Component;
            return (
              <Prefab
                key={entity.id}
                stores={globalStore.entities[entity.id].stores}
              />
            );
          })}
        </>
      </PluginProviders>
    </worldContext.Provider>
  );
};
