import { useCallback, useRef, useState } from 'react';
import { Entity } from '../entity';
import { Query, QueryDef } from '../queries';
import { Store } from '../stores';
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
export function useWatch(input: any, stores: any, callback: any): void {
  if (input instanceof Query) {
    return useWatchQuery(input, stores, callback);
  } else {
    return useWatchEntity(input, stores, callback);
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
