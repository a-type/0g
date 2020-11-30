import { EventEmitter } from 'events';
import { FC, ReactElement } from 'react';
import { Keyboard } from './input/keyboard';
import { Pointer } from './input/Pointer';
import { System } from './system';

type Empty = Record<string, any>;

export type Plugin<API extends Empty = Empty> = {
  wrap?: (content: ReactElement) => ReactElement;
  api: API;
  // TODO: return stuff to add to context?
  run?: (ctx: {
    world: WorldContext;
    frame: FrameData;
  }) => void | Promise<void>;
};
export type PluginConfig<API extends Empty = Empty> = Plugin<API>;
export type Plugins = Record<string, Plugin>;
type PluginApis<P extends Plugins> = {
  [K in keyof P]: P[K]['api'];
};

export type InputTools = {
  keyboard: Keyboard;
  pointer: Pointer;
};

export type GlobalStore = {
  tree: TreeNode;
  entities: Record<string, EntityData>;
};

export type TreeNode = {
  id: string;
  children: Record<string, TreeNode>;
};

export type WorldApi = {
  get(id: string): EntityData | null;
  add(
    prefabName: string,
    initialStores?: Record<string, any>,
    parentId?: string | null,
    id?: string | null
  ): EntityData;
  remove(id: string): void;
};

export type SystemStates = {
  get(entity: EntityData, systemAlias: string): any;
  getAll(entity: EntityData): Record<string, any>;
  add(entity: EntityData, systemAlias: string, initial: any): void;
};

export type WorldContext<P extends Plugins = Record<string, Plugin<Empty>>> = {
  plugins: PluginApis<P>;
  input: InputTools;
  prefabs: Record<string, Prefab>;
  store: GlobalStore;
  events: EventEmitter;
  systems: System<any, any>[];
} & WorldApi;

export type FrameData = {
  delta: number;
};
export type FrameCallback = (data: FrameData) => void | Promise<void>;

export type StoreData<T extends Empty = Empty> = T;
export type StoreCreator<T extends StoreData> = (
  overrides?: Partial<T>
) => Store<T>;
export type Store<T extends StoreData> = {
  name: string;
  initial: T;
};
export type Stores = Record<string, Store<any> | undefined>;

export type EntityData<S extends Stores = Stores> = {
  id: string;
  prefab: string;
  storesData: MappedStoreData<S>;
  /** only root scene has null */
  parentId: string | null;
};

export type EntityApi = {
  addChild(prefabName: string, initialStores?: Stores, id?: string): EntityData;
  removeSelf(): void;
};

type ExtractStoreData<S extends Store<any> | undefined> = S extends Store<
  infer T
>
  ? T
  : never;
type MappedStoreData<S extends Record<string, Store<any> | undefined>> = {
  [K in keyof S]: ExtractStoreData<S[K]>;
};
export type PrefabRenderProps<S extends Stores> = {
  stores: MappedStoreData<S>;
};

export type PrefabConfig<S extends Stores = Stores> = {
  name: string;
  stores: S;
  Component?: FC<PrefabRenderProps<S>>;
  ManualComponent?: FC<PrefabRenderProps<S>>;
};

export type Prefab<S extends Stores = Stores> = {
  name: string;
  stores: S;
  Component: FC<PrefabRenderProps<S>>;
};

export type SystemStateRegistry = {
  [entityId: string]: {
    [systemKey: string]: any;
  };
};

export type SystemProvidedState = any;
export type DefaultedState<
  A extends Record<string, any> | undefined
> = A extends undefined ? Empty : A;
export type SystemContext<W extends WorldContext> = {
  world: W;
  entity: EntityData;
};
export type SystemRunContext<W extends WorldContext> = SystemContext<W> & {
  frame: FrameData;
};
export type SystemRunFn<
  T extends Record<string, Store<any> | undefined>,
  A,
  W extends WorldContext
> = (
  stores: MappedStoreData<T>,
  state: DefaultedState<A>,
  context: SystemRunContext<W>
) => void | Promise<void>;
export type SystemInitFn<
  T extends Record<string, Store<any> | undefined>,
  A,
  W extends WorldContext
> = (
  stores: MappedStoreData<T>,
  state: DefaultedState<A>,
  context: SystemContext<W>
) => void;
export type SystemConfig<
  T extends Record<string, Store<any> | undefined>,
  A,
  W extends WorldContext = WorldContext
> = {
  name: string;
  state?: A;
  init?: SystemInitFn<T, A, W>;
  dispose?: SystemInitFn<T, A, W>;
  run: SystemRunFn<T, A, W>;
  preStep?: SystemRunFn<T, A, W>;
  postStep?: SystemRunFn<T, A, W>;
  runsOn(prefab: Prefab<any>): boolean;
};

export type SystemInstanceSnapshot = {
  stores: Stores;
  state: any;
};

export type States = Record<string, unknown>;
