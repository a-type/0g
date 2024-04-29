import { EventEmitter } from 'events';
import { QueryManager } from './QueryManager.js';
import { ComponentType, ComponentInstance } from './Component.js';
import { ComponentManager } from './ComponentManager.js';
import { IdManager } from './IdManager.js';
import { ArchetypeManager } from './ArchetypeManager.js';
import { Operation, OperationQueue } from './operations.js';
import { Entity } from './Entity.js';
import { Resources } from './Resources.js';
import { ObjectPool } from './internal/objectPool.js';
import { RemovedList } from './RemovedList.js';
import { Assets } from './Assets.js';
import { QueryComponentFilter } from './Query.js';
import { EntityImpostorFor } from './QueryIterator.js';
import type { AssetLoaders, Globals } from './index.js';

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
  destroyEntities(): any;
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
  private _queryManager: QueryManager;
  private _idManager = new IdManager();
  private _archetypeManager: ArchetypeManager;
  private _operationQueue: OperationQueue = [];
  private _componentManager: ComponentManager;
  private _globals = new Resources<Globals>();
  private _runnableCleanups: (() => void)[];
  private _entityPool = new ObjectPool(() => new Entity());
  private _removedList = new RemovedList();
  private _assets: Assets<AssetLoaders>;

  // TODO: configurable?
  private _phases = ['preStep', 'step', 'postStep'] as const;

  private _delta = 0;
  private _time = 0;

  private _constants: GameConstants = {
    maxComponentId: 256,
    maxEntities: 2 ** 16,
  };

  constructor({
    components,
    systems = [],
    assetLoaders = {},
  }: {
    components: ComponentType<any>[];
    systems?: ((game: Game) => () => void)[];
    assetLoaders?: AssetLoaders;
  }) {
    super();
    this.setMaxListeners(Infinity);
    this._componentManager = new ComponentManager(components, this);
    this._assets = new Assets(assetLoaders);
    this._queryManager = new QueryManager(this);
    this._archetypeManager = new ArchetypeManager(this);
    this._runnableCleanups = systems.map((sys) => sys(this));
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
  get globals() {
    return this._globals;
  }
  get assets() {
    return this._assets;
  }
  get entityPool() {
    return this._entityPool;
  }

  /**
   * Allocates a new entity id and enqueues an operation to create the entity at the next opportunity.
   */
  create = () => {
    const id = this.idManager.get();
    this._operationQueue.push({
      op: 'createEntity',
      entityId: id,
    });
    return id;
  };

  /**
   * Enqueues an entity to be destroyed at the next opportunity
   */
  destroy = (id: number) => {
    this._operationQueue.push({
      op: 'removeEntity',
      entityId: id,
    });
  };

  /**
   * Add a component to an entity.
   */
  add = <ComponentShape>(
    entityId: number,
    Type: ComponentType<ComponentShape>,
    initial?: Partial<ComponentShape>,
  ) => {
    this._operationQueue.push({
      op: 'addComponent',
      entityId,
      componentType: Type.id,
      initialValues: initial,
    });
  };

  /**
   * Remove a component by type from an entity
   */
  remove = <T extends ComponentType<any>>(entityId: number, Type: T) => {
    this._operationQueue.push({
      op: 'removeComponent',
      entityId,
      componentType: Type.id,
    });
  };

  /**
   * Get a single entity by its known ID
   */
  get = (entityId: number): Entity<any> | null => {
    return (
      this.archetypeManager.getEntity(entityId) ??
      this._removedList.get(entityId)
    );
  };

  /**
   * Run some logic for each entity that meets an ad-hoc query.
   */
  query = <Filter extends QueryComponentFilter>(
    filter: Filter,
    run: (entity: EntityImpostorFor<Filter>, game: this) => void,
  ): void => {
    const query = this._queryManager.create(filter);
    let ent;
    for (ent of query) {
      run(ent, this);
    }
  };

  /**
   * Manually step the game simulation forward. Provide a
   * delta (in ms) of time elapsed since last frame.
   */
  step = (delta: number) => {
    this._delta = delta;
    this._phases.forEach((phase) => {
      this.emit(phase);
    });
    this.emit('destroyEntities');
    this._removedList.flush(this.destroyEntity);
    this.emit('preApplyOperations');
    this.flushOperations();
    this.emit('stepComplete');
  };

  enqueueOperation = (operation: Operation) => {
    this._operationQueue.push(operation);
  };

  private destroyEntity = (entity: Entity) => {
    entity.components.forEach((instance) => {
      if (instance) this.componentManager.release(instance);
    });
    this.entityPool.release(entity);
  };

  private flushOperations = () => {
    while (this._operationQueue.length) {
      this.applyOperation(this._operationQueue.shift()!);
    }
  };

  private applyOperation = (operation: Operation) => {
    let instance: ComponentInstance<any>;
    let entity: Entity;

    switch (operation.op) {
      case 'addComponent':
        if (operation.entityId === 0) break;

        instance = this.componentManager.acquire(
          operation.componentType,
          operation.initialValues,
        );
        this.archetypeManager.addComponent(operation.entityId, instance);
        break;
      case 'removeComponent':
        if (operation.entityId === 0) break;

        instance = this.archetypeManager.removeComponent(
          operation.entityId,
          operation.componentType,
        );
        if (instance) {
          this.componentManager.release(instance);
        }
        break;
      case 'createEntity':
        this.archetypeManager.createEntity(operation.entityId);
        break;
      case 'removeEntity':
        if (operation.entityId === 0) break;

        entity = this.archetypeManager.destroyEntity(operation.entityId);

        this._removedList.add(entity);
        break;
      case 'markChanged':
        this.componentManager.markChanged(operation.componentId);
        break;
    }
  };
}
