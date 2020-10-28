import * as p from 'planck-js';
import {
  BoxShape,
  ChainShape,
  CircleShape,
  EdgeShape,
  PolygonShape,
} from 'planck-js/lib/shape/index';
import { useState } from 'react';
import { useBehavior } from '../behaviors/useBehavior';
import { usePhysics } from './Physics';
import * as THREE from 'three';

export type FixtureConfig = Partial<p.FixtureOpt> & {
  shape: BoxShape | ChainShape | CircleShape | EdgeShape | PolygonShape;
};

export type UseBodyConfig = {
  mesh: THREE.Mesh | null;
  body: p.BodyDef;
  fixture: FixtureConfig;
  position?: [number, number];
  angle?: number;
};

export function useBody({
  mesh,
  body: bodyConfig,
  fixture,
  position = [0, 0],
  angle = 0,
}: UseBodyConfig) {
  const world = usePhysics();

  // just to avoid recomputing each time...
  const [body] = useState(() => {
    const body = world.createBody(bodyConfig);
    body.createFixture(fixture as p.FixtureDef);
    body.setPosition(p.Vec2(position[0], position[1]));
    body.setAngle(angle);
    return body;
  });

  return useBehavior({
    onUpdate: () => {
      if (body && mesh) {
        const position = body.getPosition();
        const rotation = body.getAngle();
        mesh.position.x = position.x;
        mesh.position.y = position.y;
        mesh.rotation.z = rotation;
      }
    },
    initialState: {
      body,
    },
    makeApi: (state) => ({
      applyLinearImpulse: (
        impulse: p.Vec2,
        {
          worldPosition,
          wake,
        }: {
          worldPosition?: p.Vec2;
          wake?: boolean;
        }
      ) => {
        state.body.applyLinearImpulse(
          impulse,
          worldPosition || state.body.getWorldCenter(),
          wake
        );
      },
      setLinearVelocity: (velocity: p.Vec2) => {
        state.body.setLinearVelocity(velocity);
      },
    }),
  });
}

export type BodyBehavior = ReturnType<typeof useBody>;
