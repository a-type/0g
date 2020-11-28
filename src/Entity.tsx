import * as React from 'react';
import { useProxy } from 'valtio';
import { WorldContext, FrameData, System, EntityData, TreeNode } from './types';
import { worldContext } from './World';

export type EntityProps = {
  id: string;
  treeNode: TreeNode;
};

function useRunSystems(world: WorldContext, entity: EntityData) {
  React.useLayoutEffect(() => {
    const prefab = world.prefabs[entity.prefab];

    function initializeSystems() {
      let entry: [string, System<any, any>];
      const ctx = { world, entity };
      for (entry of Object.entries(prefab.systems)) {
        if (!world.systemStates.get(entity, entry[0])) {
          const state = { ...entry[1].state };
          entry[1].init?.(entity.stores, state, ctx);
          world.systemStates.add(entity, entry[0], state);
        }
      }
    }

    initializeSystems();

    function runSystems(
      runHandle: 'run' | 'preStep' | 'postStep',
      frame: FrameData
    ) {
      const systemStates = world.systemStates.getAll(entity);
      let entry: [string, System<any, any>];
      const ctx = { world, entity, frame };
      for (entry of Object.entries(prefab.systems)) {
        entry[1][runHandle]?.(entity.stores, systemStates[entry[0]], ctx);
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
  }, [world, entity]);
}

export function Entity({ id, treeNode }: EntityProps) {
  const world = React.useContext(worldContext);
  if (!world) {
    throw new Error('Entity must be rendered inside a World');
  }

  const entity = world.store.entities[id] ?? null;

  useRunSystems(world, entity);

  const prefab = world.prefabs[entity.prefab];

  if (!prefab) {
    throw new Error(`Prefab missing: ${entity.prefab}`);
  }

  const children = useProxy(treeNode.children);

  const childEntries = React.useMemo(() => {
    return children ? Object.entries(children) : [];
  }, [children]);

  return (
    <React.Suspense fallback={null}>
      <prefab.Component stores={entity.stores}>
        {childEntries.map((entry) => (
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
