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
  Store,
  Stores,
  StoreCreator,
  NormalizeStoresAndStoreCreators,
} from './types';

const entityWrappers = new WeakMap<EntityData, EntityWrapper<any>>();

export class System<
  A extends Record<string, any> | undefined,
  StoresByKind extends
    | Record<string, Store<string, any>>
    | Record<string, StoreCreator<string, any>>,
  W extends WorldContext = WorldContext
> {
  /** Caches ephemeral runtime state per-entity. */
  private stateCache = new WeakMap<EntityWrapper<any>, DefaultedState<A>>();
  /** User-defined setup fn */
  private _init?: SystemInitFn<
    A,
    W,
    NormalizeStoresAndStoreCreators<StoresByKind>
  >;
  /** User-defined teardown fn */
  private _dispose?: SystemInitFn<
    A,
    W,
    NormalizeStoresAndStoreCreators<StoresByKind>
  >;
  /** User-defined run implementation */
  private _run: SystemRunFn<
    A,
    W,
    NormalizeStoresAndStoreCreators<StoresByKind>
  >;
  private _preStep?: SystemRunFn<
    A,
    W,
    NormalizeStoresAndStoreCreators<StoresByKind>
  >;
  private _postStep?: SystemRunFn<
    A,
    W,
    NormalizeStoresAndStoreCreators<StoresByKind>
  >;
  /** Defaulted initial state */
  private _initialState: DefaultedState<A>;
  private _runsOn: (prefab: Prefab<any>) => boolean;

  constructor(
    cfg: SystemConfig<A, NormalizeStoresAndStoreCreators<StoresByKind>, W>
  ) {
    this._run = cfg.run;
    this._preStep = cfg.preStep;
    this._postStep = cfg.postStep;
    this._initialState = (cfg.state || {}) as DefaultedState<A>;
    this._init = cfg.init;
    this._dispose = cfg.dispose;
    this._runsOn = cfg.runsOn;
  }

  private getWrapper = (
    entity: EntityData
  ): EntityWrapper<NormalizeStoresAndStoreCreators<StoresByKind>> => {
    let e = entityWrappers.get(entity);
    if (!e) {
      e = new EntityWrapper<NormalizeStoresAndStoreCreators<StoresByKind>>(
        entity
      );
      entityWrappers.set(entity, e);
    }
    return e;
  };

  private getOrInitState = (ctx: { world: W; entity: EntityData }) => {
    const entity = this.getWrapper(ctx.entity);
    let s: DefaultedState<A>;
    const existing = this.stateCache.get(entity);
    if (!existing) {
      s = this._initialState
        ? { ...this._initialState }
        : ({} as DefaultedState<A>);
      this._init?.(entity, s, { world: ctx.world, entity });
      this.stateCache.set(entity, s);
    } else {
      s = existing;
    }
    return s;
  };

  run = (ctx: { world: W; frame: FrameData; entity: EntityData }) => {
    const entity = this.getWrapper(ctx.entity);
    this._run(entity, this.getOrInitState(ctx), {
      world: ctx.world,
      frame: ctx.frame,
      entity,
    });
  };

  preStep = (ctx: { world: W; frame: FrameData; entity: EntityData }) => {
    const entity = this.getWrapper(ctx.entity);
    this._preStep?.(entity, this.getOrInitState(ctx), {
      world: ctx.world,
      frame: ctx.frame,
      entity,
    });
  };

  postStep = (ctx: { world: W; frame: FrameData; entity: EntityData }) => {
    const entity = this.getWrapper(ctx.entity);
    this._postStep?.(entity, this.getOrInitState(ctx), {
      world: ctx.world,
      frame: ctx.frame,
      entity,
    });
  };

  dispose = (ctx: { world: W; entity: EntityData }) => {
    const entity = this.getWrapper(ctx.entity);
    this._dispose?.(entity, this.getOrInitState(ctx), {
      world: ctx.world,
      entity,
    });
  };

  runsOn = (prefab: Prefab<any>) => {
    return this._runsOn(prefab);
  };
}
