import { StoreSpec, StoreShape } from './store';
import { Poolable } from './internal/objectPool';
import { Query } from './queries';
import { EntityManager } from './entityManager';
import { makeAutoObservable } from 'mobx';

export class Entity implements Poolable {
  __data = new Map<StoreSpec<any>, StoreShape<StoreSpec<any>>>();
  __queries = new Set<Query<any>>();
  __manager: EntityManager = null as any;
  __stores: StoreSpec[] = [];

  id: string = 'unallocated';

  // constructor() {
  //   makeAutoObservable(this);
  // }

  init(id: string, specs: StoreSpec[]) {
    this.__stores = specs;
    this.id = id;
    specs.forEach((spec) => {
      this.add(spec);
    });
  }

  get<Spec extends StoreSpec<any>>(spec: Spec) {
    const val = this.maybeGet(spec);
    if (!val) {
      throw new Error(`${spec.key} not present on entity ${this.id}`);
    }
    return val;
  }

  maybeGet<Spec extends StoreSpec<any>>(spec: Spec): StoreShape<Spec> | null {
    const val = this.__data.get(spec);
    return val || null;
  }

  add<Spec extends StoreSpec<any>>(
    spec: Spec,
    initial?: Partial<StoreShape<Spec>>,
  ) {
    this.__manager.addStoreToEntity(this, spec, initial);
    this.__stores.push(spec);
    return this;
  }

  remove(spec: StoreSpec) {
    this.__manager.removeStoreFromEntity(this, spec);
    return this;
  }

  reset() {
    this.__data.forEach((data, spec) => {
      spec.release(data);
    });
    this.__data.clear();
    this.__stores = [];
    this.__queries = new Set();
  }

  get specs() {
    return {
      queries: Array.from(this.__queries.values()).map((q) => q.key),
      stores: this.__stores.map((spec) => spec.key),
    };
  }
}
