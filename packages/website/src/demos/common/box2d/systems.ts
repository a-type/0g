import { Game, not, System } from '0g';
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

function assignBodyConfig(
  body: b2Body,
  config: components.BodyConfig,
  id: string
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

function createFixtureDef(config: components.BodyConfig, id: string) {
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
  newWorlds = this.trackingQuery([
    components.WorldConfig,
    not(components.World),
  ]);
  worlds = this.query([components.World]);
  bodies = this.query([components.Body, components.Transform]);
  bodiesWithContacts = this.query([
    components.Contacts,
    components.ContactsCache,
  ]);
  newBodies = this.query([
    components.BodyConfig,
    components.Transform,
    not(components.Body),
  ]);
  oldBodies = this.query([components.Body, not(components.BodyConfig)]);

  // TODO: multi world support? right now all bodies are added to first world.
  private get defaultWorldEntity() {
    return this.worlds.entities[0];
  }
  private get defaultWorld() {
    return this.defaultWorldEntity?.get(components.World);
  }

  initWorlds = this.step(this.newWorlds, (worldEntity) => {
    const worldConfig = worldEntity.get(components.WorldConfig);
    const w = new b2World(worldConfig.gravity);
    const c = new ContactListener();
    w.SetContactListener(c);
    worldEntity.add(components.World, {
      value: w,
      contacts: c,
    });
  });

  initBodies = this.step(this.newBodies, (bodyEntity) => {
    if (!this.defaultWorld) {
      // TODO: overkill?
      console.warn(`No physics world when initializing ${bodyEntity.id}`);
      return;
    }

    const bodyConfig = bodyEntity.get(components.BodyConfig);
    const transform = bodyEntity.get(components.Transform);

    const b = this.defaultWorld.value.CreateBody();
    const { x, y, angle } = transform;
    b.SetAngle(angle);
    b.SetPositionXY(x, y);

    assignBodyConfig(b, bodyConfig, bodyEntity.id);
    applyFixtures(b, createFixtureDef(bodyConfig, bodyEntity.id));

    bodyEntity.add(components.Body, {
      value: b,
    });

    // subscribe contacts if present
    const contacts = bodyEntity.maybeGet(components.Contacts);
    if (contacts) {
      bodyEntity.add(components.ContactsCache);
      const contactsCache = bodyEntity.get(components.ContactsCache);
      this.defaultWorld.contacts.subscribe(bodyEntity.id, contactsCache);
    }
  });

  updateBodies = this.watch(this.bodies, [components.BodyConfig], (entity) => {
    const bodyConfig = entity.get(components.BodyConfig);
    const body = entity.get(components.Body);

    assignBodyConfig(body.value, bodyConfig, entity.id);
    applyFixtures(body.value, createFixtureDef(bodyConfig, entity.id));
  });

  teardownBodies = this.step(this.oldBodies, (bodyEntity) => {
    if (!this.defaultWorld) return;
    const body = bodyEntity.get(components.Body);
    this.defaultWorld.value.DestroyBody(body.value);
    this.defaultWorld.contacts.unsubscribe(bodyEntity.id);
  });

  resetContacts = this.step(this.bodiesWithContacts, (bodyEntity) => {
    const contacts = bodyEntity.get(components.Contacts);

    contacts.set({
      began: [],
      ended: [],
    });
  });

  stepWorlds = this.step(this.worlds, (worldEntity) => {
    const world = worldEntity.get(components.World);
    const worldConfig = worldEntity.get(components.WorldConfig);
    world.value.Step(
      1 / 60.0,
      worldConfig.velocityIterations,
      worldConfig.positionIterations
    );
  });

  updateTransforms = this.step(this.bodies, (bodyEntity) => {
    const transform = bodyEntity.get(components.Transform);
    const body = bodyEntity.get(components.Body);

    const pos = body.value.GetPosition();

    transform.set({
      x: pos.x,
      y: pos.y,
      angle: body.value.GetAngle(),
    });
  });

  // update contacts
  updateContacts = this.step(this.bodiesWithContacts, (bodyEntity) => {
    const cached = bodyEntity.getWritable(components.ContactsCache);
    const contacts = bodyEntity.getWritable(components.Contacts);

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

const WORLD_KEY = 'physicsWorld';
const CONTACTS_KEY = 'physicsContacts';

export class PhysicsWorldInitSystem extends System {
  worlds = this.trackingQuery([components.WorldConfig]);

  run = this.register(() => {
    let entity;
    if (this.worlds.removedIds.length) {
      this.game.stateManager.removeGlobal(WORLD_KEY);
      this.game.stateManager.removeGlobal(CONTACTS_KEY);
    }
    for (entity of this.worlds.added) {
      const config = entity.get(components.WorldConfig);
      const w = new b2World(config.gravity);
      const c = new ContactListener();
      w.SetContactListener(c);
      this.game.stateManager.resolveGlobal(WORLD_KEY, w);
      this.game.stateManager.resolveGlobal(CONTACTS_KEY, c);
    }
  }, 'preStep');
}
