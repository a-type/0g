import { EventEmitter } from 'events';
import { FC, ReactElement } from 'react';
import { Keyboard } from './input/keyboard';
import { Pointer } from './input/pointer';
import { Game } from './Game';
import { System } from './system';

type Empty = Record<string, any>;

export type Plugin<
  API extends Empty = Empty,
  S extends Record<string, Store<string, any, any>> = any
> = {
  wrap?: (content: ReactElement) => ReactElement;
  api: API;
  // TODO: return stuff to add to context?
  run?: (ctx: {
    world: WorldContext;
    frame: FrameData;
  }) => void | Promise<void>;
  systems?: Record<string, System<any>>;
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

export type WorldApi = {
  get(id: string): EntityData<any> | null;
  // TODO: private?
  add(initialStores?: Record<string, any>, id?: string | null): EntityData<any>;
  // TODO: private?
  remove(id: string): void;
};

export type SystemStates = {
  get(entity: EntityData<any>, systemAlias: string): any;
  getAll(entity: EntityData<any>): Record<string, any>;
  add(entity: EntityData<any>, systemAlias: string, initial: any): void;
};

export type WorldContext<P extends Plugins = Record<string, Plugin<Empty>>> = {
  plugins: PluginApis<P>;
  input: InputTools;
  store: Game;
  events: EventEmitter;
  systems: System<any>[];
} & WorldApi;

export type FrameData = {
  delta: number;
};
export type FrameCallback = (data: FrameData) => void | Promise<void>;

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : DeepPartial<T[P]> | T[P];
};

export type StoreData<Kind extends string, T extends {}> = T & { __kind: Kind };
export type Store<
  Kind extends string,
  T extends {},
  Api extends StoreApi = {}
> = {
  kind: Kind;
  initial: T;
  (overrides?: Partial<T>): StoreData<Kind, T>;
  isData(data: StoreData<string, any>): data is StoreData<Kind, T>;
  get(entity: EntityData<any>): StoreData<Kind, T> | null;
  getAll(entity: EntityData<any>): StoreData<Kind, T>[];
} & Api;
export type StoreApi = Record<string, StoreApiMethod>;
export type StoreApiMethod = (entity: EntityData<any>, ...args: any[]) => any;
export type StoreMap = Record<string, Store<string, any, any>>;

export type EntityData<S extends Record<string, StoreData<string, any>>> = {
  id: string;
  storesData: S;
};

type ExtractStoreData<S> = S extends Store<infer K, infer D>
  ? StoreData<K, D>
  : never;
export type MappedStoreData<
  S extends Record<string, Store<string, any, any>>
> = {
  [K in keyof S]: ExtractStoreData<S[K]>;
};

export type SystemProvidedState = any;
export type DefaultedState<
  A extends Record<string, any> | undefined
> = A extends undefined ? Empty : A;
export type SystemContext = {
  game: Game;
  entity: EntityData<any>;
};
export type SystemRunContext = SystemContext & {
  delta: number;
};
export type SystemRunFn<A> = (
  entity: EntityData<any>,
  state: DefaultedState<A>,
  context: SystemRunContext,
) => void | Promise<void>;
export type SystemInitFn<A> = (
  entity: EntityData<any>,
  state: DefaultedState<A>,
  context: SystemContext,
) => void;
export type SystemConfig<A> = {
  name: string;
  state?: A;
  init?: SystemInitFn<A>;
  dispose?: SystemInitFn<A>;
  run: SystemRunFn<A>;
  preStep?: SystemRunFn<A>;
  postStep?: SystemRunFn<A>;
  requires: Store<string, any>[];
  priority?: number;
};

export type SystemInstanceSnapshot = {
  stores: StoreMap;
  state: any;
};

export type States = Record<string, unknown>;

export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

export type MapValueUnion<T> = T extends Record<any, infer V> ? V : never;

export type ExtractPluginStores<P> = P extends Plugin<any, infer S> ? S : never;

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

export type InferredPluginsStores<
  Plugins extends Record<string, Plugin>
> = UnionToIntersection<MapValueUnion<MappedPluginStores<Plugins>>>;
export type CombineStores<
  BaseStores extends StoreMap,
  Plugins extends Record<string, Plugin>
> = BaseStores & InferredPluginsStores<Plugins>;
