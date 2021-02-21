import { ObjectPool, Poolable } from '../internal/objectPool';

class ResourceHandle<T = any> implements Poolable {
  private _promise: Promise<T>;
  private _resolve: (value: T) => void = () => {
    throw new Error('Cannot resolve this resource yet');
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
      throw new Error('Cannot resolve this resource yet');
    };
    this._promise = new Promise<T>((resolve) => {
      this._resolve = resolve;
    });
    this._value = null;
  };
}

export class ResourceManager {
  private handlePool = new ObjectPool(() => new ResourceHandle());
  private handles = new Map<string, ResourceHandle>();

  private getOrCreateGlobalHandle = (key: string) => {
    let handle = this.handles.get(key);
    if (!handle) {
      handle = this.handlePool.acquire();
      this.handles.set(key, handle);
    }
    return handle;
  };

  load = <T>(key: string) => {
    return this.getOrCreateGlobalHandle(key).promise as Promise<T>;
  };

  resolve = <T>(key: string, value: T) => {
    this.getOrCreateGlobalHandle(key).resolve(value);
  };

  immediate = <T>(key: string) => {
    return this.getOrCreateGlobalHandle(key).value as T | null;
  };

  remove = (key: string) => {
    const value = this.handles.get(key);
    if (value) {
      this.handlePool.release(value);
      this.handles.delete(key);
    }
  };
}
