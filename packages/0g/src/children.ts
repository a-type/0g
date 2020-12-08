import { store } from "./store";
import { StoreData } from "./types";

export const children = store('children', {} as Record<string, {
  id: string;
  prefab: string;
  initial: Record<string, StoreData>
}>);
