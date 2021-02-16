import { ObjectPool, Poolable } from '../internal/objectPool';

class StateHandle<T = any> implements Poolable {
  private _promise: Promise<T>;
  private _resolve: (value: T) => void = () => {
    throw new Error('Cannot resolve this state yet');
  };
  private _value: T | null = null;

  __alive = false;

  constructor() {
    this._promise = new Promise<T>((resolve) => {
      this._resolve = resolve;
    });
  }

  resolve = (value: T) => {
    this._resolve(value);
    this._value = value;
  };

  get value() {
    return this._value;
  }

  get promise(): Promise<T> {
    return this.promise;
  }

  reset = () => {
    this._resolve = () => {
      throw new Error('Cannot resolve this state yet');
    };
    this._promise = new Promise<T>((resolve) => {
      this._resolve = resolve;
    });
    this._value = null;
  };
}

export class StateManager {
  private handlePool = new ObjectPool(() => new StateHandle());
  private groups: Map<string, StateHandle>[] = [];
  private globals = new Map<string, StateHandle>();

  private getOrCreateHandle = (group: number, key: string) => {
    let handle: StateHandle | undefined;
    if (!this.groups[group]) {
      this.groups[group] = new Map();
      handle = this.handlePool.acquire();
      this.groups[group].set(key, handle);
      return handle!;
    }
    handle = this.groups[group]?.get(key);
    if (!handle) {
      handle = this.handlePool.acquire();
      this.groups[group]?.set(key, handle);
    }
    return handle!;
  };

  private getOrCreateGlobalHandle = (key: string) => {
    let handle = this.globals.get(key);
    if (!handle) {
      handle = this.handlePool.acquire();
      this.globals.set(key, handle);
    }
    return handle;
  };

  load = <T>(entityId: number, key: string) => {
    return this.getOrCreateHandle(entityId, key).promise as Promise<T>;
  };

  resolve = <T>(entityId: number, key: string, value: T) => {
    this.getOrCreateHandle(entityId, key).resolve(value);
  };

  immediate = <T>(entityId: number, key: string) => {
    return this.getOrCreateHandle(entityId, key).value as T | null;
  };

  remove = (entityId: number, key: string) => {
    if (!this.groups[entityId]) return;
    const handle = this.groups[entityId].get(key);
    if (!handle) return;
    this.handlePool.release(handle);
    this.groups[entityId].delete(key);
  };

  removeAll = (entityId: number) => {
    if (!this.groups[entityId]) return;
    this.groups[entityId].forEach((value) => {
      this.handlePool.release(value);
    });
    this.groups[entityId].clear();
    delete this.groups[entityId]; // necessary?
  };

  loadGlobal = <T>(key: string) => {
    return this.getOrCreateGlobalHandle(key).promise as Promise<T>;
  };

  resolveGlobal = <T>(key: string, value: T) => {
    this.getOrCreateGlobalHandle(key).resolve(value);
  };

  immediateGlobal = <T>(key: string) => {
    return this.getOrCreateGlobalHandle(key).value as T | null;
  };

  removeGlobal = (key: string) => {
    const value = this.globals.get(key);
    if (value) {
      this.handlePool.release(value);
      this.globals.delete(key);
    }
  };
}
