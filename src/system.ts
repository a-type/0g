import {
  SystemConfig,
  WorldContext,
  EntityData,
  FrameData,
  SystemRunFn,
  SystemInitFn,
  DefaultedState,
  Prefab,
  Store,
} from './types';

export function system<
  S extends Record<string, Store<any> | undefined>,
  A extends Record<string, unknown> = {}
>(config: SystemConfig<S, A, WorldContext>) {
  return new System(config);
}

export class System<
  S extends Record<string, Store<any> | undefined>,
  A extends Record<string, any> | undefined,
  W extends WorldContext = WorldContext
> {
  /** Caches ephemeral runtime state per-entity. */
  private stateCache = new WeakMap<EntityData, DefaultedState<A>>();
  /** User-defined setup fn */
  private _init?: SystemInitFn<S, A, W>;
  /** User-defined teardown fn */
  private _dispose?: SystemInitFn<S, A, W>;
  /** User-defined run implementation */
  private _run: SystemRunFn<S, A, W>;
  private _preStep?: SystemRunFn<S, A, W>;
  private _postStep?: SystemRunFn<S, A, W>;
  /** Defaulted initial state */
  private _initialState: DefaultedState<A>;
  private _runsOn: (prefab: Prefab<any>) => boolean;

  constructor(cfg: SystemConfig<S, A, W>) {
    this._run = cfg.run;
    this._preStep = cfg.preStep;
    this._postStep = cfg.postStep;
    this._initialState = (cfg.state || {}) as DefaultedState<A>;
    this._init = cfg.init;
    this._dispose = cfg.dispose;
    this._runsOn = cfg.runsOn;
  }

  private getOrInitState = (ctx: { world: W; entity: EntityData<S> }) => {
    let s: DefaultedState<A>;
    const existing = this.stateCache.get(ctx.entity);
    if (!existing) {
      s = this._initialState
        ? { ...this._initialState }
        : ({} as DefaultedState<A>);
      this._init?.(ctx.entity.storesData, s, ctx);
      this.stateCache.set(ctx.entity, s);
    } else {
      s = existing;
    }
    return s;
  };

  run = (ctx: { world: W; frame: FrameData; entity: EntityData<S> }) => {
    this._run(ctx.entity.storesData, this.getOrInitState(ctx), ctx);
  };

  preStep = (ctx: { world: W; frame: FrameData; entity: EntityData<S> }) => {
    this._preStep?.(ctx.entity.storesData, this.getOrInitState(ctx), ctx);
  };

  postStep = (ctx: { world: W; frame: FrameData; entity: EntityData<S> }) => {
    this._postStep?.(ctx.entity.storesData, this.getOrInitState(ctx), ctx);
  };

  dispose = (ctx: { world: W; entity: EntityData<S> }) => {
    this._dispose?.(ctx.entity.storesData, this.getOrInitState(ctx), ctx);
  };

  runsOn = (prefab: Prefab<any>): prefab is Prefab<S> => {
    return this._runsOn(prefab);
  };
}
