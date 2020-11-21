import * as React from 'react';
import shortid from 'shortid';
import mergeDeepRight from 'ramda/es/mergeDeepRight';
import { useFrame as useFrameDefault, FrameHook } from './useFrame';
import { proxy, subscribe, useProxy } from 'valtio';
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
        stores[alias] = store;
        return stores;
      },
      s
    );
  }, {});
};

const createEntity = (
  id: string,
  prefabName: string,
  prefab: Prefab,
  initialStores: Stores = {}
) => {
  return {
    id,
    prefab: prefabName,
    stores: mergeDeepRight(initializeStores(prefab), initialStores),
  };
};

const initializeSystemStates = (
  prefab: Prefab,
  stores: Stores,
  ctx: WorldContext
) => {
  return Object.entries(prefab.systems).reduce<
    ExtractSystemsStates<Prefab['systems']>
  >((states, [name, sys]) => {
    states[name] =
      typeof sys.state === 'function' ? sys.state(stores, ctx) : sys.state;
    return states;
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
      const entity = createEntity(
        id,
        prefabName,
        prefabsRef.current[prefabName],
        initialStores
      );
      globalStore.entities[id] = entity;

      systemStates[id] = initializeSystemStates(
        prefabs[prefabName],
        initialStores,
        contextRef.current!
      );

      return entity;
    },
    [globalStore, systemStates]
  );
  const destroy = React.useCallback((id: string) => {
    delete globalStore.entities[id];
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

  const frameCtxRef = React.useRef({ ...ctx, delta: 0 });
  const loop = React.useCallback(
    (frameData) => {
      Object.assign(frameCtxRef.current, contextRef.current, frameData);

      let entity: Entity;
      let entry: [string, System<any, any>];
      for (entity of entitiesList) {
        for (entry of Object.entries(
          prefabsRef.current[entity.prefab].systems
        )) {
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
          entry[1].postStep?.(
            globalStore.entities[entity.id].stores,
            systemStates[entity.id]?.[entry[0]],
            frameCtxRef.current
          );
        }
      }

      keyboard.frame();
      pointer.frame();
    },
    [pluginsList, entitiesList]
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
