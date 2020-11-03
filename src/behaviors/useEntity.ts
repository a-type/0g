import { useState } from 'react';
import { usePhysics } from '../physics';
import * as p from 'planck-js';
import {
  BoxShape,
  ChainShape,
  CircleShape,
  EdgeShape,
  PolygonShape,
} from 'planck-js/lib/shape/index';
import { Vec2 } from 'planck-js';

export type FixtureConfig = Partial<p.FixtureOpt> & {
  shape: BoxShape | ChainShape | CircleShape | EdgeShape | PolygonShape;
};

export type EntityData<D extends Record<string, any>> = {
  bodyConfig: {
    body: p.BodyDef;
    fixture: FixtureConfig;
    position?: Vec2;
    angle?: number;
  };
} & D;

export type Entity<D extends EntityData<any>> = Omit<D, 'bodyConfig'> & {
  body: p.Body;
};

export function useEntity<V extends EntityData<{}>>(initials: V): Entity<V> {
  const world = usePhysics();

  const [values] = useState(() => {
    const { bodyConfig, ...rest } = initials;
    const body = world.createBody(bodyConfig.body);
    body.createFixture(bodyConfig.fixture as p.FixtureDef);
    if (initials.bodyConfig.position) {
      body.setPosition(p.Vec2(initials.bodyConfig.position));
    }
    if (initials.bodyConfig.angle) {
      body.setAngle(initials.bodyConfig.angle);
    }
    return {
      ...rest,
      body,
    };
  });
  return values;
}
