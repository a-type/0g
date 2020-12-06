import * as r2d from 'r2d';
import {
  b2Body,
  b2BodyType,
  b2CircleShape,
  b2FixtureDef,
  b2PolygonShape,
  b2World,
} from '@flyover/box2d';
import { EntityContact } from './box2d';
import * as stores from './stores';

export const rigidBody = new r2d.System<{
  body: b2Body;
  newContactsCache: EntityContact[];
  endedContactsCache: EntityContact[];
}>({
  name: 'rigidBody',
  runsOn: (prefab) => {
    return !!prefab.stores.transform && !!prefab.stores.bodyConfig;
  },
  state: {
    body: (null as unknown) as b2Body,
    newContactsCache: new Array<EntityContact>(),
    endedContactsCache: new Array<EntityContact>(),
  },
  init: (entity, state, ctx) => {
    const transform = stores.transform.get(entity)!;
    const { x, y } = transform;
    const bodyConfig = stores.bodyConfig.get(entity)!;
    const {
      density,
      friction,
      frictionAir,
      isStatic,
      angle,
      restitution,
      fixedRotation,
    } = bodyConfig;
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

    if (bodyConfig.shape === 'rectangle') {
      const shape = new b2PolygonShape();
      shape.SetAsBox(bodyConfig.width / 2, bodyConfig.height / 2);
      fix.shape = shape;
    } else {
      fix.shape = new b2CircleShape(bodyConfig.radius);
    }
    body.CreateFixture(fix);

    const bodyStore = stores.body.get(entity);
    if (bodyStore) {
      bodyStore.mass = body.GetMass();
      bodyStore.angularVelocity = body.GetAngularVelocity();
      bodyStore.velocity = body.GetLinearVelocity();
    }

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
  preStep: (entity, state) => {
    const transform = stores.transform.get(entity)!;
    const contacts = stores.contacts.get(entity);
    const body = stores.body.get(entity);

    state.body.SetPositionXY(transform.x, transform.y);

    if (contacts) {
      let contact: EntityContact;
      for (contact of state.newContactsCache) {
        contacts.began.push(contact);
        contacts.current.push(contact);
      }
      for (contact of state.endedContactsCache) {
        contacts.current = contacts.current.filter((c) => c !== contact);
        contacts.ended = contacts.ended.filter((c) => c !== contact);
      }
    }
    state.newContactsCache = [];
    state.endedContactsCache = [];

    if (body) {
      body.angularVelocity = state.body.GetAngularVelocity();
      const { x, y } = state.body.GetLinearVelocity();
      body.velocity.x = x;
      body.velocity.y = y;
    }
  },
  run: (entity, { body }, ctx) => {
    const transform = stores.transform.get(entity)!;
    const forces = stores.forces.get(entity);

    const { x, y } = body.GetPosition();
    transform.x = x;
    transform.y = y;
    transform.angle = body.GetAngle();

    if (forces) {
      if (forces.impulse) {
        body.ApplyLinearImpulseToCenter(forces.impulse, true);
        forces.impulse = null;
      }
      if (forces.velocity) {
        body.SetLinearVelocity(forces.velocity);
        forces.velocity = null;
      }
    }
  },
  postStep: (entity) => {
    const contacts = stores.contacts.get(entity);

    if (contacts) {
      contacts.began = [];
      contacts.ended = [];
    }
  },
});
