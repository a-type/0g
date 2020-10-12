import * as p from 'planck-js';
import {
  BoxShape,
  ChainShape,
  CircleShape,
  EdgeShape,
  PolygonShape,
  Shape,
} from 'planck-js/lib/shape/index';
import { useEffect, useState } from 'react';
import { useFrame } from 'react-three-fiber';
import { Mesh } from 'three';
import { usePhysics } from '../physics/Physics';

export type Bindings = {
  mesh: Mesh | null;
  setMesh(m: Mesh | null): void;
  body: p.Body;
};

export function makeBehavior<Config>(
  behavior: (
    { body, mesh }: { body: p.Body | null; mesh: Mesh | null },
    config: Config
  ) => void
) {
  return function useBehavior(params: Bindings, config: Config) {
    behavior(
      {
        body: params.body,
        mesh: params.mesh,
      },
      config
    );
  };
}

export type ContactEvent = {
  self: p.Fixture;
  other: p.Fixture;
  contact: p.Contact;
};

export type FixtureConfig = Partial<p.FixtureOpt> & {
  shape: BoxShape | ChainShape | CircleShape | EdgeShape | PolygonShape;
};
export function useBindings({
  body: config,
  fixture,
  events,
  position,
}: {
  body: p.BodyDef;
  fixture: FixtureConfig;
  events?: {
    onBeginContact?: (ev: ContactEvent) => void;
    onEndContact?: (ev: ContactEvent) => void;
  };
  position: [number, number];
}): Bindings {
  const world = usePhysics();

  const [body] = useState(() => {
    const body = world.createBody(config);
    body.createFixture(fixture as p.FixtureDef);
    body.setPosition(p.Vec2(position[0], position[1]));
    return body;
  });
  const [mesh, setMesh] = useState<Mesh | null>(null);

  // frame updates
  useFrame(() => {
    if (body && mesh) {
      const position = body.getPosition();
      const rotation = body.getAngle();
      mesh.position.x = position.x;
      mesh.position.y = position.y;
      mesh.rotation.z = rotation;
    }
  });

  // subscribe to world collision events and filter for our own
  // TODO: optimize
  const { onBeginContact, onEndContact } = events || {};
  useEffect(() => {
    function wrapContactHandler(handler?: (ev: ContactEvent) => void) {
      return function (contact: p.Contact) {
        const bodyA = contact.getFixtureA().getBody();
        const bodyB = contact.getFixtureB().getBody();
        if (bodyA === body) {
          handler?.({
            self: contact.getFixtureA(),
            other: contact.getFixtureB(),
            contact,
          });
        } else if (bodyB === body) {
          handler?.({
            self: contact.getFixtureB(),
            other: contact.getFixtureA(),
            contact,
          });
        }
      };
    }

    const handleBeginContact = wrapContactHandler(onBeginContact);
    world.on('begin-contact', handleBeginContact);

    const handleEndContact = wrapContactHandler(onEndContact);
    world.on('end-contact', handleEndContact);

    return function () {
      world.off('begin-contact', handleBeginContact);
      world.off('end-contact', handleEndContact);
    };
  }, [world, onBeginContact, onEndContact, body]);

  return {
    body,
    mesh,
    setMesh,
  };
}
