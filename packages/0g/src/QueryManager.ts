import { Game } from './Game';
import { ObjectPool } from './internal/objectPool';
import { Query, QueryComponentFilter } from './Query';

// TODO: reuse queries with identical definitions!
export class QueryManager {
  private pool: ObjectPool<Query<any>>;

  constructor(private game: Game) {
    this.pool = new ObjectPool<Query<any>>(() => new Query(this.game));
  }

  create<Def extends QueryComponentFilter>(userDef: Def) {
    const query = this.pool.acquire();
    query.initialize(userDef);
    return query as Query<Def>;
  }

  release(query: Query<any>) {
    this.pool.release(query);
  }
}
