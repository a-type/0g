import { ObjectPool, Poolable } from './internal/objectPool';

import { GameResources } from '.';
import { logger } from './logger';

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
    return this._promise;
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
  private handles = new Map<string | number, ResourceHandle>();

  private getOrCreateGlobalHandle = (key: string | number) => {
    let handle = this.handles.get(key);
    if (!handle) {
      handle = this.handlePool.acquire();
      this.handles.set(key, handle);
    }
    return handle;
  };

  load = <Key extends keyof GameResources>(key: Key) => {
    return this.getOrCreateGlobalHandle(key).promise as Promise<
      GameResources[Key]
    >;
  };

  resolve = <Key extends keyof GameResources>(
    key: Key,
    value: GameResources[Key],
  ) => {
    this.getOrCreateGlobalHandle(key).resolve(value);
    logger.debug('Resolved resource', key);
  };

  immediate = <Key extends keyof GameResources>(key: Key) => {
    return this.getOrCreateGlobalHandle(key).value as GameResources[Key] | null;
  };

  remove = (key: keyof GameResources) => {
    const value = this.handles.get(key);
    if (value) {
      this.handlePool.release(value);
      this.handles.delete(key);
    }
  };
}
