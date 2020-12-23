import { Poolable } from './internal/objectPool';
import { Constructor } from './types';

class BaseStore implements Poolable {
  static kind = 'base';
  static defaultValues: any = {};
  __alive = true;

  __version = 0;

  set<T extends BaseStore>(this: T, values: Partial<T>) {
    Object.assign(this, values);
    this.__version++;
  }

  mark() {
    this.__version++;
  }

  reset = () => {
    this.set(Object.getPrototypeOf(this).constructor.defaultValues);
  };
}

export class PersistentStore extends BaseStore {
  static kind = 'persistent';
}

export class StateStore extends BaseStore {
  static kind = 'state';
}

export type StoreInstance = PersistentStore | StateStore;

export type Store = Constructor<PersistentStore> | Constructor<StateStore>;
export type StoreInstanceFor<S extends Store> = S extends Constructor<infer T>
  ? T
  : never;
