import * as React from 'react';
import shortid from 'shortid';
import mergeDeepRight from 'ramda/es/mergeDeepRight';
import { useFrame as useFrameDefault, FrameHook } from './useFrame';
import { proxy, useProxy } from 'valtio';
import { Entity, Prefab, Stores } from './types';

export type WorldContext = {
  get(id: string): Entity;
  create(prefabName: string, initialStores?: Record<string, any>): Entity;
  destroy(id: string): void;
};

export const worldContext = React.createContext<WorldContext | null>(null);

export type WorldProps = {
  prefabs: Record<string, Prefab>;
  useFrame?: FrameHook;
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

type GlobalStore = {
  entities: {
    [id: string]: Entity;
  };
};

const createGlobalStore = () =>
  proxy<GlobalStore>({
    entities: {},
  });

export const World: React.FC<WorldProps> = ({
  prefabs,
  useFrame = useFrameDefault,
}) => {
  // TODO: initialize from scene
  const [globalStore] = React.useState(() => createGlobalStore());
  const snapshot = useProxy(globalStore);

  const prefabsRef = React.useRef(prefabs);

  const get = React.useCallback(
    (id: string) => globalStore.entities[id] ?? null,
    [globalStore]
  );
  const create = React.useCallback(
    <N extends ExtractPrefabNames<WorldProps>>(
      prefabName: N,
      initialStores: Stores = {}
    ) => {
      const id = `${prefabName}-${shortid()}`;
      const entity = createEntity(
        id,
        prefabName,
        prefabsRef.current[prefabName],
        initialStores
      );
      globalStore.entities[id] = entity;
      return entity;
    },
    [globalStore]
  );
  const destroy = React.useCallback((id: string) => {
    delete globalStore.entities[id];
  }, []);

  const ctx = React.useMemo(
    () => ({
      get,
      create,
      destroy,
    }),
    [get, create, destroy]
  );

  const entitiesList = React.useMemo(() => Object.values(snapshot.entities), [
    snapshot.entities,
  ]);

  useFrame((frameData) => {
    for (const entity of entitiesList) {
      const prefab = prefabs[entity.prefab];
      for (const system of Object.values(prefab.systems)) {
        system.run(frameData, entity.stores);
      }
    }
  });

  return (
    <worldContext.Provider value={ctx}>
      {entitiesList.map((entity) => {
        const Prefab = prefabs[entity.prefab].Component;
        return <Prefab key={entity.id} stores={entity.stores} />;
      })}
    </worldContext.Provider>
  );
};
