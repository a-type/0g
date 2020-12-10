import * as g from '0g';
import {
  b2Body,
  b2BodyType,
  b2CircleShape,
  b2FixtureDef,
  b2PolygonShape,
  b2World,
} from '@flyover/box2d';
import { EntityContact } from './index';
import * as stores from './stores';
import { reaction } from 'mobx';

export const rigidBody = new g.System({
  name: 'rigidBody',
  runsOn: (prefab) => {
    return !!prefab.stores.transform && !!prefab.stores.body;
  },
  state: {
    body: (null as unknown) as b2Body,
    newContactsCache: new Array<EntityContact>(),
    endedContactsCache: new Array<EntityContact>(),
    cleanupSubscriptions: () => {},
  },
  init: (entity, state, ctx) => {
    const transform = stores.transform.get(entity)!;
    const bodyStore = stores.body.get(entity)!;

    // create / recreate body when config changes
    state.cleanupSubscriptions = reaction(
      () => ({ ...bodyStore.config }),
      (config) => {
        console.log('recreating body', ctx.entity.id);
        // remove old body
        if (state.body) {
          ctx.world.plugins.box2d.world.DestroyBody(state.body);
        }

        const {
          // TODO: verify assumptions about defaults
          density = 1,
          friction = 0.5,
          isStatic = false,
          angle = 0,
          restitution = 0.5,
          fixedRotation = false,
          linearDamping = 0,
          angularDamping = 0,
        } = config;

        const { x, y } = transform;
        const world = ctx.world.plugins.box2d.world as b2World;

        const body = world.CreateBody({
          type: isStatic ? b2BodyType.b2_staticBody : b2BodyType.b2_dynamicBody,
          angle,
          position: { x, y },
          linearDamping,
          fixedRotation,
          angularDamping,
          allowSleep: false,
          awake: true,
          userData: {
            entityId: entity.id,
          },
        });
        const fix = new b2FixtureDef();
        fix.density = density;
        fix.restitution = restitution;
        fix.friction = friction;
        fix.userData = { entityId: ctx.entity.id };

        if (config.shape === 'rectangle') {
          const shape = new b2PolygonShape();
          shape.SetAsBox(config.width / 2, config.height / 2);
          fix.shape = shape;
        } else {
          fix.shape = new b2CircleShape(config.radius);
        }
        body.CreateFixture(fix);

        bodyStore.mass = body.GetMass();
        bodyStore.angularVelocity = body.GetAngularVelocity();
        bodyStore.velocity = body.GetLinearVelocity();

        state.body = body;
      },
      { fireImmediately: true }
    );

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
    ctx.world.plugins.box2d.world.DestroyBody(state.body);
    ctx.world.plugins.box2d.contacts.unsubscribe(ctx.entity.id);
    state.cleanupSubscriptions?.();
  },
  preStep: (entity, state) => {
    const transform = stores.transform.get(entity)!;
    const contacts = stores.contacts.get(entity);
    const body = stores.body.get(entity)!;

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

    body.angularVelocity = state.body.GetAngularVelocity();
    const { x, y } = state.body.GetLinearVelocity();
    body.velocity.x = x;
    body.velocity.y = y;
  },
  run: (entity, { body }, ctx) => {
    const transform = stores.transform.get(entity)!;
    const bodyStore = stores.body.get(entity)!;

    const { x, y } = body.GetPosition();
    transform.x = x;
    transform.y = y;
    transform.angle = body.GetAngle();

    if (bodyStore.forces.impulse) {
      body.ApplyLinearImpulseToCenter(bodyStore.forces.impulse, true);
      bodyStore.forces.impulse = null;
    }
    if (bodyStore.forces.velocity) {
      body.SetLinearVelocity(bodyStore.forces.velocity);
      bodyStore.forces.velocity = null;
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
