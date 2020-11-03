import * as planck from 'planck-js';
import * as React from 'react';
import { render, useFrame } from 'react-three-fiber';
import { getConfig } from '../config';

const PhysicsContext = React.createContext<planck.World>(planck.World());

export function Physics({
  config = {
    gravity: planck.Vec2(0, -9.81),
  },
  ...rest
}: {
  config?: planck.WorldDef;
  children: React.ReactNode;
}) {
  const [world] = React.useState<planck.World>(planck.World(config));

  const { physicsStepPriority, renderStepPriority } = getConfig();

  useFrame((state, delta) => {
    world.step(delta);
  }, physicsStepPriority);

  // take over render priority
  useFrame((state, delta) => {
    state.gl.render(state.scene, state.camera);
  }, renderStepPriority);

  return <PhysicsContext.Provider value={world} {...rest} />;
}

export function usePhysics() {
  return React.useContext(PhysicsContext);
}
