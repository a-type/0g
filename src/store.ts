import { Store, StoreCreator, StoreData } from './types';

export function store<Kind extends string, S extends StoreData>(
  kind: Kind,
  defaults: S
): StoreCreator<Kind, S> {
  return (overrides?: Partial<S>) =>
    (({
      kind,
      initial: { ...defaults, ...overrides, __kind: kind },
    } as any) as Store<Kind, S>);
}
