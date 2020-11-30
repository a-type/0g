import { StoreCreator, StoreData } from './types';

export function store<S extends StoreData>(
  name: string,
  defaults: S
): StoreCreator<S> {
  return (overrides?: Partial<S>) => ({
    name,
    initial: { ...defaults, ...overrides },
  });
}
