import { EventEmitter } from 'events';
import * as input from './input';
import { QueryManager } from './QueryManager';
import { Component, ComponentInstanceFor, ComponentType } from './components';
import { ComponentManager } from './ComponentManager';
import { System, SystemSpec } from './System';
import { IdManager } from './IdManager';
import { ArchetypeManager } from './ArchetypeManager';
import { Operation, OperationQueue } from './operations';
import { EntityImpostor } from './EntityImpostor';
import { StateManager } from './state/StateManager';
import { StateCreator } from './state/State';

export type GameConstants = {
  maxComponentId: number;
  maxEntities: number;
};

export interface GameEvents {
  preStep(): any;
  step(): any;
  postStep(): any;
  stepComplete(): any;
  preApplyOperations(): any;
}

export declare interface Game {
  on<U extends keyof GameEvents>(event: U, callback: GameEvents[U]): this;
  off<U extends keyof GameEvents>(event: U, callback: GameEvents[U]): this;
  emit<U extends keyof GameEvents>(
    event: U,
    ...args: Parameters<GameEvents[U]>
  ): boolean;
}

export class Game extends EventEmitter {
  private _systems: SystemSpec[];
  private _systemInstances: System[];
  private _queryManager: QueryManager;
  private _idManager = new IdManager();
  private _archetypeManager: ArchetypeManager;
  private _operationQueue: OperationQueue = [];
  private _componentManager: ComponentManager;
  private _stateManager: StateManager;

  // TODO: configurable?
  private _phases = ['preStep', 'step', 'postStep'] as const;

  private _delta = 0;
  private _time = 0;

  globals: Map<string, any>;

  private _constants: GameConstants = {
    maxComponentId: 256,
    maxEntities: 2 ** 16,
  };

  constructor({
    components,
    systems = [],
    globals = new Map(),
    states = [],
  }: {
    components: ComponentType[];
    systems?: SystemSpec[];
    globals?: Map<string, any>;
    states?: StateCreator<any>[];
  }) {
    super();
    this.setMaxListeners(Infinity);
    this._componentManager = new ComponentManager(components, this);
    this._queryManager = new QueryManager(this);
    this._archetypeManager = new ArchetypeManager(this);
    this._stateManager = new StateManager(states);
    this._systems = systems;
    this._systemInstances = systems.map((Sys) => new Sys(this));
    this.globals = globals;
  }

  get idManager() {
    return this._idManager;
  }
  get componentManager() {
    return this._componentManager;
  }
  get archetypeManager() {
    return this._archetypeManager;
  }
  get stateManager() {
    return this._stateManager;
  }
  get systems() {
    return this._systems;
  }
  get delta() {
    return this._delta;
  }
  get time() {
    return this._time;
  }
  get queryManager() {
    return this._queryManager;
  }
  get constants() {
    return this._constants;
  }

  create = () => {
    const id = this.idManager.get();
    this._operationQueue.push({
      op: 'createEntity',
      entityId: id,
    });
    return id;
  };

  destroy = (id: number) => {
    this._operationQueue.push({
      op: 'destroyEntity',
      entityId: id,
    });
  };

  add = <T extends ComponentType>(
    entityId: number,
    Type: T,
    initial?: Partial<ComponentInstanceFor<T>>,
  ) => {
    this._operationQueue.push({
      op: 'addComponent',
      entityId,
      componentId: Type.id,
      initialValues: initial,
    });
  };

  remove = <T extends ComponentType>(entityId: number, Type: T) => {
    this._operationQueue.push({
      op: 'removeComponent',
      entityId,
      componentId: Type.id,
    });
  };

  get = (entityId: number): EntityImpostor | null => {
    return this.archetypeManager.getEntity(entityId);
  };

  /**
   * Manually step the game simulation forward. Provide a
   * delta (in ms) of time elapsed since last frame.
   */
  step = (delta: number) => {
    this._delta = delta;
    this._phases.forEach((phase) => {
      this._systemInstances.forEach(this.phaseRunners[phase]);
      this.emit(phase);
    });
    this.emit('preApplyOperations');
    this.flushOperations();
    this.emit('stepComplete');
  };

  private phaseSystemRunner = (phase: 'preStep' | 'step' | 'postStep') => (
    system: System,
  ) => {
    system.__gamePerformPhase(phase);
  };
  private phaseRunners = {
    preStep: this.phaseSystemRunner('preStep'),
    step: this.phaseSystemRunner('step'),
    postStep: this.phaseSystemRunner('postStep'),
  };

  private flushOperations = () => {
    while (this._operationQueue.length) {
      this.applyOperation(this._operationQueue.shift()!);
    }
  };

  private applyOperation = (operation: Operation) => {
    let instance: Component;
    switch (operation.op) {
      case 'addComponent':
        instance = this.componentManager.acquire(
          operation.componentId,
          operation.initialValues,
        );
        this.archetypeManager.addComponent(operation.entityId, instance);
        break;
      case 'removeComponent':
        instance = this.archetypeManager.removeComponent(
          operation.entityId,
          operation.componentId,
        );
        this.componentManager.release(instance);
        break;
      case 'createEntity':
        this.archetypeManager.createEntity(operation.entityId);
        break;
      case 'destroyEntity':
        const instances = this.archetypeManager.destroyEntity(
          operation.entityId,
        );
        instances.forEach(this.componentManager.release);
        break;
    }
  };

  input = input;
}
