import { System } from '0g';
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
import {
  BodyConfig,
  Body,
  World,
  WorldConfig,
  Transform,
  Contacts,
  ContactsCache,
} from './components';
import { createCapsule } from './utils';

function assignBodyConfig(body: b2Body, config: BodyConfig, id: number) {
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

function createFixtureDef(config: BodyConfig, id: number) {
  const { density, restitution, friction, shape } = config;

  const fix = new b2FixtureDef();
  fix.density = density;
  fix.restitution = restitution;
  fix.friction = friction;
  fix.userData = { entityId: id };

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

export class PhysicsWorld extends System {
  newWorlds = this.query({
    all: [WorldConfig],
    none: [World],
  });
  worlds = this.query({
    all: [World],
    none: [],
  });
  bodies = this.query({
    all: [Body, Transform],
    none: [],
  });
  bodiesWithContacts = this.query({
    all: [Contacts, ContactsCache],
    none: [],
  });
  newBodies = this.query({
    all: [BodyConfig, Transform],
    none: [Body],
  });
  oldBodies = this.query({
    all: [Body],
    none: [BodyConfig],
  });

  /**
   * Stores the current Box2D world
   */
  world: b2World | null = null;
  contacts: ContactListener | null = null;

  initWorlds = this.step(this.newWorlds, (components, entityId) => {
    const worldConfig = components.get(WorldConfig);
    const w = new b2World(worldConfig.gravity);
    const c = new ContactListener();
    w.SetContactListener(c);
    this.game.add(entityId, World, {
      value: w,
      contacts: c,
    });
    // store the world to the cached state
    this.world = w;
    this.contacts = c;
  });

  initBodies = this.step(this.newBodies, (components, entityId) => {
    if (!this.world) {
      // TODO: overkill?
      console.warn(`No physics world when initializing ${entityId}`);
      return;
    }

    const bodyConfig = components.get(BodyConfig);
    const transform = components.get(Transform);

    const b = this.world.CreateBody();
    const { x, y, angle } = transform;
    b.SetAngle(angle);
    b.SetPositionXY(x, y);

    assignBodyConfig(b, bodyConfig, entityId);
    applyFixtures(b, createFixtureDef(bodyConfig, entityId));

    this.game.add(entityId, Body, {
      value: b,
    });

    // subscribe contacts if present
    const contacts = this.game.componentManager.get(entityId, Contacts);
    if (contacts) {
      this.game.componentManager.add(entityId, ContactsCache);
      const contactsCache = this.game.componentManager.get(
        entityId,
        ContactsCache
      )!;
      this.contacts?.subscribe(entityId, contactsCache);
    }
  });

  updateBodies = this.watch(
    this.bodies,
    [BodyConfig],
    (components, entityId) => {
      const bodyConfig = components.get(BodyConfig);
      const body = components.get(Body);

      assignBodyConfig(body.value, bodyConfig, entityId);
      applyFixtures(body.value, createFixtureDef(bodyConfig, entityId));
    }
  );

  teardownBodies = this.step(this.oldBodies, (components, entityId) => {
    if (!this.world) return;
    const body = components.get(Body);
    this.world.DestroyBody(body.value);
    this.contacts?.unsubscribe(entityId);
  });

  resetContacts = this.step(this.bodiesWithContacts, (components) => {
    const contacts = components.get(Contacts);

    contacts.set({
      began: [],
      ended: [],
    });
  });

  stepWorlds = this.step(this.worlds, (components) => {
    const world = components.get(World);
    const worldConfig = components.get(WorldConfig);
    world.value.Step(
      1 / 60.0,
      worldConfig.velocityIterations,
      worldConfig.positionIterations
    );
  });

  updateTransforms = this.step(this.bodies, (components) => {
    const transform = components.get(Transform);
    const body = components.get(Body);

    const pos = body.value.GetPosition();

    transform.set({
      x: pos.x,
      y: pos.y,
      angle: body.value.GetAngle(),
    });
  });

  // update contacts
  updateContacts = this.step(this.bodiesWithContacts, (components) => {
    const cached = components.get(ContactsCache);
    const contacts = components.get(Contacts);

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

    if (cached.began.size || cached.ended.size) {
      cached.mark();
      contacts.mark();
    }
  });
}
