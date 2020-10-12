import * as planck from 'planck-js';
import * as React from 'react';
import { useFrame } from 'react-three-fiber';

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

  useFrame((state, delta) => {
    world.step(delta);
  });

  return <PhysicsContext.Provider value={world} {...rest} />;
}

export function usePhysics() {
  return React.useContext(PhysicsContext);
}
