import { ObjectPool, Poolable } from './internal/objectPool';
import { logger } from './logger';
import { ResourceHandle } from './ResourceHandle';

export class Resources<ResourceMap extends Record<string, any>> {
  private handlePool = new ObjectPool(() => new ResourceHandle());
  private handles = new Map<string | number | symbol, ResourceHandle>();

  private getOrCreateGlobalHandle = (key: string | number | symbol) => {
    let handle = this.handles.get(key);
    if (!handle) {
      handle = this.handlePool.acquire();
      this.handles.set(key, handle);
    }
    return handle;
  };

  load = <Key extends keyof ResourceMap>(key: Key) => {
    return this.getOrCreateGlobalHandle(key).promise as Promise<
      ResourceMap[Key]
    >;
  };

  resolve = <Key extends keyof ResourceMap>(
    key: Key,
    value: ResourceMap[Key],
  ) => {
    this.getOrCreateGlobalHandle(key).resolve(value);
    logger.debug('Resolved resource', key);
  };

  immediate = <Key extends keyof ResourceMap>(key: Key) => {
    return this.getOrCreateGlobalHandle(key).value as ResourceMap[Key] | null;
  };

  remove = (key: keyof ResourceMap) => {
    const value = this.handles.get(key);
    if (value) {
      this.handlePool.release(value);
      this.handles.delete(key);
    }
  };
}
