import { StoreSpec } from './store';
import { Entity } from './entity';
import { EventEmitter } from 'events';
import { logger } from './logger';

export declare interface QueryEvents {
  on(event: 'entityAdded', callback: (entity: Entity) => void): this;
  on(event: 'entityRemoved', callback: (entity: Entity) => void): this;
  off(event: 'entityAdded', callback: (entity: Entity) => void): this;
  off(event: 'entityRemoved', callback: (entity: Entity) => void): this;
}
export class QueryEvents extends EventEmitter {}

export type QueryDef = {
  all?: StoreSpec[];
  none?: StoreSpec[];
};

function toKey(def: QueryDef): string {
  return `a:${(def.all ?? [])
    .map((s) => s.key)
    .sort()
    .toString()},n:${(def.none ?? [])
    .map((s) => s.key)
    .sort()
    .toString()}`;
}

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

  get key(): string {
    return toKey(this.def);
  }
}

export class QueryManager {
  private queryCache: Record<string, Query<any>> = {};

  create<Def extends QueryDef>(userDef: Partial<Def>) {
    const def = {
      all: [],
      none: [],
      ...userDef,
    };
    const key = toKey(def);
    if (!this.queryCache[key]) {
      this.queryCache[key] = new Query(def);
    }
    return this.queryCache[key]!;
  }

  onEntityCreated = (entity: Entity) => {
    // FIXME: perf?
    for (const query of Object.values(this.queryCache)) {
      query.evaluate(entity);
    }
  };

  onEntityDestroyed = (entity: Entity) => {
    // FIXME: perf?
    for (const query of Object.values(this.queryCache)) {
      // FIXME: not working
      // if (entity.__queries.has(query)) {
      query.remove(entity);
      // }
    }
  };

  onEntityStoresChanged = (entity: Entity) => {
    logger.debug(`Entity stores changed: ${entity.id}`);
    // FIXME: perf?
    for (const query of Object.values(this.queryCache)) {
      query.evaluate(entity);
    }
  };
}

export const queryManager = new QueryManager();

export type MapDefsToQueries<Defs extends Record<string, QueryDef>> = {
  [K in keyof Defs]: Query<Defs[K]>;
};
