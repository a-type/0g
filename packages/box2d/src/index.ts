import * as r2d from 'r2d';
import {
  b2Contact,
  b2ContactListener,
  b2Fixture,
  b2World,
} from '@flyover/box2d';
import ObjectPool from '@tsdotnet/object-pool';
import * as systems from './systems';
import * as stores from './stores';

export * as systems from './systems';
export * as stores from './stores';

export type EntityContact = {
  selfId: string | null;
  otherId: string | null;
  contact: b2Contact;
  otherFixture: b2Fixture;
  selfFixture: b2Fixture;
};

const contactPool = new ObjectPool((): [EntityContact, EntityContact] => [
  {
    selfId: null as any,
    otherId: null as any,
    contact: null as any,
    otherFixture: null as any,
    selfFixture: null as any,
  },
  {
    selfId: null as any,
    otherId: null as any,
    contact: null as any,
    otherFixture: null as any,
    selfFixture: null as any,
  },
]);

const contactPairCache = new WeakMap<
  b2Contact,
  [EntityContact, EntityContact]
>();

function getOrCreatePair(contact: b2Contact) {
  let pair = contactPairCache.get(contact);
  if (pair) return pair;
  pair = contactPool.take();
  const aData = contact.GetFixtureA().GetUserData() ?? {};
  const bData = contact.GetFixtureB().GetUserData() ?? {};
  const aId = (aData.entityId as string) || null;
  const bId = (bData.entityId as string) || null;
  pair[0].selfId = aId;
  pair[0].otherId = bId;
  pair[0].contact = contact;
  pair[0].otherFixture = contact.GetFixtureB();
  pair[0].selfFixture = contact.GetFixtureA();
  pair[1].selfId = bId;
  pair[1].otherId = aId;
  pair[1].contact = contact;
  pair[1].otherFixture = contact.GetFixtureA();
  pair[1].selfFixture = contact.GetFixtureB();
  return pair;
}

type EntityContactListeners = {
  onBeginContact?(contact: EntityContact): void;
  onEndContact?(contact: EntityContact): void;
};

class ContactListener implements b2ContactListener {
  private entityListeners: Record<string, EntityContactListeners> = {};
  /** @private */
  BeginContact(contact: b2Contact) {
    this.invokeListeners(contact, 'onBeginContact');
  }
  /** @private */
  EndContact(contact: b2Contact) {
    this.invokeListeners(contact, 'onEndContact');
  }

  BeginContactFixtureParticle() {
    return;
  }
  EndContactFixtureParticle() {
    return;
  }
  BeginContactParticleParticle() {
    return;
  }
  EndContactParticleParticle() {
    return;
  }
  PreSolve() {
    return;
  }
  PostSolve() {
    return;
  }

  subscribe = (entityId: string, listeners: EntityContactListeners) => {
    this.entityListeners[entityId] = listeners;
  };

  unsubscribe = (entityId: string) => {
    delete this.entityListeners[entityId];
  };

  private invokeListeners = (
    contact: b2Contact,
    event: 'onBeginContact' | 'onEndContact'
  ) => {
    const [eca, ecb] = getOrCreatePair(contact);

    if (eca.selfId) {
      this.entityListeners[eca.selfId]?.[event]?.(eca);
    }
    if (ecb.selfId) {
      this.entityListeners[ecb.selfId]?.[event]?.(ecb);
    }
  };
}

export const box2d = (world: b2World) => {
  const contacts = new ContactListener();
  world.SetContactListener(contacts);

  return r2d.plugin({
    api: {
      world,
      contacts,
    },
    run: () => {
      world.Step(60 / 1000, 8, 3);
    },
    systems,
    stores,
  });
};
