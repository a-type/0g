import { Store, StoreData } from '../types';

/** Copies initial values from all of a prefab's specified stores */
export const initializeStores = (
  providedStores: Record<string, Store<string, any>>,
) => {
  const stores: Record<string, StoreData<string, any>> = {};
  let entry: [string, StoreData<string, any>];
  for (entry of Object.entries(providedStores)) {
    stores[entry[0]] = { ...entry[1] };
  }
  return stores;
};
