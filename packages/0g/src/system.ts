import { EntityWrapper } from './internal/EntityWrapper';
import {
  SystemConfig,
  WorldContext,
  EntityData,
  FrameData,
  SystemRunFn,
  SystemInitFn,
  DefaultedState,
  Prefab,
} from './types';

export class System<
  A extends Record<string, any> | undefined,
  W extends WorldContext = WorldContext
> {
  private _name: string;
  /** Caches ephemeral runtime state per-entity. */
  private stateCache = new WeakMap<EntityData, DefaultedState<A>>();
  /** User-defined setup fn */
  private _init?: SystemInitFn<A, W>;
  /** User-defined teardown fn */
  private _dispose?: SystemInitFn<A, W>;
  /** User-defined run implementation */
  private _run: SystemRunFn<A, W>;
  private _preStep?: SystemRunFn<A, W>;
  private _postStep?: SystemRunFn<A, W>;
  /** Defaulted initial state */
  private _initialState: DefaultedState<A>;
  private _runsOn: (prefab: Prefab<any>) => boolean;

  constructor(cfg: SystemConfig<A, W>) {
    this._run = cfg.run;
    this._preStep = cfg.preStep;
    this._postStep = cfg.postStep;
    this._initialState = (cfg.state || {}) as DefaultedState<A>;
    this._init = cfg.init;
    this._dispose = cfg.dispose;
    this._runsOn = cfg.runsOn;
    this._name = cfg.name;
  }

  private getOrInitState = (ctx: { world: W; entity: EntityData }) => {
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

  run = (ctx: { world: W; frame: FrameData; entity: EntityData }) => {
    this._run(ctx.entity, this.getOrInitState(ctx), ctx);
  };

  preStep = (ctx: { world: W; frame: FrameData; entity: EntityData }) => {
    this._preStep?.(ctx.entity, this.getOrInitState(ctx), ctx);
  };

  postStep = (ctx: { world: W; frame: FrameData; entity: EntityData }) => {
    this._postStep?.(ctx.entity, this.getOrInitState(ctx), ctx);
  };

  dispose = (ctx: { world: W; entity: EntityData }) => {
    this._dispose?.(ctx.entity, this.getOrInitState(ctx), ctx);
  };

  runsOn = (prefab: Prefab<any>) => {
    return this._runsOn(prefab);
  };

  get name() {
    return this._name;
  }
}
