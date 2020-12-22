import { EventEmitter } from 'events';
import { makeAutoObservable } from 'mobx';
import shortid from 'shortid';
import { Entity } from './entity';
import { ObjectPool } from './internal/objectPool';
import { logger } from './logger';
import { queryManager } from './queries';
import { StoreShape, StoreSpec } from './store';

export declare interface EntityManagerEvents {
  on(ev: 'entityAdded', callback: (entity: Entity) => void): this;
  on(ev: 'entityRemoved', callback: (entity: Entity) => void): this;
  on(ev: 'entityStoreAdded', callback: (entity: Entity) => void): this;
  on(ev: 'entityStoreRemoved', callback: (entity: Entity) => void): this;
  off(ev: 'entityAdded', callback: (entity: Entity) => void): this;
  off(ev: 'entityRemoved', callback: (entity: Entity) => void): this;
}

export class EntityManagerEvents extends EventEmitter {}

export class EntityManager {
  events = new EntityManagerEvents();
  pool = new ObjectPool(() => new Entity());

  _destroyList = new Array<string>();

  entities: Record<string, Entity> = {};
  get ids() {
    return Object.keys(this.entities);
  }
  get entityList() {
    return Object.values(this.entities);
  }
  has(id: string) {
    return !!this.entities[id];
  }

  constructor() {
    makeAutoObservable(this);
  }

  create(ownId: string | null = null) {
    const id = ownId || shortid();

    const ent = this.pool.acquire();
    ent.__manager = this;
    ent.id = id;

    this.entities[id] = ent;
    const registered = this.entities[id];

    this.events.emit('entityAdded', registered);
    queryManager.onEntityCreated(registered);
    logger.debug(`Added ${id}`);
    return registered;
  }

  destroy(id: string) {
    this._destroyList.push(id);
    logger.debug(`Queueing ${id} for destroy`);
  }

  addStoreToEntity<Spec extends StoreSpec>(
    entity: Entity,
    spec: Spec,
    initial?: Partial<StoreShape<Spec>>,
  ) {
    logger.debug(`Adding ${spec.key} to ${entity.id}`);
    const data = spec.acquire();
    if (initial) {
      Object.assign(data, initial);
    }
    entity.__data.set(spec, data);
    this.events.emit('entityStoreAdded', entity);
    queryManager.onEntityStoresChanged(entity);
    return data;
  }

  removeStoreFromEntity(entity: Entity, spec: StoreSpec) {
    if (!entity.__data.has(spec)) return entity;
    entity.__data.delete(spec);
    this.events.emit('entityStoreRemoved', entity);
    queryManager.onEntityStoresChanged(entity);
    return entity;
  }

  executeDestroys = () => {
    this._destroyList.forEach(this.executeDestroy);
    this._destroyList.length = 0;
  };

  private executeDestroy = (id: string) => {
    const entity = this.entities[id];
    delete this.entities[id];
    this.pool.release(entity);
    this.events.emit('entityRemoved', entity);
    queryManager.onEntityDestroyed(entity);
    logger.debug(`Destroyed ${id}`);
  };

  serialize() {
    return this.entityList.map(this.serializeEntity);
  }

  private serializeEntity(entity: Entity) {
    const s = {
      id: entity.id,
      data: {} as Record<string, any>,
    };
    for (const [spec, dat] of entity.__data.entries()) {
      // ephemeral, recreated at runtime on load
      if (spec.role === 'state') return;
      s.data[spec.key] = dat;
    }
    return s;
  }
}
