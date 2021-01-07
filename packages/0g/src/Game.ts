import { EventEmitter } from 'events';
import * as input from './input';
import { EntityManager } from './EntityManager';
import { QueryManager } from './QueryManager';
import { Component, ComponentType } from './components';
import { ComponentManager } from './ComponentManager';
import { System, SystemSpec } from './System';
import { IdManager } from './IdManager';

export type GamePlayState = 'paused' | 'running';

export type GameConstants = {
  maxComponentId: number;
  maxEntities: number;
};

export declare interface Game {
  on(event: 'preStep', callback: () => any): this;
  on(event: 'step', callback: () => any): this;
  on(event: 'postStep', callback: () => any): this;
  on(event: 'playStateChanged', callback: (state: GamePlayState) => void): this;
  off(event: 'preStep', callback: () => any): this;
  off(event: 'step', callback: () => any): this;
  off(event: 'postStep', callback: () => any): this;
  off(
    event: 'playStateChanged',
    callback: (state: GamePlayState) => void,
  ): this;
}

export class Game extends EventEmitter {
  private _entityManager = new EntityManager(this);
  private _systems: SystemSpec[];
  private _systemInstances: System[];
  private _queryManager = new QueryManager(this);
  private _componentManager;
  private _idManager = new IdManager();

  private _raf: (cb: FrameRequestCallback) => number;
  private _cancelRaf: (handle: number) => void;

  _playState: GamePlayState;

  private _lastFrameTime: DOMHighResTimeStamp | null = null;
  private _delta = 0;
  private _time = 0;
  private _frameHandle = 0;

  globals: Map<string, any>;

  private _constants: GameConstants = {
    maxComponentId: 256,
    maxEntities: 2 ** 16,
  };

  constructor({
    components,
    requestFrame = requestAnimationFrame.bind(window),
    cancelFrame = cancelAnimationFrame.bind(window),
    initialPlayState: initialState = 'paused',
    systems = [],
    globals = new Map(),
  }: {
    components: ComponentType[];
    requestFrame?: (callback: FrameRequestCallback) => number;
    cancelFrame?: (frameHandle: number) => void;
    initialPlayState?: GamePlayState;
    systems?: SystemSpec[];
    globals?: Map<string, any>;
  }) {
    super();
    this.setMaxListeners(Infinity);
    this._componentManager = new ComponentManager(components, this);
    this._systems = systems;
    this._systemInstances = systems.map((Sys) => new Sys(this));
    this._raf = requestFrame;
    this._cancelRaf = cancelFrame;
    this._playState = initialState;
    this.globals = globals;
    if (this._playState === 'running') {
      this.resume();
    }
  }

  get idManager() {
    return this._idManager;
  }
  get entityManager() {
    return this._entityManager;
  }
  get componentManager() {
    return this._componentManager;
  }
  get systems() {
    return this._systems;
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
  get constants() {
    return this._constants;
  }

  get = (id: number) => {
    return this.entityManager.get(id);
  };
  create = (ownId: number | null = null) => {
    return this._entityManager.create(ownId);
  };
  destroy = (id: number) => {
    return this._entityManager.destroy(id);
  };

  /** Resumes a paused game. Functionally equivalent to .play() */
  resume = () => {
    this._playState = 'running';
    this._lastFrameTime = null;
    this.runFrame(performance.now());
    this.emit('playStateChanged', this._playState);
  };
  /**
   * Start the built-in frame loop. This is the simplest way
   * to get a game playing, but you can manually step the game
   * using the .step(delta) method instead if you want to
   * coordinate with a different animation frame loop (such as
   * a WebXR session or Three.JS clock)
   */
  play = this.resume;

  /**
   * Pauses the built-in game loop. Will not have any effect
   * if you manually step the game using .step(delta).
   */
  pause = () => {
    this._playState = 'paused';
    // TODO: does this make sense?
    // this._cancelRaf(this._frameHandle);
    this.emit('playStateChanged', this._playState);
  };

  loadScene = (serialized: { id: string; data: Record<string, any> }[]) => {
    // TODO
  };

  saveScene = () => {
    return this._entityManager.serialize();
  };

  /**
   * Manually step the game simulation forward. Provide a
   * delta (in ms) of time elapsed since last frame.
   */
  step = (delta: number) => {
    this._delta = delta;
    this.emit('preStep');
    this.emit('step');
    this.emit('postStep');
  };

  input = input;

  private runFrame = (time: DOMHighResTimeStamp) => {
    if (this._playState === 'running')
      this._frameHandle = this._raf(this.runFrame);

    this._time = time;
    this._delta =
      this._lastFrameTime != null ? time - this._lastFrameTime : 16 + 2 / 3;

    this.step(this._delta);
  };
}
