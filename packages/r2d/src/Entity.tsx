import * as React from 'react';
import { useProxy } from 'valtio';
import { useInitial } from './internal/useInitial';
import { System } from './system';
import {
  WorldContext,
  FrameData,
  EntityData,
  StoreData,
  Prefab,
} from './types';
import { useWorld } from './World';

export type EntityProps = {
  id: string;
  prefab: string;
  initial: Record<string, StoreData>;
};

function useRunSystems(
  world: WorldContext,
  entity: EntityData | null,
  prefab: Prefab<any>,
) {
  const runnableSystems = React.useMemo(() => {
    if (!prefab) return [];
    return world.systems.filter((s) => s.runsOn(prefab));
  }, [world.systems, prefab]);

  React.useLayoutEffect(() => {
    function runSystems(
      runHandle: 'run' | 'preStep' | 'postStep',
      frame: FrameData,
    ) {
      if (!entity) return;

      let system: System<any, any>;
      const ctx = { world, entity, frame };
      for (system of runnableSystems) {
        system[runHandle]?.(ctx);
      }
    }

    function runPreStep(frameData: FrameData) {
      runSystems('preStep', frameData);
    }

    function runStep(frameData: FrameData) {
      runSystems('run', frameData);
    }

    function runPostStep(frameData: FrameData) {
      runSystems('postStep', frameData);
    }

    world.events.on('preStep', runPreStep);
    world.events.on('step', runStep);
    world.events.on('postStep', runPostStep);

    return () => {
      world.events.off('preStep', runPreStep);
      world.events.off('step', runStep);
      world.events.off('postStep', runPostStep);
    };
  }, [world, entity, runnableSystems]);
}

export function Entity(props: EntityProps) {
  // nothing can be changed when props change.
  const prefabName = useInitial(props.prefab);
  const initial = useInitial(props.initial);
  const id = useInitial(props.id);

  const world = useWorld();

  const prefab = world.prefabs[prefabName];

  if (!prefab) {
    console.error(`Missing prefab ${prefabName}`);
    return null;
  }

  const idsSnapshot = useProxy(world.store.ids);
  const entity = world.store.entities[id] ?? null;
  const entityExists = !!idsSnapshot[id];
  // enforce presence in World
  React.useEffect(() => {
    if (!entityExists) {
      world.add(prefabName, initial, id);
    }
  }, [entityExists, prefabName, prefab, initial, id]);
  // remove from World on unmount
  React.useEffect(
    () => () => {
      world.remove(id);
    },
    [id],
  );

  useRunSystems(world, entity, prefab);

  // still loading
  if (!entity) return null;

  return (
    <React.Suspense fallback={null}>
      <prefab.Component stores={entity.storesData} id={id} />
    </React.Suspense>
  );
}
