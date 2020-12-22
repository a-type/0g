import { EventEmitter } from 'events';
import { action, computed, makeObservable, observable } from 'mobx';
import { logger } from './logger';
import { System } from './system';
import { Entity } from './entity';
import * as input from './input';
import { StoreSpec } from './store';
import { EntityManager } from './entityManager';
import { queryManager } from './queries';

export type GamePlayState = 'paused' | 'running';

export enum GameEvent {
  Step = 'step',
  Add = 'add',
  Destroy = 'destroy',
}

export declare interface Game {
  on(event: GameEvent.Step, callback: () => void): this;
  on(event: GameEvent.Add, callback: (entity: Entity) => void): this;
  on(event: GameEvent.Destroy, callback: (entity: Entity) => void): this;
}

export class Game extends EventEmitter {
  private _entityManager = new EntityManager();
  private _systems = new Array<System<any>>();
  private _stores: Record<string, StoreSpec<any>>;

  private _raf: (cb: FrameRequestCallback) => number;
  private _cancelRaf: (handle: number) => void;

  _playState: GamePlayState;

  private _lastFrameTime: DOMHighResTimeStamp | null = null;
  private _delta = 0;
  private _time = 0;
  private _frameHandle = 0;

  constructor({
    systems,
    stores,
    requestFrame = requestAnimationFrame.bind(window),
    cancelFrame = cancelAnimationFrame.bind(window),
    initialPlayState: initialState = 'running',
  }: {
    systems: Array<System<any>>;
    stores: Record<string, StoreSpec<any>>;
    requestFrame?: (callback: FrameRequestCallback) => number;
    cancelFrame?: (frameHandle: number) => void;
    initialPlayState?: GamePlayState;
  }) {
    super();
    this.setMaxListeners(Infinity);
    this._systems = systems;
    this._stores = stores;

    logger.debug(
      `System run order: ${this._systems.map((s) => s.name).join(', ')}`,
    );

    this._raf = requestFrame;
    this._cancelRaf = cancelFrame;
    this._playState = initialState;
    if (this._playState === 'running') {
      this.resume();
    }

    makeObservable(this, {
      _playState: observable,
      playState: computed,
      resume: action,
      pause: action,
      isPaused: computed,
    });
  }

  get state() {
    return this._entityManager;
  }
  get systems() {
    return this._systems;
  }
  get stores() {
    return this._stores;
  }
  get playState() {
    return this._playState;
  }
  get isPaused() {
    return this._playState === 'paused';
  }
  get delta() {
    return this._delta;
  }
  get time() {
    return this._time;
  }

  get = (id: string) => {
    return this.state.entities[id] ?? null;
  };
  create = (ownId: string | null = null) => {
    return this._entityManager.create(ownId);
  };
  destroy = (id: string) => {
    return this._entityManager.destroy(id);
  };

  resume = () => {
    this._playState = 'running';
    this._lastFrameTime = null;
    this.runFrame(performance.now());
  };

  pause = () => {
    this._playState = 'paused';
    // TODO: does this make sense?
    // this._cancelRaf(this._frameHandle);
  };

  loadScene = (serialized: { id: string; data: Record<string, any> }[]) => {
    for (const entry of serialized) {
      const spec = Object.keys(entry.data).map(
        (storeKind) => this._stores[storeKind]!,
      );
      const entity = this.create(entry.id);
      for (const store of spec) {
        entity.add(store, entry.data[store.key]);
      }
    }
  };

  saveScene = () => {
    return this._entityManager.serialize();
  };

  input = input;

  private runFrame = (time: DOMHighResTimeStamp) => {
    if (this._playState === 'running')
      this._frameHandle = this._raf(this.runFrame);

    this._time = time;
    this._delta =
      this._lastFrameTime != null ? time - this._lastFrameTime : 16 + 2 / 3;

    this.emit(GameEvent.Step);
    this.systems.forEach(this.runSystem);

    // cleanup destroyed
    this._entityManager.executeDestroys();
  };

  private runSystem = (system: System<any>) => {
    system.run(this);
  };
}
