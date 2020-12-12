import { Game } from './Game';
import {
  SystemConfig,
  WorldContext,
  EntityData,
  FrameData,
  SystemRunFn,
  SystemInitFn,
  DefaultedState,
  StoreMap,
  Store,
  StoreData,
} from './types';

export class System<A extends Record<string, any> | undefined> {
  private _name: string;
  private _priority: number = 0;
  /** Caches ephemeral runtime state per-entity. */
  private stateCache = new WeakMap<EntityData<any>, DefaultedState<A>>();
  /** User-defined setup fn */
  private _init?: SystemInitFn<A>;
  /** User-defined teardown fn */
  private _dispose?: SystemInitFn<A>;
  /** User-defined run implementation */
  private _run: SystemRunFn<A>;
  private _preStep?: SystemRunFn<A>;
  private _postStep?: SystemRunFn<A>;
  /** Defaulted initial state */
  private _initialState: DefaultedState<A>;
  private _requires: Store<string, any>[];

  constructor(cfg: SystemConfig<A>) {
    this._run = cfg.run;
    this._preStep = cfg.preStep;
    this._postStep = cfg.postStep;
    this._initialState = (cfg.state || {}) as DefaultedState<A>;
    this._init = cfg.init;
    this._dispose = cfg.dispose;
    this._requires = cfg.requires || [];
    this._name = cfg.name;
    this._priority = cfg.priority || 0;
  }

  private getState = (ctx: { game: Game; entity: EntityData<any> }) => {
    let s: DefaultedState<A>;
    const existing = this.stateCache.get(ctx.entity);
    if (!existing) {
      s = this._initialState
        ? { ...this._initialState }
        : ({} as DefaultedState<A>);
      this._init?.(ctx.entity, s, ctx);
      this.stateCache.set(ctx.entity, s);
    } else {
      s = existing;
    }
    return s;
  };

  init = (ctx: { game: Game; entity: EntityData<any> }) => {
    const s = this._initialState
      ? { ...this._initialState }
      : ({} as DefaultedState<A>);
    this._init?.(ctx.entity, s, ctx);
    this.stateCache.set(ctx.entity, s);
  };

  run = (ctx: { game: Game; delta: number; entity: EntityData<any> }) => {
    this._run(ctx.entity, this.getState(ctx), ctx);
  };

  preStep = (ctx: { game: Game; delta: number; entity: EntityData<any> }) => {
    this._preStep?.(ctx.entity, this.getState(ctx), ctx);
  };

  postStep = (ctx: { game: Game; delta: number; entity: EntityData<any> }) => {
    this._postStep?.(ctx.entity, this.getState(ctx), ctx);
  };

  dispose = (ctx: { game: Game; entity: EntityData<any> }) => {
    this._dispose?.(ctx.entity, this.getState(ctx), ctx);
  };

  runsOn = (stores: Record<string, StoreData<string, any>>) => {
    const storeList = Object.values(stores);
    return this._requires.every((Store) => {
      return !!storeList.find((S) => S.__kind === Store.kind);
    });
  };

  get name() {
    return this._name;
  }

  get priority() {
    return this._priority;
  }
}
