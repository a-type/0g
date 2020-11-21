import { Plugins } from '../plugins';
import { bodyConfig } from '../stores/bodyConfig';
import { transform } from '../stores/transform';
import { r2d, WorldContext } from '../../../src';
import { forces } from '../stores/forces';
import {
  b2Body,
  b2BodyType,
  b2CircleShape,
  b2FixtureDef,
  b2PolygonShape,
} from '@flyover/box2d';
import { body } from '../stores/body';

export const rigidBody = r2d.system({
  stores: {
    transform: transform,
    bodyConfig: bodyConfig,
    forces: forces,
    body: body,
  },
  state: (stores, ctx: WorldContext<Plugins> & { entity: { id: string } }) => {
    const { x, y } = stores.transform;
    const {
      density,
      friction,
      frictionAir,
      isStatic,
      angle,
      restitution,
    } = stores.bodyConfig;
    const world = ctx.plugins.box2d.world;

    const body = world.CreateBody({
      type: isStatic ? b2BodyType.b2_staticBody : b2BodyType.b2_dynamicBody,
      angle,
      position: { x, y },
      linearDamping: frictionAir,
      angularDamping: 0.00001,
      awake: true,
      allowSleep: false,
    });
    const fix = new b2FixtureDef();
    fix.density = density;
    fix.restitution = restitution;
    fix.friction = friction;

    if (stores.bodyConfig.shape === 'rectangle') {
      const shape = new b2PolygonShape();
      shape.SetAsBox(stores.bodyConfig.width / 2, stores.bodyConfig.height / 2);
      fix.shape = shape;
    } else {
      fix.shape = new b2CircleShape(stores.bodyConfig.radius);
    }
    body.CreateFixture(fix);

    stores.body.mass = body.GetMass();
    stores.body.angularVelocity = body.GetAngularVelocity();
    stores.body.velocity = body.GetLinearVelocity();

    return {
      body,
    };
  },
  preStep: ({ transform }, { body }: { body: b2Body }) => {
    body.SetPositionXY(transform.x, transform.y);
  },
  run: ({ transform, body: bodyStore, forces }, { body }: { body: b2Body }) => {
    const { x, y } = body.GetPosition();
    transform.x = x;
    transform.y = y;
    transform.angle = body.GetAngle();

    bodyStore.angularVelocity = body.GetAngularVelocity();
    bodyStore.velocity = body.GetLinearVelocity();

    if (forces.impulse) {
      body.ApplyLinearImpulseToCenter(forces.impulse, true);
      forces.impulse = null;
    }
    if (forces.velocity) {
      body.SetLinearVelocity(forces.velocity);
      forces.velocity = null;
    }

    console.log(body.GetLinearVelocity().y);
  },
});
