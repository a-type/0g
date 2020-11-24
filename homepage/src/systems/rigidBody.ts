import { bodyConfig } from '../stores/bodyConfig';
import { transform } from '../stores/transform';
import { r2d } from '../../../src';
import { forces } from '../stores/forces';
import {
  b2Body,
  b2BodyType,
  b2CircleShape,
  b2FixtureDef,
  b2PolygonShape,
  b2World,
} from '@flyover/box2d';
import { body } from '../stores/body';
import { contacts } from '../stores/contacts';
import { EntityContact } from '../plugins/box2d';

export const rigidBody = r2d.system({
  stores: {
    transform: transform,
    bodyConfig: bodyConfig,
    forces: forces,
    body: body,
    contacts: contacts,
  },
  state: {
    body: (null as unknown) as b2Body,
    newContactsCache: new Array<EntityContact>(),
    endedContactsCache: new Array<EntityContact>(),
  },
  init: (stores, state, ctx) => {
    const { x, y } = stores.transform;
    const {
      density,
      friction,
      frictionAir,
      isStatic,
      angle,
      restitution,
      fixedRotation,
    } = stores.bodyConfig;
    const world = ctx.world.plugins.box2d.world as b2World;

    const body = world.CreateBody({
      type: isStatic ? b2BodyType.b2_staticBody : b2BodyType.b2_dynamicBody,
      angle,
      position: { x, y },
      linearDamping: frictionAir,
      angularDamping: 0.00001,
      awake: true,
      allowSleep: false,
      fixedRotation,
    });
    const fix = new b2FixtureDef();
    fix.density = density;
    fix.restitution = restitution;
    fix.friction = friction;
    fix.userData = { entityId: ctx.entity.id };

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

    state.body = body;

    // subscribe to contacts
    const onBeginContact = (contact: EntityContact) => {
      state.newContactsCache.push(contact);
    };
    const onEndContact = (contact: EntityContact) => {
      state.endedContactsCache.push(contact);
    };

    (ctx.world.plugins.box2d as any).contacts.subscribe(ctx.entity.id, {
      onBeginContact,
      onEndContact,
    });
  },
  dispose: (_, state, ctx) => {
    (ctx.world.plugins as any).box2d.world.DestroyBody(state.body);
  },
  preStep: ({ transform, contacts, body }, state) => {
    state.body.SetPositionXY(transform.x, transform.y);
    let contact: EntityContact;
    for (contact of state.newContactsCache) {
      contacts.began.push(contact);
      contacts.current.push(contact);
    }
    for (contact of state.endedContactsCache) {
      contacts.current = contacts.current.filter((c) => c !== contact);
      contacts.ended = contacts.ended.filter((c) => c !== contact);
    }
    state.newContactsCache = [];
    state.endedContactsCache = [];

    body.angularVelocity = state.body.GetAngularVelocity();
    const { x, y } = state.body.GetLinearVelocity();
    body.velocity.x = x;
    body.velocity.y = y;
  },
  run: ({ transform, forces }, { body }) => {
    const { x, y } = body.GetPosition();
    transform.x = x;
    transform.y = y;
    transform.angle = body.GetAngle();

    if (forces.impulse) {
      body.ApplyLinearImpulseToCenter(forces.impulse, true);
      forces.impulse = null;
    }
    if (forces.velocity) {
      body.SetLinearVelocity(forces.velocity);
      forces.velocity = null;
    }
  },
  postStep: ({ contacts }) => {
    contacts.began = [];
    contacts.ended = [];
  },
});
