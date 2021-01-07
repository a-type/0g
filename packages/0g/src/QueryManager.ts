import { Entity } from './Entity';
import { Game } from './Game';
import { logger } from './logger';
import { Query, QueryDef } from './Query';

export class QueryManager {
  private queryCache: Record<string, Query<any>> = {};

  constructor(private __game: Game) {}

  create<Def extends QueryDef>(userDef: Partial<Def>) {
    const def = {
      all: [],
      none: [],
      ...userDef,
    };
    const key = Query.defToKey(def);
    if (!this.queryCache[key]) {
      this.queryCache[key] = new Query(def);
    }

    // evaluate all existing entities
    this.__game.entityManager.entityList.forEach((entity) => {
      this.queryCache[key].evaluate(entity);
    });

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

  get queryCount() {
    return Object.keys(this.queryCache).length;
  }
}
