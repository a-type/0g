import { Game } from './Game';
import { ObjectPool } from './internal/objectPool';
import { Query, UserQueryDef } from './Query';
import { TrackingQuery } from './TrackingQuery';

// TODO: reuse queries with identical definitions!
export class QueryManager {
  private pool: ObjectPool<Query>;
  private trackingPool: ObjectPool<TrackingQuery>;

  constructor(private game: Game) {
    this.pool = new ObjectPool<Query>(() => new Query(this.game));
    this.trackingPool = new ObjectPool<TrackingQuery>(
      () => new TrackingQuery(this.game),
    );
  }

  create<Def extends UserQueryDef>(userDef: Def) {
    const query = this.pool.acquire();
    query.initialize(userDef);
    return query as Query<Def>;
  }

  createTracking<Def extends UserQueryDef>(userDef: Def) {
    const query = this.trackingPool.acquire();
    query.initialize(userDef);
    return query as TrackingQuery<Def>;
  }

  release(query: Query | TrackingQuery) {
    if (query instanceof TrackingQuery) {
      this.trackingPool.release(query);
    } else {
      this.pool.release(query);
    }
  }
}
