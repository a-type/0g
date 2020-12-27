import { useCallback, useEffect, useRef, useState } from 'react';
import { Store, Query, QueryDef, Entity, StoreInstance } from '0g';
import { useFrame, useQueryFrame } from './useFrame';

export function useWatch(
  input: Query<QueryDef>,
  stores: Store[],
  callback: (entity: Entity) => void,
): void;
export function useWatch(
  input: Entity,
  stores: Store[],
  callback: () => void,
): void;
export function useWatch(input: StoreInstance, callback: () => void): void;
export function useWatch(
  input: any,
  storesOrCallback: any,
  callback?: any,
): void {
  if (input instanceof Query) {
    return useWatchQuery(input, storesOrCallback, callback);
  } else if (input instanceof Entity) {
    return useWatchEntity(input, storesOrCallback, callback);
  } else {
    return useWatchStore(input, storesOrCallback);
  }
}

function getStoreVersions(entity: Entity, stores: Store[]) {
  return stores.map((store) => entity.get(store).__version).join(',');
}

function useWatchQuery(
  query: Query<QueryDef>,
  stores: Store[],
  callback: (entity: Entity) => void,
) {
  const [versionCache] = useState(() => {
    return new WeakMap<Entity, string>();
  });

  useQueryFrame(
    query,
    useCallback(
      (entity) => {
        const currentVersions = getStoreVersions(entity, stores);
        if (currentVersions !== versionCache.get(entity)) {
          versionCache.set(entity, currentVersions);
          callback(entity);
        }
      },
      [versionCache, stores],
    ),
  );
}

function useWatchEntity(entity: Entity, stores: Store[], callback: () => void) {
  const versionsRef = useRef('');

  useFrame(
    useCallback(() => {
      const currentVersions = getStoreVersions(entity, stores);
      if (currentVersions !== versionsRef.current) {
        versionsRef.current = currentVersions;
        callback();
      }
    }, [versionsRef, entity, stores]),
  );
}

function useWatchStore(store: StoreInstance, callback: () => void) {
  useEffect(() => {
    console.debug('watch hit');
    callback();
    store.on('change', callback);
    return () => void store.off('change', callback);
  }, [store, callback]);
}
