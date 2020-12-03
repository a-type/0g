import { EventEmitter } from 'events';
import { FC, ReactElement } from 'react';
import { Keyboard } from './input/keyboard';
import { Pointer } from './input/Pointer';
import { EntityWrapper } from './internal/EntityWrapper';
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
  prefabs: Record<string, Prefab<any>>;
  store: GlobalStore;
  events: EventEmitter;
  systems: System<any, any, any>[];
} & WorldApi;

export type FrameData = {
  delta: number;
};
export type FrameCallback = (data: FrameData) => void | Promise<void>;

export type StoreData<T extends Empty = Empty> = T;
export type StoreCreator<Kind extends string, T extends StoreData> = (
  overrides?: Partial<T>
) => Store<Kind, T>;
export type Store<Kind extends string, T extends StoreData> = {
  kind: Kind;
  initial: T;
};
export type Stores = Record<string, Store<string, any>>;

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

type ExtractStoreData<S extends Store<any, any> | undefined> = S extends Store<
  any,
  infer T
>
  ? T
  : never;
type MappedStoreData<S extends Record<string, Store<any, any> | undefined>> = {
  [K in keyof S]: ExtractStoreData<S[K]>;
};
export type PrefabRenderProps<S extends Stores> = {
  stores: MappedStoreData<S>;
};

export type PrefabConfig<S extends Stores> = {
  name: string;
  stores: S;
  Component?: FC<PrefabRenderProps<S>>;
  ManualComponent?: FC<PrefabRenderProps<S>>;
};

export type Prefab<S extends Stores> = {
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
export type SystemContext<
  W extends WorldContext,
  StoresByKind extends Record<string, Store<any, any>>
> = {
  world: W;
  entity: EntityWrapper<StoresByKind>;
};
export type SystemRunContext<
  W extends WorldContext,
  StoresByKind extends Record<string, Store<any, any>>
> = SystemContext<W, StoresByKind> & {
  frame: FrameData;
};
export type SystemRunFn<
  A,
  W extends WorldContext,
  StoresByKind extends Record<string, Store<any, any>>
> = (
  entity: EntityWrapper<StoresByKind>,
  state: DefaultedState<A>,
  context: SystemRunContext<W, StoresByKind>
) => void | Promise<void>;
export type SystemInitFn<
  A,
  W extends WorldContext,
  StoresByKind extends Record<string, Store<any, any>>
> = (
  entity: EntityWrapper<StoresByKind>,
  state: DefaultedState<A>,
  context: SystemContext<W, StoresByKind>
) => void;
export type SystemConfig<
  A,
  StoresByKind extends Record<string, Store<any, any>> = {},
  W extends WorldContext = WorldContext
> = {
  name: string;
  state?: A;
  init?: SystemInitFn<A, W, StoresByKind>;
  dispose?: SystemInitFn<A, W, StoresByKind>;
  run: SystemRunFn<A, W, StoresByKind>;
  preStep?: SystemRunFn<A, W, StoresByKind>;
  postStep?: SystemRunFn<A, W, StoresByKind>;
  runsOn(prefab: Prefab<any>): boolean;
};

export type SystemInstanceSnapshot = {
  stores: Stores;
  state: any;
};

export type States = Record<string, unknown>;

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

export type MapValueUnion<T> = T extends Record<any, infer V> ? V : never;

export type ExtractPrefabStores<P> = P extends Prefab<infer S> ? S : never;

export type MappedPrefabStores<P extends Record<string, Prefab<any>>> = {
  [K in keyof P]: StoresKeyedByKind<ExtractPrefabStores<P[K]>>;
};

export type FilterByKind<S extends Record<string, Store<string, any>>, Kind extends string> = {
  [K in keyof S as S[K] extends Store<Kind, any> ? K : never]: S[K];
};

export type AllStoreKinds<S extends Record<string, Store<string, any>>> = S extends Record<string, Store<infer K, any>> ? K : never;

export type StoresKeyedByKind<S> =
  S extends Record<string, Store<infer K, any>>
  ? {
      [Kind in K]: UnionToIntersection<MapValueUnion<FilterByKind<S, Kind>>>;
    }
  : never;

export type InferredPrefabsStores<
  Prefabs extends Record<string, Prefab<Stores>>
> = UnionToIntersection<MapValueUnion<MappedPrefabStores<Prefabs>>>

export type InferredPrefabStoreKinds<Prefabs extends Record<string, Prefab<Stores>>> =
    AllStoreKinds<MapValueUnion<Prefabs>['stores']>

export type NormalizeStoresAndStoreCreators<
  S extends
    | Record<string, Store<string, any>>
    | Record<string, StoreCreator<string, any>>
> = S extends Record<string, StoreCreator<string, any>>
  ? {
      [K in keyof S]: ReturnType<S[K]>;
    }
  : S;
