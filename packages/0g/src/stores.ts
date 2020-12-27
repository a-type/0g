import { EventEmitter } from 'events';
import { Poolable } from './internal/objectPool';

export declare interface BaseStore {
  on(event: 'change', callback: () => void): this;
  off(event: 'change', callback: () => void): this;
}

export class BaseStore extends EventEmitter implements Poolable {
  static kind = 'base';
  static defaultValues: any = {};
  static builtinKeys: string[] = Object.getOwnPropertyNames(new BaseStore());
  __alive = true;

  ___version = 0;

  get __version() {
    return this.___version;
  }

  set<T extends BaseStore>(this: T, values: Partial<T>) {
    Object.assign(this, values);
    this.mark();
  }

  mark() {
    this.___version++;
    this.emit('change');
  }

  reset = () => {
    this.set(Object.getPrototypeOf(this).constructor.defaultValues);
    this.___version = 0;
    this.emit('change');
  };
}

export class PersistentStore extends BaseStore {
  static kind = 'persistent';
}

export class StateStore extends BaseStore {
  static kind = 'state';
}

export type StoreInstance = PersistentStore | StateStore;

export type StoreConstructor<T> = {
  new (): T;
  // defaultValues: any;
  // kind: 'persistent' | 'state';
};
export type Store =
  | StoreConstructor<PersistentStore>
  | StoreConstructor<StateStore>;
export type StoreInstanceFor<S extends Store> = S extends StoreConstructor<
  infer T
>
  ? T
  : never;
