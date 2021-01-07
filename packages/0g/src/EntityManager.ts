import { EventEmitter } from 'events';
import { Entity } from './Entity';
import { Game } from './Game';
import { ObjectPool } from './internal/objectPool';
import { logger } from './logger';
import SparseMap from 'mnemonist/sparse-map';

export declare interface EntityManager {
  on(ev: 'entityAdded', callback: (entity: Entity) => void): this;
  on(ev: 'entityRemoved', callback: (entity: Entity) => void): this;
  on(ev: 'entityComponentAdded', callback: (entity: Entity) => void): this;
  on(ev: 'entityComponentRemoved', callback: (entity: Entity) => void): this;
  off(ev: 'entityAdded', callback: (entity: Entity) => void): this;
  off(ev: 'entityRemoved', callback: (entity: Entity) => void): this;
  off(ev: 'entityComponentAdded', callback: (entity: Entity) => void): this;
  off(ev: 'entityComponentRemoved', callback: (entity: Entity) => void): this;
}

export class EntityManager extends EventEmitter {
  private pool = new ObjectPool(() => new Entity(this.__game));
  private _destroyList = new Array<number>();
  private entityMap = new SparseMap<Entity>(this.__game.constants.maxEntities);

  constructor(private __game: Game) {
    super();
    this.__game.on('postStep', this.executeDestroys);
  }

  get ids() {
    return this.entityMap.keys();
  }

  get entityList() {
    return this.entityMap.values();
  }

  has(id: number) {
    return this.entityMap.has(id);
  }

  create(ownId: number | null = null) {
    const id = ownId || this.__game.idManager.get();

    const ent = this.pool.acquire();
    ent.id = id;

    this.entityMap.set(id, ent);
    this.emit('entityAdded', ent);
    this.__game.queries.onEntityCreated(ent);
    logger.debug(`Added ${id}`);
    return ent;
  }

  get(id: number) {
    const ent = this.entityMap.get(id);
    return ent ?? null;
  }

  destroy(id: number) {
    this._destroyList.push(id);
    logger.debug(`Queueing ${id} for destroy`);
  }

  executeDestroys = () => {
    this._destroyList.forEach(this.executeDestroy);
    this._destroyList.length = 0;
  };

  private executeDestroy = (id: number) => {
    const entity = this.entityMap.get(id);
    if (!entity || entity.id !== id) {
      throw new Error(`Attempted to destroy entity ${id} which was not valid`);
    }
    this.entityMap.delete(id);
    this.pool.release(entity);
    this.__game.idManager.release(id);

    this.emit('entityRemoved', entity);
    this.__game.queries.onEntityDestroyed(entity);
    logger.debug(`Destroyed ${id}`);
  };

  serialize() {
    const serialized = [];
    for (const ent of this.entityList) {
      serialized.push(this.serializeEntity(ent));
    }
    return serialized;
  }

  private serializeEntity(entity: Entity) {
    return null; // TODO
  }
}
