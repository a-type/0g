import * as g from '0g';
import {
  b2Body,
  b2BodyType,
  b2CircleShape,
  b2FixtureDef,
  b2PolygonShape,
  b2World,
} from '@flyover/box2d';
import { ContactListener, EntityContact } from './ContactListener';
import * as stores from './stores';
import { reaction } from 'mobx';
import { DEFAULT_WORLD_NAME } from './constants';

export const rigidBody = new g.System({
  name: 'rigidBody',
  requires: [stores.body, stores.transform],
  state: {
    body: (null as unknown) as b2Body,
    newContactsCache: new Array<EntityContact>(),
    endedContactsCache: new Array<EntityContact>(),
    cleanupSubscriptions: () => {},
  },
  init: (entity, state, { game }) => {
    const transform = stores.transform.get(entity)!;
    const bodyStore = stores.body.get(entity)!;

    // create / recreate body when config changes
    state.cleanupSubscriptions = reaction(
      () => ({ ...bodyStore.config }),
      (config) => {
        const world = game.getGlobal<b2World>(
          bodyStore.config.worldName ?? DEFAULT_WORLD_NAME
        );

        if (!world) {
          throw new Error(
            'No physics world - make sure you rendered a <Physics /> component'
          );
        }

        console.log('recreating body', entity.id);
        // remove old body
        if (state.body) {
          world.DestroyBody(state.body);
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
        fix.userData = { entityId: entity.id };

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

    if (stores.contacts.get(entity)) {
      const contactListener = game.getGlobal<ContactListener>(
        `${bodyStore.config.worldName}Contacts`
      );
      contactListener.subscribe(entity.id, {
        onBeginContact,
        onEndContact,
      });
    }
  },
  dispose: (entity, state, { game }) => {
    if (!entity) {
      throw new Error(`Dispose called with no entity`);
    }
    state.cleanupSubscriptions?.();

    const worldName = stores.body.get(entity)!.config.worldName;

    if (state.body) {
      const world = game.getGlobal<b2World>(worldName ?? DEFAULT_WORLD_NAME);
      world.DestroyBody(state.body);
    }

    game
      .getGlobal<ContactListener>(`${worldName}Contacts`)
      .unsubscribe(entity.id);
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
  run: (entity, { body }) => {
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

export const physicsWorld = new g.System({
  name: 'physicsWorld',
  priority: -Infinity,
  requires: [stores.worldConfig],
  state: {
    world: null as null | b2World,
  },
  init: (entity, state, { game }) => {
    const config = stores.worldConfig.get(entity)!;
    const world = new b2World(config.gravity);
    const contactListener = new ContactListener();
    world.SetContactListener(contactListener);

    game.setGlobal(config.worldName ?? DEFAULT_WORLD_NAME, world);
    game.setGlobal(`${config.worldName}Contacts`, contactListener);

    console.debug(
      `Added Physics World: ${config.worldName ?? DEFAULT_WORLD_NAME}`
    );

    state.world = world;

    // debug
    (window as any).box2d = (window as any).box2d || {};
    (window as any).box2d[config.worldName ?? DEFAULT_WORLD_NAME] = world;
  },
  run: (entity, state) => {
    const config = stores.worldConfig.get(entity)!;
    state.world?.Step(
      60 / 1000,
      config.velocityIterations,
      config.positionIterations,
      config.particleIterations
    );
  },
});
