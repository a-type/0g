import { FC } from 'react';

export type FrameData = {
  delta: number;
};
export type FrameCallback = (data: FrameData) => void | Promise<void>;

export type Store = unknown;
export type Stores = Record<string, Store>;

export type Entity = {
  id: string;
  prefab: string;
  stores: Stores;
};

export type PrefabRenderProps<S extends Systems = Systems> = {
  stores: ReduceSystemsStores<S>;
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

export type BasicSystemState = Record<string, unknown>;

export type SystemConfigObject<
  T extends Stores = Stores,
  A extends BasicSystemState = BasicSystemState
> = {
  stores: T;
  state?: A | (() => A);
  run: (frameData: FrameData, stores: T) => void | Promise<void>;
};
// export type SystemConfig<
//   T extends Stores = Stores,
//   A extends BasicSystemState = BasicSystemState,
//   W = unknown
// > = SystemConfigObject<T, A> | ((context: W) => SystemConfigObject<T, A>);
// export type SystemCreator<
//   T extends Stores = Stores,
//   A extends BasicSystemState = BasicSystemState,
//   W = unknown
// > = (context: W) => System<T, A>;
export type System<T extends Stores = Stores, A = BasicSystemState> = {
  stores: T;
  state: A;
  run: (frameData: FrameData, stores: T) => void | Promise<void>;
};
export type Systems = Record<string, System>;

export type SystemInstanceSnapshot = {
  stores: Stores;
  state: any;
};

export type ExtractSystemStores<S> = S extends System<infer T> ? T : never;
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
> = UnionToIntersection<MapValueUnion<M>['stores']>;

export type ExtractPrefabStores<P extends Prefab> = ReduceSystemsStores<
  P['systems']
>;
