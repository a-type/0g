import { System } from '0g';
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

export class PhysicsWorld extends System {
  newWorlds = this.query({
    all: [stores.WorldConfig],
    none: [stores.World],
  });
  worlds = this.query({
    all: [stores.World],
    none: [],
  });
  bodies = this.query({
    all: [stores.Body, stores.Transform],
    none: [],
  });
  bodiesWithContacts = this.query({
    all: [stores.Contacts, stores.ContactsCache],
    none: [],
  });
  newBodies = this.query({
    all: [stores.BodyConfig, stores.Transform],
    none: [stores.Body],
  });
  oldBodies = this.query({
    all: [stores.Body],
    none: [stores.BodyConfig],
  });

  // TODO: multi world support? right now all bodies are added to first world.
  private get defaultWorldEntity() {
    return this.worlds.entities[0];
  }
  private get defaultWorld() {
    return this.defaultWorldEntity?.get(stores.World);
  }

  initWorlds = this.frame(this.newWorlds, (worldEntity) => {
    const worldConfig = worldEntity.get(stores.WorldConfig);
    const w = new b2World(worldConfig.gravity);
    const c = new ContactListener();
    w.SetContactListener(c);
    worldEntity.add(stores.World, {
      value: w,
      contacts: c,
    });
  });

  initBodies = this.frame(this.newBodies, (bodyEntity) => {
    if (!this.defaultWorld) {
      return;
    }

    const bodyConfig = bodyEntity.get(stores.BodyConfig);
    const transform = bodyEntity.get(stores.Transform);

    const b = this.defaultWorld.value.CreateBody();
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
      this.defaultWorld.contacts.subscribe(bodyEntity.id, contactsCache);
    }
  });

  updateBodies = this.watch(this.bodies, [stores.BodyConfig], (entity) => {
    const bodyConfig = entity.get(stores.BodyConfig);
    const body = entity.get(stores.Body);

    assignBodyConfig(body.value, bodyConfig, entity.id);
    applyFixtures(body.value, createFixtureDef(bodyConfig, entity.id));
  });

  teardownBodies = this.frame(this.oldBodies, (bodyEntity) => {
    if (!this.defaultWorld) return;
    const body = bodyEntity.get(stores.Body);
    this.defaultWorld.value.DestroyBody(body.value);
    this.defaultWorld.contacts.unsubscribe(bodyEntity.id);
  });

  resetContacts = this.frame(this.bodiesWithContacts, (bodyEntity) => {
    const contacts = bodyEntity.get(stores.Contacts);

    contacts.set({
      began: [],
      ended: [],
    });
  });

  stepWorlds = this.frame(this.worlds, (worldEntity) => {
    const world = worldEntity.get(stores.World);
    const worldConfig = worldEntity.get(stores.WorldConfig);
    world.value.Step(
      1 / 60.0,
      worldConfig.velocityIterations,
      worldConfig.positionIterations
    );
  });

  updateTransforms = this.frame(this.bodies, (bodyEntity) => {
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
  updateContacts = this.frame(this.bodiesWithContacts, (bodyEntity) => {
    const cached = bodyEntity.getWritable(stores.ContactsCache);
    const contacts = bodyEntity.getWritable(stores.Contacts);

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
  });
}
