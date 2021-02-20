import { ComponentInstanceFor, ComponentType } from '../components';
import { EntityImpostor } from '../EntityImpostor';
import { Game } from '../Game';
import { Poolable } from '../internal/objectPool';

export type StateCleanupFn = () => void;

export interface StateAPI<ComponentDeps extends ComponentType[] = []> {
  /**
   * Called when a State is first associated with an Entity that matches its Component
   * dependencies. This should reset the State according to any defaults and configure
   * any one-time initial properties from Component data.
   *
   * @returns {Promise<StateCleanupFn> | StateCleanupFn} runs when the state lapses,
   *   your opportunity to clean up resources allocated during initialize
   */
  initialize(
    entity: EntityImpostor<ComponentInstanceFor<ComponentDeps[0]>>,
  ): Promise<StateCleanupFn> | StateCleanupFn;
}

export class State<ComponentDeps extends ComponentType[] = []>
  implements Poolable {
  __alive = false;
  private _promise: Promise<void> = Promise.resolve();
  private _cleanup: StateCleanupFn = () => {};
  private _ready = false;

  constructor(private _type: number, private api: StateAPI<ComponentDeps>) {}

  // calls initialize on the user-defined API. If initialize
  // is async, the promise chain is assigned to _promise. Otherwise
  // _promise gets an immediate resolution, and cleanup is assigned
  // directly.
  initialize = async (
    entity: EntityImpostor<ComponentInstanceFor<ComponentDeps[0]>>,
  ) => {
    this._ready = false;
    const initResult = this.api.initialize(entity);
    if (initResult instanceof Promise) {
      this._promise = initResult.then((cleanup) => {
        this._ready = true;
        this._cleanup = cleanup;
      });
    } else {
      this._ready = true;
      this._promise = Promise.resolve();
      this._cleanup = initResult;
    }
  };

  destroy = async () => {
    await this._promise;
    this._cleanup();
  };

  reset = () => {
    this._ready = false;
    this._promise = Promise.resolve();
    this._cleanup = () => {};
  };

  get ready() {
    return this._ready;
  }

  get type() {
    return this._type;
  }
}

export interface StateCreator<Deps extends ComponentType[]> {
  (game: Game): State<Deps>;
  dependencies: Deps;
  id: number;
}

export function makeState<Deps extends ComponentType[]>(
  dependencies: Deps,
  stateFn: (game: Game) => StateAPI<Deps>,
) {
  const stateCreator: StateCreator<Deps> = ((game: Game) => {
    const userApi = stateFn(game);
    return new State(stateCreator.id, userApi);
  }) as any;
  stateCreator.dependencies = dependencies;
  return stateCreator;
}
