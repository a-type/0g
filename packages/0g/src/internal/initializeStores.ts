import { Prefab, StoreData } from '../types';

/** Copies initial values from all of a prefab's specified stores */
export const initializeStores = (prefab: Prefab<Record<string, any>>) => {
  const stores: Record<string, StoreData> = {};
  let entry: [string, StoreData];
  for (entry of Object.entries(prefab.stores)) {
    stores[entry[0]] = { ...entry[1] };
  }
  return stores;
};
