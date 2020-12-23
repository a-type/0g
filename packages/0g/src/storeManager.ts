import { ObjectPool } from './internal/objectPool';
import { Store, StoreInstance } from './stores';

export class StoreManager {
  private poolMap = new Map<Store, ObjectPool<StoreInstance>>();

  acquire<S extends Store>(StoreSpec: S) {
    let pool = this.poolMap.get(StoreSpec);
    if (!pool) {
      pool = new ObjectPool<StoreInstance>(() => new StoreSpec());
      this.poolMap.set(StoreSpec, pool);
    }
    return pool.acquire();
  }

  release(store: StoreInstance) {
    const Spec = Object.getPrototypeOf(store).constructor;
    const pool = this.poolMap.get(Spec);
    if (!pool) {
      throw new Error(`Failed to release store, unknown kind ${Spec.name}`);
    }
    pool.release(store);
  }
}
