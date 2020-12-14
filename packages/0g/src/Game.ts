import { EventEmitter } from 'events';
import {
  action,
  computed,
  makeAutoObservable,
  makeObservable,
  observable,
} from 'mobx';
import shortid from 'shortid';
import { logger } from './logger';
import { System } from './system';
import { EntityData, Plugin, StoreData } from './types';
import * as input from './input';

export class GameState {
  entities: Record<string, EntityData<any>> = {};
  get ids() {
    return Object.keys(this.entities);
  }
  get entityList() {
    return Object.values(this.entities);
  }
  has(id: string) {
    return !!this.entities[id];
  }

  constructor(initial: Record<string, EntityData<any>> = {}) {
    this.entities = initial;
    makeAutoObservable(this);
  }
}

export type GamePlayState = 'paused' | 'running';

export enum GameEvent {
  Step = 'step',
  PreStep = 'preStep',
  PostStep = 'postStep',
  Add = 'add',
  Destroy = 'destroy',
}

export declare interface Game {
  on(event: GameEvent.Step, callback: () => void): this;
  on(event: GameEvent.PreStep, callback: () => void): this;
  on(event: GameEvent.PostStep, callback: () => void): this;
  on(event: GameEvent.Add, callback: (entity: EntityData<any>) => void): this;
  on(
    event: GameEvent.Destroy,
    callback: (entity: EntityData<any>) => void,
  ): this;
}

export class GameGlobals {
  _values: Record<string | symbol, any> = {};

  set(key: symbol | string, value: any) {
    // @ts-ignore
    this._values[key] = value;
  }

  get<T>(key: symbol | string): T {
    // @ts-ignore
    return this._values[key];
  }

  remove(key: symbol | string) {
    // @ts-ignore
    delete this._values[key];
  }

  constructor() {
    makeAutoObservable(this);
  }
}

export class Game extends EventEmitter {
  private _state = new GameState();
  private _systems = new Array<System<any>>();
  private _plugins: Record<string, Plugin> = {};

  /** cache of which systems run on each entity to reference quickly on frame */
  private _systemsByEntity = new WeakMap<EntityData<any>, Array<System<any>>>();
  private _systemRunSets: Record<string, WeakSet<EntityData<any>>> = {};

  private _raf: (cb: FrameRequestCallback) => number;
  private _cancelRaf: (handle: number) => void;

  private _destroyList = new Array<string>();

  _playState: GamePlayState;

  private _lastFrameTime: DOMHighResTimeStamp | null = null;
  private _delta = 0;
  private _frameHandle = 0;
  private _frameContext: {
    game: Game;
    entity: EntityData<any>;
    delta: number;
  } = {
    game: this,
    entity: null as any,
    delta: 0,
  };
  private _initContext: {
    game: Game;
    entity: EntityData<any>;
  } = { game: this, entity: null as any };

  /** use sparingly! */
  globals = new GameGlobals();

  constructor({
    systems,
    plugins = {},
    requestFrame = requestAnimationFrame.bind(window),
    cancelFrame = cancelAnimationFrame.bind(window),
    initialPlayState: initialState = 'running',
  }: {
    systems: Record<string, System<any>>;
    plugins?: Record<string, Plugin>;
    requestFrame?: (callback: FrameRequestCallback) => number;
    cancelFrame?: (frameHandle: number) => void;
    initialPlayState?: GamePlayState;
  }) {
    super();
    this.setMaxListeners(Infinity);
    this._systems = Object.values(systems).sort(
      (a, b) => a.priority - b.priority,
    );
    this._systems.forEach((sys) => {
      this._systemRunSets[sys.name] = new WeakSet<EntityData<any>>();
    });
    logger.debug(
      `System run order: ${this._systems.map((s) => s.name).join(', ')}`,
    );
    this._plugins = plugins;
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
    return this._state;
  }
  get systems() {
    return this._systems;
  }
  get plugins() {
    return this._plugins;
  }
  get playState() {
    return this._playState;
  }
  get isPaused() {
    return this._playState === 'paused';
  }

  get = (id: string) => {
    return this.state.entities[id] ?? null;
  };
  add = <S extends Record<string, StoreData<string, any>>>(
    initialStores: S,
    ownId: string | null = null,
  ) => {
    const id = ownId || shortid();
    const entity: EntityData<S> = {
      id,
      storesData: initialStores,
    };
    this.state.entities[id] = entity;
    // getting separately as it will have been made observable
    const registered = this.state.entities[id];
    // cache related systems
    const appliedSystems = this._systems.filter((sys) =>
      sys.runsOn(registered.storesData),
    );
    // add the entity to the run sets for each valid system
    appliedSystems.forEach((sys) => {
      this._systemRunSets[sys.name].add(registered);
    });
    this._systemsByEntity.set(registered, appliedSystems);
    this._initContext.entity = registered;
    appliedSystems.forEach(this.initSystemWithInitContext);
    logger.debug(
      `Added ${id}. Applied systems: ${appliedSystems
        .map((sys) => sys.name)
        .join(', ')}`,
    );
    // emit to listeners
    this.emit(GameEvent.Add, registered);
    // return observable entity
    return registered;
  };
  destroy = (id: string) => {
    this._destroyList.push(id);
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

  input = input;

  private runFrame = (time: DOMHighResTimeStamp) => {
    if (this._playState === 'running')
      this._frameHandle = this._raf(this.runFrame);

    this._frameContext.delta = this._delta =
      this._lastFrameTime != null ? time - this._lastFrameTime : 16 + 2 / 3;

    this.emit(GameEvent.PreStep);
    // this.state.entityList.forEach(this.runPreStepOnEntity);
    this.systems.forEach(this.preStepSystem);
    this.emit(GameEvent.Step);
    // this.state.entityList.forEach(this.runStepOnEntity);
    this.systems.forEach(this.stepSystem);
    this.emit(GameEvent.PostStep);
    // this.state.entityList.forEach(this.runPostStepOnEntity);
    this.systems.forEach(this.postStepSystem);

    // cleanup destroyed
    this.executeDestroys();
  };

  private systemRunner = (step: 'run' | 'preStep' | 'postStep') => (
    sys: System<any>,
  ) => {
    const runSet = this._systemRunSets[sys.name];
    const runOnEntity = (entity: EntityData<any>) => {
      if (!runSet.has(entity)) return;
      sys[step](entity, this._frameContext);
    };
    this.state.entityList.forEach(runOnEntity);
  };
  private stepSystem = this.systemRunner('run');
  private preStepSystem = this.systemRunner('preStep');
  private postStepSystem = this.systemRunner('postStep');

  // private runStepOnEntity = (entity: EntityData<any>) => {
  //   this._frameContext.entity = entity;
  //   this._systemsByEntity.get(entity)?.forEach(this.stepSystemWithFrameContext);
  // };

  // private stepSystemWithFrameContext = (sys: System<any>) => {
  //   sys.run(this._frameContext);
  // };

  // private runPreStepOnEntity = (entity: EntityData<any>) => {
  //   this._frameContext.entity = entity;
  //   this._systemsByEntity
  //     .get(entity)
  //     ?.forEach(this.preStepSystemWithFrameContext);
  // };

  // private preStepSystemWithFrameContext = (sys: System<any>) => {
  //   sys.preStep(this._frameContext);
  // };

  // private runPostStepOnEntity = (entity: EntityData<any>) => {
  //   this._frameContext.entity = entity;
  //   this._systemsByEntity
  //     .get(entity)
  //     ?.forEach(this.postStepSystemWithFrameContext);
  // };

  // private postStepSystemWithFrameContext = (sys: System<any>) => {
  //   sys.postStep(this._frameContext);
  // };

  private executeDestroys = () => {
    this._destroyList.forEach(this.executeDestroy);
  };

  private executeDestroy = (id: string) => {
    const entity = this.state.entities[id];
    this._systemsByEntity.get(entity)?.forEach((sys) => {
      sys.dispose(entity, this._initContext);
    });
    delete this.state.entities[id];
    this.emit(GameEvent.Destroy, entity);
  };

  private initSystemWithInitContext = (sys: System<any>) => {
    sys.init(this._initContext);
  };
}
