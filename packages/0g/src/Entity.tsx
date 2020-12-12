import { observer } from 'mobx-react-lite';
import { mergeDeepRight } from 'ramda';
import * as React from 'react';
import { initializeStores } from './internal/initializeStores';
import { useInitial } from './internal/useInitial';
import { EntityData, StoreData } from './types';
import { useGame } from './World';

export type EntityInstanceProps<
  Stores extends Record<string, StoreData<string, any>>
> = {
  id: string;
  stores: Stores;
};

type PartialStores<Stores extends Record<string, StoreData<string, any>>> = {
  [K in keyof Stores]?: Partial<Stores[K]>;
};

export type EntityProps<
  Stores extends Record<string, StoreData<string, any>>
> = {
  id: string;
  initial: PartialStores<Stores>;
};

export function entity<Stores extends Record<string, StoreData<string, any>>>(
  name: string,
  stores: Stores,
  Component: React.FC<EntityInstanceProps<Stores>>,
) {
  const ObserverComponent = observer(Component);

  const Entity = observer((props: EntityProps<Stores>) => {
    // nothing can be changed when props change.
    const initial = useInitial(props.initial);
    const id = useInitial(props.id);

    const game = useGame();

    // type assertion/assumption: the entity which exists for this id matches its store shape
    const entity = (game.state.entities[id] ??
      null) as EntityData<Stores> | null;
    const entityExists = !!entity;
    // enforce presence in World
    React.useEffect(() => {
      if (!entityExists) {
        const defaultStores = initializeStores(stores);
        const initialStores = mergeDeepRight(defaultStores, initial);
        game.add(initialStores, id);
      }
    }, [entityExists, initial, id]);
    // remove from World on unmount
    React.useEffect(
      () => () => {
        game.destroy(id);
      },
      [id],
    );

    // still loading
    if (!entity) return null;

    return (
      <React.Suspense fallback={null}>
        <ObserverComponent stores={entity.storesData} id={id} />
      </React.Suspense>
    );
  });

  Entity.displayName = name;

  return Entity;
}
