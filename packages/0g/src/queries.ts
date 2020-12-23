import { Entity } from './entity';
import { EventEmitter } from 'events';
import { logger } from './logger';
import { Store } from './stores';
import { Game } from './Game';

export declare interface QueryEvents {
  on(event: 'entityAdded', callback: (entity: Entity) => void): this;
  on(event: 'entityRemoved', callback: (entity: Entity) => void): this;
  off(event: 'entityAdded', callback: (entity: Entity) => void): this;
  off(event: 'entityRemoved', callback: (entity: Entity) => void): this;
}
export class QueryEvents extends EventEmitter {}

export type QueryDef = {
  all?: Store[];
  none?: Store[];
};

export class Query<Def extends QueryDef> {
  entities = new Array<Entity>();
  events = new QueryEvents();

  constructor(public def: Def) {}

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
    this.events.emit('entityAdded', entity);
  }

  remove(entity: Entity) {
    const index = this.entities.indexOf(entity);
    if (index !== -1) {
      this.entities.splice(index, 1);
      entity.__queries.delete(this);
      logger.debug(`Removed ${entity.id} from ${this.key}`);
      this.events.emit('entityRemoved', entity);
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
