import { EventEmitter } from 'events';
import * as input from './input';
import { EntityManager } from './entityManager';
import { QueryManager } from './queryManager';
import { Store } from './stores';
import { StoreManager } from './storeManager';
import { System, SystemSpec } from './systems';

export type GamePlayState = 'paused' | 'running';

export declare interface Game {
  on(event: 'step', callback: () => void): this;
  on(event: 'playStateChanged', callback: (state: GamePlayState) => void): this;
}

export class Game extends EventEmitter {
  private _entityManager = new EntityManager();
  private _stores: Record<string, Store>;
  private _systems: SystemSpec[];
  private _systemInstances: System[];
  private _queryManager = new QueryManager();
  private _storeManager = new StoreManager();

  private _raf: (cb: FrameRequestCallback) => number;
  private _cancelRaf: (handle: number) => void;

  _playState: GamePlayState;

  private _lastFrameTime: DOMHighResTimeStamp | null = null;
  private _delta = 0;
  private _time = 0;
  private _frameHandle = 0;

  constructor({
    stores,
    requestFrame = requestAnimationFrame.bind(window),
    cancelFrame = cancelAnimationFrame.bind(window),
    initialPlayState: initialState = 'running',
    systems = [],
  }: {
    stores: Record<string, Store>;
    requestFrame?: (callback: FrameRequestCallback) => number;
    cancelFrame?: (frameHandle: number) => void;
    initialPlayState?: GamePlayState;
    systems?: SystemSpec[];
  }) {
    super();
    this._entityManager.__game = this;
    this._queryManager.__game = this;
    this.setMaxListeners(Infinity);
    this._stores = stores;
    this._systems = systems;
    this._systemInstances = systems.map((Sys) => new Sys(this));
    this._raf = requestFrame;
    this._cancelRaf = cancelFrame;
    this._playState = initialState;
    if (this._playState === 'running') {
      this.resume();
    }
  }

  get entities() {
    return this._entityManager;
  }
  get storeSpecs() {
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
  get queries() {
    return this._queryManager;
  }
  get stores() {
    return this._storeManager;
  }

  get = (id: string) => {
    return this.entities.entities[id] ?? null;
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
    this.emit('playStateChanged', this._playState);
  };

  pause = () => {
    this._playState = 'paused';
    // TODO: does this make sense?
    // this._cancelRaf(this._frameHandle);
    this.emit('playStateChanged', this._playState);
  };

  loadScene = (serialized: { id: string; data: Record<string, any> }[]) => {
    for (const entry of serialized) {
      const spec = Object.keys(entry.data).map(
        (storeKind) => this._stores[storeKind]!,
      );
      const entity = this.create(entry.id);
      for (const store of spec) {
        entity.add(store, entry.data[store.name]);
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

    this.emit('step');

    // cleanup destroyed
    this._entityManager.executeDestroys();
  };
}
