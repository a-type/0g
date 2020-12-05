import { Prefab, Store, StoreData, Stores } from "../types";

/** Copies initial values from all of a prefab's specified stores */
export const initializeStores = (prefab: Prefab<Stores>) => {
  const stores: Record<string, StoreData> = {};
  let entry: [string, Store<string, any>];
  for (entry of Object.entries(prefab.stores)) {
    stores[entry[0]] = { __kind: entry[1].kind, ...entry[1].initial };
  }
  return stores;
};
