import { useQuery, useQueryFrame, useWatch } from '0g';
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

function assignBodyConfig(body: b2Body, config: stores.BodyConfig, id: string) {
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

function createFixtureDef(config: stores.BodyConfig, id: string) {
  const { density, restitution, friction, shape } = config;

  const fix = new b2FixtureDef();
  fix.density = density;
  fix.restitution = restitution;
  fix.friction = friction;
  fix.userData = { entityId: id };

  if (shape.shape === 'rectangle') {
    const s = new b2PolygonShape();
    s.SetAsBox(shape.width / 2, shape.height / 2);
    fix.shape = s;
  } else {
    fix.shape = new b2CircleShape(shape.radius);
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

export const PhysicsWorld = () => {
  const newWorlds = useQuery({
    all: [stores.WorldConfig],
    none: [stores.World],
  });
  const worlds = useQuery({
    all: [stores.World],
    none: [],
  });
  const bodies = useQuery({
    all: [stores.Body, stores.Transform],
    none: [],
  });
  const bodiesWithContacts = useQuery({
    all: [stores.Contacts, stores.ContactsCache],
    none: [],
  });
  const newBodies = useQuery({
    all: [stores.BodyConfig, stores.Transform],
    none: [stores.Body],
  });
  const oldBodies = useQuery({
    all: [stores.Body],
    none: [stores.BodyConfig],
  });

  // set up new worlds
  useQueryFrame(newWorlds, (worldEntity) => {
    const worldConfig = worldEntity.get(stores.WorldConfig);
    const w = new b2World(worldConfig.gravity);
    const c = new ContactListener();
    w.SetContactListener(c);
    worldEntity.add(stores.World, {
      value: w,
      contacts: c,
    });
  });

  // TODO: multi world support? right now all bodies are added to first world.
  const defaultWorldEntity = worlds.entities[0];
  const defaultWorld = defaultWorldEntity?.get(stores.World);

  // set up new bodies
  useQueryFrame(newBodies, (bodyEntity) => {
    if (!defaultWorld) {
      return;
    }

    const bodyConfig = bodyEntity.get(stores.BodyConfig);
    const transform = bodyEntity.get(stores.Transform);

    const b = defaultWorld.value.CreateBody();
    const { x, y, angle } = transform;
    b.SetAngle(angle);
    b.SetPositionXY(x, y);

    assignBodyConfig(b, bodyConfig, bodyEntity.id);
    applyFixtures(b, createFixtureDef(bodyConfig, bodyEntity.id));

    bodyEntity.add(stores.Body, {
      value: b,
    });

    // subscribe contacts if present
    const contacts = bodyEntity.maybeGet(stores.Contacts);
    if (contacts) {
      bodyEntity.add(stores.ContactsCache);
      const contactsCache = bodyEntity.get(stores.ContactsCache);
      defaultWorld.contacts.subscribe(bodyEntity.id, contactsCache);
    }
  });

  // keep bodies up to date with their configs
  useWatch(bodies, [stores.BodyConfig], (entity) => {
    const bodyConfig = entity.get(stores.BodyConfig);
    const body = entity.get(stores.Body);

    assignBodyConfig(body.value, bodyConfig, entity.id);
    applyFixtures(body.value, createFixtureDef(bodyConfig, entity.id));
  });

  // tear down old bodies
  useQueryFrame(oldBodies, (bodyEntity) => {
    if (!defaultWorld) return;
    const body = bodyEntity.get(stores.Body);
    defaultWorld.value.DestroyBody(body.value);
    defaultWorld.contacts.unsubscribe(bodyEntity.id);
  });

  // reset contacts
  useQueryFrame(bodiesWithContacts, (bodyEntity) => {
    const contacts = bodyEntity.get(stores.Contacts);

    contacts.began = [];
    contacts.ended = [];
  });

  // run worlds
  useQueryFrame(worlds, (worldEntity) => {
    const world = worldEntity.get(stores.World);
    const worldConfig = worldEntity.get(stores.WorldConfig);
    world.value.Step(
      1 / 60.0,
      worldConfig.velocityIterations,
      worldConfig.positionIterations
    );
  });

  // update transforms
  useQueryFrame(bodies, (bodyEntity) => {
    const transform = bodyEntity.get(stores.Transform);
    const body = bodyEntity.get(stores.Body);

    const pos = body.value.GetPosition();

    transform.set({
      x: pos.x,
      y: pos.y,
      angle: body.value.GetAngle(),
    });
  });

  // update contacts
  useQueryFrame(bodiesWithContacts, (bodyEntity) => {
    const cached = bodyEntity.get(stores.ContactsCache);
    const contacts = bodyEntity.get(stores.Contacts);

    let c: EntityContact;
    for (c of cached.began.values()) {
      contacts.began.push(c);
      contacts.current.push(c);
      cached.began.delete(c);
    }

    for (c of cached.ended.values()) {
      contacts.current = contacts.current.filter((v) => v.id !== c.id);
      contacts.ended.push(c);
      cached.ended.delete(c);
    }

    contacts.mark();
    cached.mark();
  });

  return null;
};
