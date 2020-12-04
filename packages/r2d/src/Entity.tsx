import * as React from 'react';
import { useProxy } from 'valtio';
import { System } from './system';
import { WorldContext, FrameData, EntityData, TreeNode } from './types';
import { worldContext } from './World';

export type EntityProps = {
  id: string;
  treeNode: TreeNode;
};

function useRunSystems(world: WorldContext, entity: EntityData | null) {
  const prefab = entity && world.prefabs[entity.prefab];
  const runnableSystems = React.useMemo(() => {
    if (!prefab) return [];
    return world.systems.filter((s) => s.runsOn(prefab));
  }, [world.systems, prefab]);

  React.useLayoutEffect(() => {
    function runSystems(
      runHandle: 'run' | 'preStep' | 'postStep',
      frame: FrameData
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

export function Entity({ id, treeNode }: EntityProps) {
  const world = React.useContext(worldContext);
  if (!world) {
    throw new Error('Entity must be rendered inside a World');
  }

  const entity = world.store.entities[id] ?? null;

  useRunSystems(world, entity);

  const children = useProxy(treeNode.children);

  const childEntries = React.useMemo(() => {
    return children ? Object.entries(children) : [];
  }, [children]);

  if (!entity) {
    console.warn(`Rendered null entity ${id}`);
    return null;
  }

  const prefab = entity && world.prefabs[entity.prefab];

  if (!prefab) {
    console.warn(`Missing prefab ${entity.prefab}`);
    return null;
  }

  return (
    <React.Suspense fallback={null}>
      <prefab.Component stores={entity.storesData}>
        {/*
          I think because Valtio doesn't always update snapshots
          synchronously, we can end up with a child entry which
          doesn't actually exist on the treeNode. Ignore it.
         */}
        {childEntries.map((entry) => !!treeNode.children[entry[0]] && (
          <Entity
            id={entry[0]}
            key={entry[0]}
            treeNode={treeNode.children[entry[0]]}
          />
        ))}
      </prefab.Component>
    </React.Suspense>
  );
}
