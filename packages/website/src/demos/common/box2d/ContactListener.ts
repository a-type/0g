import { b2Contact, b2ContactListener, b2Fixture } from '@flyover/box2d';

export type EntityContact = {
  selfId: number | null;
  otherId: number | null;
  contact: b2Contact;
  otherFixture: b2Fixture;
  selfFixture: b2Fixture;
  id: string;
};

// const contactPairCache: Record<string, [EntityContact, EntityContact]> = {};
const contactPairCache = new WeakMap<
  b2Contact,
  [EntityContact, EntityContact]
>();

function getOrCreatePair(contact: b2Contact) {
  const aData = contact.GetFixtureA().GetUserData() ?? {};
  const bData = contact.GetFixtureB().GetUserData() ?? {};
  const aId = (aData.entityId as number) || null;
  const bId = (bData.entityId as number) || null;
  const key = `${aId}<->${bId}`;

  let pair = contactPairCache.get(contact);
  if (pair) {
    return pair;
  }
  pair = [{} as any, {} as any];
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
  pair[0].id = `${Math.random().toFixed(10)}`;
  pair[1].id = `${Math.random().toFixed(10)}`;
  contactPairCache.set(contact, pair);
  return pair;
}

function cleanupPair(contact: b2Contact) {
  const aData = contact.GetFixtureA().GetUserData() ?? {};
  const bData = contact.GetFixtureB().GetUserData() ?? {};
  const aId = (aData.entityId as string) || null;
  const bId = (bData.entityId as string) || null;
  const key = `${aId}<->${bId}`;

  const pair = contactPairCache.get(contact);
  if (pair) {
    contactPairCache.delete(contact);
  }
}

type EntityContactListeners = {
  onBeginContact?(contact: EntityContact): void;
  onEndContact?(contact: EntityContact): void;
};

export class ContactListener implements b2ContactListener {
  private entityListeners: EntityContactListeners[] = [];
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

  subscribe = (entityId: number, listeners: EntityContactListeners) => {
    this.entityListeners[entityId] = listeners;
  };

  unsubscribe = (entityId: number) => {
    delete this.entityListeners[entityId];
  };

  private invokeListeners = (
    contact: b2Contact,
    event: 'onBeginContact' | 'onEndContact'
  ) => {
    const pair = getOrCreatePair(contact);

    if (pair[0].selfId) {
      this.entityListeners[pair[0].selfId]?.[event]?.(pair[0]);
    }
    if (pair[1].selfId) {
      this.entityListeners[pair[1].selfId]?.[event]?.(pair[1]);
    }

    if (event === 'onEndContact') {
      cleanupPair(contact);
    }
  };
}
