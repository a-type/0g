// wraps an Entity data object with convenience APIs

import { EntityData, Store } from '../types';

export class EntityWrapper<
  StoresByKind extends Record<string, Store<string, any>>
> {
  constructor(private data: EntityData) {}

  get id() {
    return this.data.id;
  }

  getStore<K extends keyof StoresByKind>(
    storeKind: K
  ): StoresByKind[K]['initial'] {
    return Object.values(this.data.storesData).find(
      (store) => store.__kind === storeKind
    );
  }

  getStores<K extends keyof StoresByKind>(
    storeKind: K
  ): StoresByKind[K]['initial'] {
    return Object.values(this.data.storesData).filter(
      (store) => store.__kind === storeKind
    );
  }
}
