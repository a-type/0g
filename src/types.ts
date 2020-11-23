import { FC, ReactElement } from 'react';
import { Keyboard } from './input/keyboard';
import { Pointer } from './input/Pointer';

type Empty = Record<string, unknown>;

export type Plugin<API extends Empty = Empty> = {
  wrap?: (content: ReactElement) => ReactElement;
  api: API;
  // TODO: return stuff to add to context?
  run?: (ctx: WorldContext & FrameData) => void | Promise<void>;
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
  entities: {
    [id: string]: Entity;
  };
};

export type SystemStateRegistry = {
  [entityId: string]: {
    [systemKey: string]: any;
  };
};

export type WorldContext<P extends Plugins = Record<string, Plugin<Empty>>> = {
  get(id: string): Entity;
  create(prefabName: string, initialStores?: Record<string, any>): Entity;
  destroy(id: string): void;
  plugins: PluginApis<P>;
  input: InputTools;
  __internal: {
    globalStore: GlobalStore;
  };
};

export type FrameData = {
  delta: number;
};
export type FrameCallback = (data: FrameData) => void | Promise<void>;

export type Store<T extends Empty = Empty> = T;
export type Stores = Record<string, Store>;

export type Entity = {
  id: string;
  prefab: string;
  stores: Stores;
};

export type PrefabRenderProps<S extends Systems = Systems> = {
  stores: ExtractSystemsStores<S>;
};

export type PrefabConfig<S extends Systems = Systems> = {
  name: string;
  systems: S;
  Component?: FC<PrefabRenderProps<S>>;
  ManualComponent?: FC<PrefabRenderProps<S>>;
};

export type Prefab<S extends Systems = Systems> = {
  name: string;
  systems: S;
  Component: FC<PrefabRenderProps<S>>;
};

export type EntityContext = { id: string };
export type SystemContext<W extends WorldContext> = W & {
  entity: EntityContext;
};
export type SystemRunContext<W extends WorldContext> = SystemContext<W> &
  FrameData;
export type SystemRunFn<
  T extends Stores,
  A extends Empty,
  W extends WorldContext
> = (stores: T, state: A, context: SystemRunContext<W>) => void | Promise<void>;
export type System<
  T extends Stores,
  A extends Empty,
  W extends WorldContext = WorldContext
> = {
  stores: T;
  state: A;
  init?: (stores: T, state: A, context: SystemContext<W>) => void;
  dispose?: (stores: T, state: A, context: SystemContext<W>) => void;
  run: SystemRunFn<T, A, W>;
  preStep?: SystemRunFn<T, A, W>;
  postStep?: SystemRunFn<T, A, W>;
};
export type SystemConfig<
  T extends Stores,
  A extends Empty,
  W extends WorldContext = WorldContext
> = {
  stores: T;
  state?: A;
  init?: (stores: T, state: A, context: SystemContext<W>) => void;
  dispose?: (stores: T, state: A, context: SystemContext<W>) => void;
  run: SystemRunFn<T, A, W>;
  preStep?: SystemRunFn<T, A, W>;
  postStep?: SystemRunFn<T, A, W>;
};

export type Systems = Record<string, System<Stores, Empty>>;

export type SystemInstanceSnapshot = {
  stores: Stores;
  state: any;
};

export type ExtractSystemStores<S> = S extends System<infer T, any> ? T : never;
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

type MappedSystemStores = Record<string, Stores>;
type MapValueUnion<T> = T extends Record<any, infer V> ? V : never;
// dark magic.
// 1. extract values of systems as a union
// 2. reference .stores, also a union
// 3. convert the union to intersection (represents the merging process)
export type ReduceSystemsStores<
  M extends MappedSystemStores
> = UnionToIntersection<MapValueUnion<M>>;
export type ExtractSystemsStores<S extends Systems> = ReduceSystemsStores<
  MapSystemsStores<S>
>;

export type ExtractPrefabStores<P extends Prefab> = ReduceSystemsStores<
  MapSystemsStores<P['systems']>
>;

export type ExtractSystemState<S> = S extends System<any, infer A> ? A : never;
export type ExtractSystemsStates<S extends Systems> = {
  [K in keyof S]: ExtractSystemState<S[K]>;
};

export type MapSystemsStores<S extends Systems> = {
  [K in keyof S]: ExtractSystemStores<S[K]>;
};
