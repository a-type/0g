import { makeSystem, makeEffect, changed, Game, compose } from '0g';
import {
  b2Body,
  b2BodyType,
  b2CircleShape,
  b2EdgeShape,
  b2FixtureDef,
  b2PolygonShape,
  b2World,
} from '@flyover/box2d';
import { ContactListener, EntityContact } from './ContactListener';
import * as components from './components';
import { createCapsule } from './utils';

declare module '0g' {
  interface GameResources {
    physicsWorld: b2World;
    physicsContacts: ContactListener;
  }
}

function assignBodyConfig(
  body: b2Body,
  config: components.BodyConfig,
  id: number
) {
  const {
    // TODO: verify assumptions about defaults
    isStatic = false,
    fixedRotation = false,
    linearDamping = 0,
    angularDamping = 0,
  } = config;

  body.SetType(isStatic ? b2BodyType.b2_staticBody : b2BodyType.b2_dynamicBody);
  body.SetLinearDamping(linearDamping);
  body.SetFixedRotation(fixedRotation);
  body.SetAngularDamping(angularDamping);
  body.SetUserData({
    entityId: id,
  });

  return body;
}

function createFixtureDef(config: components.BodyConfig, id: number) {
  const { density, restitution, friction, shape, sensor } = config;

  const fix = new b2FixtureDef();
  fix.density = density;
  fix.restitution = restitution;
  fix.friction = friction;
  fix.userData = { entityId: id };
  fix.isSensor = sensor;

  let p: b2PolygonShape;
  switch (shape.shape) {
    case 'rectangle':
      p = new b2PolygonShape();
      p.SetAsBox(shape.width / 2, shape.height / 2);
      fix.shape = p;
      break;
    case 'circle':
      fix.shape = new b2CircleShape(shape.radius);
      break;
    case 'polygon':
      p = new b2PolygonShape();
      p.Set(shape.vertices);
      fix.shape = p;
      break;
    case 'edge':
      const e = new b2EdgeShape();
      e.Set(shape.v1, shape.v2);
      fix.shape = e;
      break;
    case 'capsule':
      p = new b2PolygonShape();
      p.Set(createCapsule(shape.width, shape.height, shape.segments ?? 8));
      break;
    default:
      throw new Error(`Shape ${(shape as any).shape} not supported (yet)`);
  }

  return fix;
}

function applyFixtures(body: b2Body, fix: b2FixtureDef) {
  // remove all existing fixtures
  for (let fix = body.GetFixtureList(); !!fix; fix = fix.GetNext()) {
    body.DestroyFixture(fix);
  }
  body.CreateFixture(fix);
}

const manageWorldsEffect = makeEffect(
  [components.WorldConfig],
  (entity, game) => {
    const config = entity.get(components.WorldConfig);
    const world = new b2World(config.gravity);
    game.globals.resolve('physicsWorld', world);
    const contactListener = new ContactListener();
    world.SetContactListener(contactListener);
    game.globals.resolve('physicsContacts', contactListener);
  },
  (_, game) => {
    game.globals.remove('physicsWorld');
    game.globals.remove('physicsContacts');
  }
);

const manageBodiesEffect = makeEffect(
  [components.BodyConfig, components.Transform],
  function* (entity, game) {
    const bodyConfig = entity.get(components.BodyConfig);
    const transform = entity.get(components.Transform);
    const world = yield game.globals.load('physicsWorld');

    const b = world.CreateBody();
    const { x, y, angle } = transform;
    b.SetAngle(angle);
    b.SetPositionXY(x, y);

    assignBodyConfig(b, bodyConfig, entity.id);
    applyFixtures(b, createFixtureDef(bodyConfig, entity.id));

    game.add(entity.id, components.Body, { value: b });
  },
  function* (entity, game) {
    const body = entity.get(components.Body);
    if (body?.value) {
      const world = yield game.globals.load('physicsWorld');
      world.DestroyBody(body.value);
    }
    game.remove(entity.id, components.Body);
  }
);

const manageContactsCacheEffect = makeEffect(
  [components.Contacts],
  (entity, game) => {
    game.add(entity.id, components.ContactsCache);
  },
  (entity, game) => {
    game.remove(entity.id, components.ContactsCache);
  }
);

const subscribeContactsCacheEffect = makeEffect(
  [components.ContactsCache],
  function* (entity, game) {
    const contactsCache = entity.get(components.ContactsCache);

    const contactListener = yield game.globals.load('physicsContacts');

    contactListener.subscribe(entity.id, contactsCache);
  },
  function* (entity, game) {
    const contactListener = yield game.globals.load('physicsContacts');
    contactListener.unsubscribe(entity.id);
  }
);

const updateBodiesSystem = makeSystem(
  [changed(components.BodyConfig), components.Body],
  (ent) => {
    const body = ent.get(components.Body);
    const config = ent.get(components.BodyConfig);

    assignBodyConfig(body.value, config, ent.id);
    applyFixtures(body.value, createFixtureDef(config, ent.id));
    body.updated = true;
  }
);

const resetContactsSystem = makeSystem([components.Contacts], (ent) => {
  const contacts = ent.get(components.Contacts);
  contacts.began.length = 0;
  contacts.ended.length = 0;
  contacts.updated = true;
});

const stepWorldRunner = (game: Game) => {
  let simulate: () => void;
  game.globals.load('physicsWorld').then((world) => {
    simulate = () => {
      world.Step(1 / 60.0, 8, 3);
    };
    game.on('step', simulate);
  });

  return () => {
    game.off('step', simulate);
  };
};

const updateTransformsSystem = makeSystem(
  [components.Body, components.Transform],
  (ent) => {
    const body = ent.get(components.Body);

    const pos = body.value.GetPosition();

    ent.get(components.Transform).update((transform) => {
      transform.x = pos.x;
      transform.y = pos.y;
      transform.angle = body.value.GetAngle();
    });
  }
);

const updateContactsSystem = makeSystem(
  [changed(components.ContactsCache), components.Contacts],
  (ent) => {
    const cache = ent.get(components.ContactsCache);
    const contacts = ent.get(components.Contacts);

    let c: EntityContact;
    for (c of cache.began.values()) {
      contacts.began.push(c);
      contacts.current.push(c);
    }
    for (c of cache.ended.values()) {
      contacts.current.splice(contacts.current.indexOf(c), 1);
      contacts.ended.push(c);
    }

    contacts.updated = true;

    cache.began.clear();
    cache.ended.clear();
  }
);

export const systems = compose(
  manageWorldsEffect,
  manageBodiesEffect,
  manageContactsCacheEffect,
  subscribeContactsCacheEffect,
  updateBodiesSystem,
  resetContactsSystem,
  stepWorldRunner,
  updateTransformsSystem,
  updateContactsSystem
);
