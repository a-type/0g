import { EventEmitter } from 'events';
import { FC, ReactElement } from 'react';
import { Keyboard } from './input/keyboard';
import { Pointer } from './input/Pointer';
import { System } from './system';

type Empty = Record<string, any>;

export type Plugin<
  API extends Empty = Empty,
  S extends Record<string, Store<string, any, any>> = {}
> = {
  wrap?: (content: ReactElement) => ReactElement;
  api: API;
  // TODO: return stuff to add to context?
  run?: (ctx: {
    world: WorldContext;
    frame: FrameData;
  }) => void | Promise<void>;
  systems?: Record<string, System<any, any>>;
  stores: S;
};
export type Plugins = Record<string, Plugin>;
type PluginApis<P extends Plugins> = {
  [K in keyof P]: P[K]['api'];
};

export type InputTools = {
  keyboard: Keyboard;
  pointer: Pointer;
};

export type GlobalStore = {
  entities: Record<string, EntityData>;
  // Purely for efficiency: this is a less frequently updating
  // map which just indicates all the existing entity IDs.
  ids: Record<string, boolean>;
};

export type SavedScene = Pick<GlobalStore, 'entities'>;

export type WorldApi = {
  get(id: string): EntityData | null;
  // TODO: private?
  add(
    prefabName: string,
    initialStores?: Record<string, any>,
    id?: string | null,
  ): EntityData;
  // TODO: private?
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
  prefabs: Record<string, Prefab<any>>;
  store: GlobalStore;
  events: EventEmitter;
  systems: System<any, any>[];
} & WorldApi;

export type FrameData = {
  delta: number;
};
export type FrameCallback = (data: FrameData) => void | Promise<void>;

export type StoreData<T extends Empty = Empty> = T;
export type Store<
  Kind extends string,
  T extends StoreData,
  Api extends StoreApi = {}
> = {
  kind: Kind;
  initial: T;
  (overrides?: Partial<T>): T & { __kind: Kind };
  isData(data: StoreData): data is T;
  get(entity: EntityData): T | null;
  getAll(entity: EntityData): T[];
} & Api;
export type StoreApi = Record<string, StoreApiMethod>;
export type StoreApiMethod = (entity: EntityData, ...args: any[]) => any;
export type Stores = Record<string, Store<string, any, any>>;

export type EntityData<S extends Stores = Stores> = {
  id: string;
  prefab: string;
  storesData: MappedStoreData<S>;
};

export type EntityApi = {
  addChild(prefabName: string, initialStores?: Stores, id?: string): EntityData;
  removeSelf(): void;
};

// type ExtractStoreData<S extends Store<string, any>> = S extends Store<
//   any,
//   infer T
// >
//   ? T
//   : never;
type ExtractStoreData<S> = S extends Store<string, infer D> ? D : never;
type MappedStoreData<S extends Record<string, Store<string, any, any>>> = {
  [K in keyof S]: ExtractStoreData<S[K]>;
};
export type PrefabRenderProps<S extends Record<string, StoreData>> = {
  stores: S;
  id: string;
};

export type PrefabConfig<S extends Record<string, StoreData>> = {
  name: string;
  stores: S;
  Component: FC<PrefabRenderProps<S>>;
};

export type Prefab<S extends Record<string, StoreData>> = {
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
export type SystemRunFn<A, W extends WorldContext> = (
  entity: EntityData,
  state: DefaultedState<A>,
  context: SystemRunContext<W>,
) => void | Promise<void>;
export type SystemInitFn<A, W extends WorldContext> = (
  entity: EntityData,
  state: DefaultedState<A>,
  context: SystemContext<W>,
) => void;
export type SystemConfig<A, W extends WorldContext = WorldContext> = {
  name: string;
  state?: A;
  init?: SystemInitFn<A, W>;
  dispose?: SystemInitFn<A, W>;
  run: SystemRunFn<A, W>;
  preStep?: SystemRunFn<A, W>;
  postStep?: SystemRunFn<A, W>;
  runsOn(prefab: Prefab<any>): boolean;
};

export type SystemInstanceSnapshot = {
  stores: Stores;
  state: any;
};

export type States = Record<string, unknown>;

export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

export type MapValueUnion<T> = T extends Record<any, infer V> ? V : never;

export type ExtractPrefabStores<P> = P extends Prefab<infer S> ? S : never;

export type ExtractPluginStores<P> = P extends Plugin<any, infer S> ? S : never;

export type MappedPrefabStores<P extends Record<string, Prefab<any>>> = {
  [K in keyof P]: StoresKeyedByKind<ExtractPrefabStores<P[K]>>;
};

export type MappedPluginStores<P extends Record<string, Plugin>> = {
  [K in keyof P]: StoresKeyedByKind<ExtractPluginStores<P[K]>>;
};

export type FilterByKind<
  S extends Record<string, Store<string, any>>,
  Kind extends string
> = {
  [K in keyof S as S[K] extends Store<Kind, any> ? K : never]: S[K];
};

export type AllStoreKinds<
  S extends Record<string, Store<string, any>>
> = S extends Record<string, Store<infer K, any>> ? K : never;

export type StoresKeyedByKind<S> = S extends Record<string, Store<infer K, any>>
  ? {
      [Kind in K]: UnionToIntersection<MapValueUnion<FilterByKind<S, Kind>>>;
    }
  : never;

export type InferredPrefabsStores<
  Prefabs extends Record<string, Prefab<Stores>>
> = UnionToIntersection<MapValueUnion<MappedPrefabStores<Prefabs>>>;

export type InferredPrefabStoreKinds<
  Prefabs extends Record<string, Prefab<Stores>>
> = AllStoreKinds<MapValueUnion<Prefabs>['stores']>;

export type InferredPluginsStores<
  Plugins extends Record<string, Plugin>
> = UnionToIntersection<MapValueUnion<MappedPluginStores<Plugins>>>;
export type CombineStores<
  BaseStores extends Stores,
  Plugins extends Record<string, Plugin>
> = BaseStores & InferredPluginsStores<Plugins>;
