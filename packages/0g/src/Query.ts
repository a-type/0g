import { Entity } from './Entity';
import { EventEmitter } from 'events';
import { logger } from './logger';
import { ComponentType } from './components';

export declare interface Query {
  on(event: 'entityAdded', callback: (entity: Entity) => void): this;
  on(event: 'entityRemoved', callback: (entity: Entity) => void): this;
  off(event: 'entityAdded', callback: (entity: Entity) => void): this;
  off(event: 'entityRemoved', callback: (entity: Entity) => void): this;
}

export type QueryDef = {
  all?: ComponentType[];
  none?: ComponentType[];
};

export class Query<Def extends QueryDef = QueryDef> extends EventEmitter {
  entities = new Array<Entity>();

  constructor(public def: Def) {
    super();
  }

  evaluate(entity: Entity) {
    const hasAll =
      !this.def.all?.length ||
      this.def.all.every((spec) => entity.maybeGet(spec));
    const pass =
      hasAll &&
      (!this.def.none?.length ||
        this.def.none.every((spec) => !entity.maybeGet(spec)));

    if (pass) {
      this.add(entity);
    } else {
      this.remove(entity);
    }
  }

  add(entity: Entity) {
    if (this.entities.includes(entity)) return;

    this.entities.push(entity);
    entity.__queries.add(this);
    logger.debug(`Added ${entity.id} to ${this.key}`);
    this.emit('entityAdded', entity);
  }

  remove(entity: Entity) {
    const index = this.entities.indexOf(entity);
    if (index !== -1) {
      this.entities.splice(index, 1);
      entity.__queries.delete(this);
      logger.debug(`Removed ${entity.id} from ${this.key}`);
      this.emit('entityRemoved', entity);
    }
  }

  get stats() {
    return {
      count: this.entities.length,
    };
  }

  static defToKey(def: QueryDef): string {
    return `a:${(def.all ?? [])
      .map((s) => s.name)
      .sort()
      .toString()},n:${(def.none ?? [])
      .map((s) => s.name)
      .sort()
      .toString()}`;
  }

  get key(): string {
    return Query.defToKey(this.def);
  }
}
