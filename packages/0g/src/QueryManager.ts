import { Game } from './Game';
import { ObjectPool } from './internal/objectPool';
import { Query, QueryDef } from './Query';

// TODO: reuse queries with identical definitions!
export class QueryManager {
  private pool: ObjectPool<Query>;

  constructor(private game: Game) {
    this.pool = new ObjectPool<Query>(() => new Query(this.game));
  }

  create<Def extends QueryDef>(userDef: Partial<Def>) {
    const def = {
      all: [],
      none: [],
      ...userDef,
    };

    const query = this.pool.acquire();
    query.initialize(def);
    return query;
  }

  release(query: Query) {
    this.pool.release(query);
  }
}
