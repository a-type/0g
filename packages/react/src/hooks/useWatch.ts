import { useCallback, useEffect, useRef, useState } from 'react';
import { ComponentType, Query, QueryDef, Entity, ComponentInstance } from '0g';
import { useFrame, useQueryFrame } from './useFrame';

export function useWatch(
  input: Query<QueryDef>,
  components: ComponentType[],
  callback: (entity: Entity) => void,
): void;
export function useWatch(
  input: Entity,
  components: ComponentType[],
  callback: () => void,
): void;
export function useWatch(input: ComponentInstance, callback: () => void): void;
export function useWatch(
  input: any,
  componentsOrCallback: any,
  callback?: any,
): void {
  if (input instanceof Query) {
    return useWatchQuery(input, componentsOrCallback, callback);
  } else if (input instanceof Entity) {
    return useWatchEntity(input, componentsOrCallback, callback);
  } else {
    return useWatchStore(input, componentsOrCallback);
  }
}

function getStoreVersions(entity: Entity, components: ComponentType[]) {
  return components.map((store) => entity.get(store).__version).join(',');
}

function useWatchQuery(
  query: Query<QueryDef>,
  components: ComponentType[],
  callback: (entity: Entity) => void,
) {
  const [versionCache] = useState(() => {
    return new WeakMap<Entity, string>();
  });

  useQueryFrame(
    query,
    useCallback(
      (entity) => {
        const currentVersions = getStoreVersions(entity, components);
        if (currentVersions !== versionCache.get(entity)) {
          versionCache.set(entity, currentVersions);
          callback(entity);
        }
      },
      [versionCache, components],
    ),
  );
}

function useWatchEntity(
  entity: Entity,
  components: ComponentType[],
  callback: () => void,
) {
  const versionsRef = useRef('');

  useFrame(
    useCallback(() => {
      const currentVersions = getStoreVersions(entity, components);
      if (currentVersions !== versionsRef.current) {
        versionsRef.current = currentVersions;
        callback();
      }
    }, [versionsRef, entity, components]),
  );
}

function useWatchStore(store: ComponentInstance, callback: () => void) {
  useEffect(() => {
    callback();
    store.on('change', callback);
    return () => void store.off('change', callback);
  }, [store, callback]);
}
