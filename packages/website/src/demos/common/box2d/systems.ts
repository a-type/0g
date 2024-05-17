import { system, effect, changed, Game, InstanceFor, setup } from '0g';
import {
  b2Body,
  b2BodyType,
  b2CircleShape,
  b2EdgeShape,
  b2FixtureDef,
  b2PolygonShape,
  b2World,
} from '@flyover/box2d';
import { ContactListener, EntityContact } from './ContactListener.js';
import * as components from './components.js';
import { createCapsule } from './utils.js';

declare module '0g' {
  interface Globals {
    physicsWorld: b2World;
    physicsContacts: ContactListener;
  }
}

function assignBodyConfig(
  body: b2Body,
  config: InstanceFor<typeof components.BodyConfig>,
  id: number,
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

function createFixtureDef(
  config: InstanceFor<typeof components.BodyConfig>,
  id: number,
) {
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

export const manageWorldsEffect = effect(
  [components.WorldConfig],
  (entity, game) => {
    const config = entity.get(components.WorldConfig);
    const world = new b2World(config.gravity);
    game.globals.resolve('physicsWorld', world);
    const contactListener = new ContactListener();
    world.SetContactListener(contactListener);
    game.globals.resolve('physicsContacts', contactListener);
    return () => {
      game.globals.remove('physicsWorld');
      game.globals.remove('physicsContacts');
    };
  },
);

export const manageBodiesEffect = effect(
  [components.BodyConfig, components.Transform],
  async (entity, game) => {
    const bodyConfig = entity.get(components.BodyConfig);
    const transform = entity.get(components.Transform);
    const world = await game.globals.load('physicsWorld');

    const b = world.CreateBody();
    const { x, y, angle } = transform;
    b.SetAngle(angle);
    b.SetPositionXY(x, y);

    assignBodyConfig(b, bodyConfig, entity.id);
    applyFixtures(b, createFixtureDef(bodyConfig, entity.id));

    game.add(entity, components.Body, { value: b });
    return () => {
      const body = entity.get(components.Body);
      if (body?.value) {
        world.DestroyBody(body.value);
      }
      game.remove(entity, components.Body);
    };
  },
);

export const manageContactsCacheEffect = effect(
  [components.Contacts],
  (entity, game) => {
    game.add(entity, components.ContactsCache);
    return () => {
      game.remove(entity, components.ContactsCache);
    };
  },
);

export const subscribeContactsCacheEffect = effect(
  [components.ContactsCache],
  async (entity, game) => {
    const contactsCache = entity.get(components.ContactsCache);

    const contactListener = await game.globals.load('physicsContacts');

    contactListener.subscribe(entity.id, contactsCache);

    return () => {
      contactListener.unsubscribe(entity.id);
    };
  },
);

export const updateBodiesSystem = system(
  [changed(components.BodyConfig), components.Body],
  (ent) => {
    const body = ent.get(components.Body);
    const config = ent.get(components.BodyConfig);

    assignBodyConfig(body.value, config, ent.id);
    applyFixtures(body.value, createFixtureDef(config, ent.id));
    body.$.changed = true;
  },
);

export const resetContactsSystem = system([components.Contacts], (ent) => {
  const contacts = ent.get(components.Contacts);
  contacts.began.length = 0;
  contacts.ended.length = 0;
  contacts.$.changed = true;
});

export const stepWorldRunner = setup((game: Game) => {
  let simulate: () => void;
  let unsubscribe: (() => void) | undefined;
  game.globals.load('physicsWorld').then((world) => {
    simulate = () => {
      world.Step(1 / 60.0, 8, 3);
    };
    unsubscribe = game.subscribe('phase:step', simulate);
  });

  return () => {
    unsubscribe?.();
  };
});

export const updateTransformsSystem = system(
  [components.Body, components.Transform],
  (ent) => {
    const body = ent.get(components.Body);

    const pos = body.value.GetPosition();

    const transform = ent.get(components.Transform);
    transform.x = pos.x;
    transform.y = pos.y;
    transform.angle = body.value.GetAngle();
    transform.$.changed = true;
  },
  { phase: 'preStep' },
);

export const updateContactsSystem = system(
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

    contacts.$.changed = true;

    cache.began.clear();
    cache.ended.clear();
  },
);
