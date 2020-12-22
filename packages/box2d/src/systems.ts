import * as g from '0g';
import {
  b2Body,
  b2BodyDef,
  b2BodyType,
  b2CircleShape,
  b2FixtureDef,
  b2PolygonShape,
  b2World,
} from '@flyover/box2d';
import { autorun, reaction } from 'mobx';
import { ContactListener, EntityContact } from './ContactListener';
import * as stores from './stores';

function assignBodyConfig(
  body: b2Body,
  config: g.StoreShape<typeof stores.bodyConfig>,
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

function createFixtureDef(
  config: g.StoreShape<typeof stores.bodyConfig>,
  id: string
) {
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

export const physicsWorld = g.system(
  'physicsWorld',
  {
    newWorlds: {
      all: [stores.worldConfig],
      none: [stores.world],
    },
    worlds: {
      all: [stores.world],
      none: [],
    },
    bodies: {
      all: [stores.body, stores.transform],
      none: [],
    },
    bodiesWithContacts: {
      all: [stores.contacts, stores.contactsCache],
      none: [],
    },
    newBodies: {
      all: [stores.bodyConfig, stores.transform],
      none: [stores.body],
    },
    oldBodies: {
      all: [stores.body],
      none: [stores.bodyConfig],
    },
  },
  function (game) {
    // set up new worlds
    this.queries.newWorlds.entities.forEach((worldEntity) => {
      const worldConfig = worldEntity.get(stores.worldConfig);
      const w = new b2World(worldConfig.gravity);
      const c = new ContactListener();
      w.SetContactListener(c);
      worldEntity.add(stores.world, {
        value: w,
        contacts: c,
      });
    });

    // TODO: multi world support? right now all bodies are added to first world.
    const defaultWorldEntity = this.queries.worlds.entities[0];
    const defaultWorld = defaultWorldEntity?.get(stores.world);

    // set up new bodies
    if (defaultWorld) {
      this.queries.newBodies.entities.forEach((bodyEntity) => {
        const bodyConfig = bodyEntity.get(stores.bodyConfig);
        const transform = bodyEntity.get(stores.transform);

        const b = defaultWorld.value.CreateBody();
        const { x, y, angle } = transform;
        b.SetAngle(angle);
        b.SetPositionXY(x, y);

        const cleanupBodyProps = autorun(() => {
          assignBodyConfig(b, bodyConfig, bodyEntity.id);
        });
        const cleanupShape = autorun(() => {
          applyFixtures(b, createFixtureDef(bodyConfig, bodyEntity.id));
        });

        bodyEntity.add(stores.body, {
          value: b,
          __cleanup: () => {
            cleanupBodyProps();
            cleanupShape();
          },
        });

        // subscribe contacts if present
        const contacts = bodyEntity.maybeGet(stores.contacts);
        if (contacts) {
          bodyEntity.add(stores.contactsCache);
          const contactsCache = bodyEntity.get(stores.contactsCache);
          defaultWorld.contacts.subscribe(bodyEntity.id, contactsCache);
        }
      });

      // tear down old bodies
      this.queries.oldBodies.entities.forEach((bodyEntity) => {
        const body = bodyEntity.get(stores.body);
        defaultWorld.value.DestroyBody(body.value);
        defaultWorld.contacts.unsubscribe(bodyEntity.id);
        body.__cleanup();
      });
    }

    // reset contacts
    this.queries.bodiesWithContacts.entities.forEach((bodyEntity) => {
      const contacts = bodyEntity.get(stores.contacts);

      contacts.began = [];
      contacts.ended = [];
    });

    // run worlds
    this.queries.worlds.entities.forEach((worldEntity) => {
      const world = worldEntity.get(stores.world);
      const worldConfig = worldEntity.get(stores.worldConfig);
      world.value.Step(
        1 / 60.0,
        worldConfig.velocityIterations,
        worldConfig.positionIterations
      );
    });

    // update transforms
    this.queries.bodies.entities.forEach((bodyEntity) => {
      const transform = bodyEntity.get(stores.transform);
      const body = bodyEntity.get(stores.body);

      const pos = body.value.GetPosition();

      transform.x = pos.x;
      transform.y = pos.y;
      transform.angle = body.value.GetAngle();
    });

    // update contacts
    this.queries.bodiesWithContacts.entities.forEach((bodyEntity) => {
      const cached = bodyEntity.get(stores.contactsCache);
      const contacts = bodyEntity.get(stores.contacts);

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
);
