import { Poolable } from './internal/objectPool';
import { Query } from './queries';
import { Store, StoreInstance, StoreInstanceFor } from './stores';
import { Game } from './Game';

export class Entity implements Poolable {
  __data = new Map<Store, StoreInstance>();
  __queries = new Set<Query<any>>();
  __game: Game = null as any;
  __stores: Store[] = [];
  __alive = true;

  id: string = 'unallocated';

  init(id: string, specs: Store[]) {
    this.__stores = specs;
    this.id = id;
    specs.forEach((spec) => {
      this.add(spec);
    });
  }

  get<Spec extends Store>(spec: Spec) {
    const val = this.maybeGet(spec);
    if (!val) {
      throw new Error(`${spec.name} not present on entity ${this.id}`);
    }
    return val;
  }

  maybeGet<Spec extends Store>(spec: Spec): StoreInstanceFor<Spec> | null {
    const val = this.__data.get(spec) as StoreInstanceFor<Spec>;
    return val || null;
  }

  add<Spec extends Store>(
    spec: Spec,
    initial?: Partial<StoreInstanceFor<Spec>>,
  ) {
    this.__game.state.addStoreToEntity(this, spec, initial);
    this.__stores.push(spec);
    return this;
  }

  remove(spec: Store) {
    this.__game.state.removeStoreFromEntity(this, spec);
    return this;
  }

  reset() {
    this.__data.forEach((data, spec) => {
      this.__game.storeManager.release(data);
    });
    this.__data.clear();
    this.__stores = [];
    this.__queries = new Set();
  }

  get specs() {
    return {
      queries: Array.from(this.__queries.values()).map((q) => q.key),
      stores: this.__stores.map((spec) => spec.name),
    };
  }
}
