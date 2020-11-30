import * as React from 'react';
import { useFrame as useFrameDefault, FrameHook } from './useFrame';
import { proxy, useProxy } from 'valtio';
import {
  Plugins,
  Prefab,
  WorldContext,
  GlobalStore,
  FrameData,
  EntityData,
  TreeNode,
  WorldApi,
  Store,
  StoreData,
} from './types';
import { PluginProviders } from './internal/PluginProviders';
import { keyboard, pointer } from './input';
import { EventEmitter } from 'events';
import { Entity } from './Entity';
import { DefaultScenePrefab } from './DefaultScenePrefab';
import shortid from 'shortid';
import { mergeDeepRight } from 'ramda';
import { Html } from './tools/Html';
import { DebugUI } from './tools/DebugUI';
import { System } from './system';

export const worldContext = React.createContext<WorldContext | null>(null);

export type WorldProps = {
  prefabs: Record<string, Prefab>;
  useFrame?: FrameHook;
  plugins?: Plugins;
  scene?: GlobalStore;
  systems: System<any, any>[];
};

export type ExtractPrefabNames<W extends WorldProps> = keyof W['prefabs'];

export const defaultScene = {
  tree: {
    id: 'scene',
    children: {},
  },
  entities: {
    scene: {
      id: 'scene',
      storesData: {},
      prefab: 'Scene',
      parentId: null,
    },
  },
};

const createGlobalStore = (initial: GlobalStore = defaultScene) =>
  proxy<GlobalStore>(initial);

function climbTree(
  path: string[],
  store: GlobalStore,
  targetId: string | null
): string[] {
  if (!targetId) return path;

  const registered = store.entities[targetId];
  if (!registered)
    throw new Error(
      `Traversing tree to ${targetId} but it was not found (broken link)`
    );

  if (registered.parentId) {
    path.unshift(registered.parentId);
    return climbTree(path, store, registered.parentId);
  }

  return path;
}
function discoverTreePath(store: GlobalStore, targetId: string | null) {
  return climbTree([], store, targetId);
}
function traverseToNode(store: GlobalStore, path: string[]) {
  let currentNode = store.tree;
  let currentId = path.shift();
  while (path.length) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    currentId = path.shift()!;
    currentNode = currentNode.children[currentId];
  }
  return currentNode;
}
function addTreeNode(
  store: GlobalStore,
  parentId: string | null,
  childId: string
) {
  const path = discoverTreePath(store, parentId);
  const node = traverseToNode(store, path);
  node.children[childId] = {
    id: childId,
    children: {},
  };
}
function removeTreeNode(store: GlobalStore, childId: string) {
  const path = discoverTreePath(store, childId);
  const parentPath = path.slice(undefined, -1);
  const node = traverseToNode(store, parentPath);
  const childNode = node.children[childId];
  delete node.children[childId];
  return childNode;
}
/**
 * Removes all members of a subtree of the scene tree, starting
 * at a particular node. returns a list of entities removed
 * @param store
 * @param node
 */
function removeSubtree(
  store: GlobalStore,
  node: TreeNode,
  removedList: EntityData[] = []
) {
  removedList.push(store.entities[node.id]);
  delete store.entities[node.id];
  Object.values(node.children).forEach((n) => {
    removeSubtree(store, n);
  });
  return removedList;
}

/** Copies initial values from all of a prefab's specified stores */
const initializeStores = (prefab: Prefab) => {
  const stores: Record<string, StoreData> = {};
  let entry: [string, Store<any> | undefined];
  for (entry of Object.entries(prefab.stores)) {
    stores[entry[0]] = { ...(entry[1]?.initial ?? {}) };
  }
  return stores;
};

function useWorldApi(store: GlobalStore, prefabs: Record<string, Prefab>) {
  const get = React.useCallback(
    (id: string) => {
      return store.entities[id] ?? null;
    },
    [store]
  );

  const add = React.useCallback(
    (
      prefabName: string,
      initialStores: Record<string, any> = {},
      parentId: string | null | undefined = undefined,
      ownId: string | null = null
    ) => {
      const id = ownId || `${prefabName}-${shortid()}`;
      const defaultedParentId = parentId === undefined ? 'scene' : null;

      const prefab = prefabs[prefabName];

      const entity: EntityData = {
        id,
        prefab: prefabName,
        storesData: mergeDeepRight(initializeStores(prefab), initialStores),
        parentId: defaultedParentId,
      };

      store.entities[id] = entity;
      // FIXME: not a fan of this hardcoding
      // don't add the scene to the tree - it is the root element
      // already and always present.
      if (id !== 'scene') {
        addTreeNode(store, defaultedParentId, id);
      }
      return store.entities[id];
    },
    [store, prefabs]
  );

  const destroy = React.useCallback(
    (id: string) => {
      const node = removeTreeNode(store, id);
      return removeSubtree(store, node);
    },
    [store]
  );

  return {
    get,
    add,
    destroy,
  };
}

function walkAndAdd(
  api: WorldApi,
  parentId: string | null,
  node: TreeNode,
  scene: GlobalStore
): void {
  const entity = scene.entities[node.id];
  api.add(entity.prefab, entity.storesData, parentId, entity.id);
  Object.values(node.children).forEach((n) =>
    walkAndAdd(api, entity.id, n, scene)
  );
}
function loadProvidedScene(api: WorldApi, scene: GlobalStore) {
  walkAndAdd(api, null, scene.tree, scene);
}

function useDebugMode(setPaused: (p: boolean) => void) {
  const [isDebug, setIsDebug] = React.useState(false);
  React.useEffect(() => {
    function handleKey(ev: KeyboardEvent) {
      if (ev.key === '/') {
        setIsDebug((v) => {
          setPaused(!v);
          return !v;
        });
      }
    }
    window.addEventListener('keypress', handleKey);
    return () => {
      window.removeEventListener('keypress', handleKey);
    };
  }, [setPaused]);

  return isDebug;
}

export const World: React.FC<WorldProps> = ({
  prefabs,
  useFrame = useFrameDefault,
  plugins = {},
  scene,
  systems,
}) => {
  // validation
  if (scene && (!scene.tree || !scene.entities)) {
    throw new Error('Invalid scene prop, must have tree and entities');
  }

  const [globalStore] = React.useState(() => createGlobalStore());

  // DEBUG
  React.useEffect(() => {
    (window as any).globalStore = globalStore;
  }, [globalStore]);

  const treeSnapshot = useProxy(globalStore.tree);

  const prefabsRef = React.useRef<Record<string, Prefab>>({
    Scene: DefaultScenePrefab,
    ...prefabs,
  });
  const systemsRef = React.useRef<System<any, any>[]>(systems);
  const pluginsList = React.useMemo(() => Object.values(plugins), [plugins]);

  const [events] = React.useState(() => {
    const e = new EventEmitter();
    e.setMaxListeners(10000);
    return e;
  });

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

  const api = useWorldApi(globalStore, prefabsRef.current);
  const { get, add, destroy } = api;
  const [removeList] = React.useState(() => new Array<string>());
  const remove = React.useCallback(
    (id: string) => {
      removeList.push(id);
    },
    [removeList]
  );

  React.useEffect(() => {
    if (scene) loadProvidedScene({ get, add, remove }, scene);
    // TODO: reset after scene change?
  }, [scene, get, add, remove]);

  const context = React.useMemo<WorldContext>(
    () => ({
      events,
      prefabs: prefabsRef.current,
      store: globalStore,
      input: {
        keyboard,
        pointer,
      },
      plugins: pluginApis,
      get,
      add,
      remove,
      systems: systemsRef.current,
    }),
    [events, prefabsRef, globalStore, pluginApis, get, add, remove]
  );

  const disposeEntity = React.useCallback(
    (entity: EntityData) => {
      let system: System<any, any>;
      const ctx = { world: context, entity };
      for (system of systemsRef.current) {
        system.dispose(ctx);
      }
    },
    [context]
  );

  const [paused, setPaused] = React.useState(false);
  const frameCtxRef = React.useRef({
    world: context,
    frame: (null as unknown) as FrameData,
  });
  const loop = React.useCallback(
    (frameData) => {
      frameCtxRef.current.frame = frameData;

      events.emit('preStep', frameData);

      for (const plugin of pluginsList) {
        plugin.run?.(frameCtxRef.current);
      }

      events.emit('step', frameData);

      events.emit('postStep', frameData);

      // Cleanup removed entity subtrees
      let id = removeList.shift();
      while (id) {
        const removedEntities = destroy(id);
        removedEntities.forEach(disposeEntity);
        id = removeList.shift();
      }

      keyboard.frame();
      pointer.frame();
    },
    [events, pluginsList, removeList, destroy, disposeEntity]
  );
  useFrame(loop, paused);

  const isDebug = useDebugMode(setPaused);

  const isEmpty = Object.keys(treeSnapshot.children).length === 0;

  return (
    <worldContext.Provider value={context}>
      <PluginProviders plugins={plugins}>
        <>
          <Entity id={treeSnapshot.id} treeNode={globalStore.tree} />
          {isDebug && <DebugUI />}
          {isEmpty && !isDebug && (
            <Html className="panel fixed-left">
              The scene is empty. Press / to edit
            </Html>
          )}
        </>
      </PluginProviders>
    </worldContext.Provider>
  );
};