import { QueryManager } from './QueryManager.js';
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
import {
  type AssetLoaders,
  type BaseShape,
  type ComponentInstanceInternal,
  type Globals,
} from './index.js';
import { EventSubscriber } from '@a-type/utils';
import { ComponentHandle } from './Component2.js';
import { allSystems } from './System.js';

export type GameConstants = {
  maxComponentId: number;
  maxEntities: number;
};

export type GameEvents = {
  preStep(): any;
  step(): any;
  postStep(): any;
  stepComplete(): any;
  preApplyOperations(): any;
  destroyEntities(): any;
};

export class Game extends EventSubscriber<GameEvents> {
  private _queryManager: QueryManager;
  private _entityIds = new IdManager((...msgs) =>
    console.debug('Entity IDs:', ...msgs),
  );
  private _archetypeManager: ArchetypeManager;
  private _operationQueue: OperationQueue = [];
  private _componentManager: ComponentManager;
  private _globals = new Resources<Globals>();
  private _runnableCleanups: (() => void)[];
  private _entityPool = new ObjectPool(
    () => new Entity(),
    (e) => e.reset(),
  );
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

  constructor({ assetLoaders = {} }: { assetLoaders?: AssetLoaders } = {}) {
    super();
    this._componentManager = new ComponentManager(this);
    this._assets = new Assets(assetLoaders);
    this._queryManager = new QueryManager(this);
    this._archetypeManager = new ArchetypeManager(this);

    if (allSystems.length === 0) {
      throw new Error(
        'No systems are defined at the type of game construction. You have to define systems before calling the Game constructor. Did you forget to import modules which define your systems?',
      );
    }
    this._runnableCleanups = allSystems
      .map((sys) => sys(this))
      .filter(Boolean) as (() => void)[];
    console.debug(`Registered ${allSystems.length} systems`);
  }

  get entityIds() {
    return this._entityIds;
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
    const id = this.entityIds.get();
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
  add = <ComponentShape extends BaseShape>(
    entity: number | Entity,
    handle: ComponentHandle<ComponentShape>,
    initial?: Partial<ComponentShape>,
  ) => {
    const entityId = typeof entity === 'number' ? entity : entity.id;
    this._operationQueue.push({
      op: 'addComponent',
      entityId,
      componentType: handle.id,
      initialValues: initial,
    });
  };

  /**
   * Remove a component by type from an entity
   */
  remove = <T extends ComponentHandle>(entity: number | Entity, Type: T) => {
    const entityId = typeof entity === 'number' ? entity : entity.id;
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

  find = <Filter extends QueryComponentFilter>(
    filter: Filter,
  ): EntityImpostorFor<Filter>[] => {
    const query = this._queryManager.create(filter);
    return Array.from(query);
  };

  findFirst = <Filter extends QueryComponentFilter>(
    filter: Filter,
  ): EntityImpostorFor<Filter> | null => {
    const query = this._queryManager.create(filter);
    return query.iterator.next().value ?? null;
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
    let instance: ComponentInstanceInternal | undefined;
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

        this.entityIds.release(operation.entityId);
        this._removedList.add(entity);
        break;
      case 'markChanged':
        this.componentManager.markChanged(operation.componentId);
        break;
    }
  };
}
