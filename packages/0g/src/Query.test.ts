import { EventEmitter } from 'events';
import { ArchetypeManager } from './ArchetypeManager';
import { ComponentInstance } from './Component';
import { Entity } from './Entity';
import { not, Not } from './filters';
import { Game } from './Game';
import { Query } from './Query';
import {
  ComponentA,
  ComponentB,
  ComponentC,
  ComponentD,
} from './__tests__/componentFixtures';

const withA = 100;
const withAB = 101;
const withB = 102;
const withC = 103;
const withD = 104;
const withAD = 105;

describe('Query', () => {
  let game: Game = null as any;

  // bootstrapping
  function addEntity(eid: number, components: ComponentInstance<any>[]) {
    game.archetypeManager.createEntity(eid);
    components.forEach((comp) => {
      game.archetypeManager.addComponent(eid, comp);
    });
  }

  beforeEach(() => {
    const archetypeManager = new ArchetypeManager({
      componentManager: {
        componentTypes: {
          length: 10,
        },
        getTypeName: () => 'TEST MOCK',
      },
      entityPool: {
        acquire() {
          return new Entity();
        },
        release() {},
      },
    } as any);
    game = new EventEmitter() as any;
    (game as any).archetypeManager = archetypeManager;
    (game as any).entityPool = {
      acquire() {
        return new Entity();
      },
      release() {},
    };

    // bootstrap some testing archetypes
    addEntity(withA, [new ComponentA()]);
    addEntity(withB, [new ComponentB()]);
    addEntity(withAB, [new ComponentA(), new ComponentB()]);
    addEntity(withC, [new ComponentC()]);
    addEntity(withD, [new ComponentD()]);
    addEntity(withAD, [new ComponentA(), new ComponentD()]);
  });

  it('registers Archetypes which match included components', () => {
    const query = new Query<[typeof ComponentA]>(game);
    query.initialize([ComponentA]);
    expect.assertions(4);
    expect(query.archetypeIds).toEqual([
      '01000000000',
      '01100000000',
      '01001000000',
    ]);
    for (const ent of query) {
      expect(ent.get(ComponentA)).not.toBe(null);
    }
  });

  it('registers Archetypes which omit excluded components', () => {
    const query = new Query<[typeof ComponentA, Not<typeof ComponentB>]>(game);
    query.initialize([ComponentA, not(ComponentB)]);
    expect.assertions(5);
    expect(query.archetypeIds).toEqual(['01000000000', '01001000000']);
    for (const ent of query) {
      expect(ent.get(ComponentA)).not.toBe(null);
      expect(ent.get(ComponentB)).toBe(null);
    }
  });

  it('registers late-added Archetypes', () => {
    const query = new Query<[typeof ComponentB]>(game);
    query.initialize([ComponentB]);
    addEntity(200, [new ComponentB(), new ComponentD()]);
    addEntity(201, [new ComponentC(), new ComponentD()]);
    expect.assertions(4);
    expect(query.archetypeIds).toEqual([
      '00100000000',
      '01100000000',
      '00101000000',
    ]);
    for (const ent of query) {
      expect(ent.get(ComponentB)).not.toBe(null);
    }
  });

  it('maintains a list of matching entities', () => {
    const onAdded = jest.fn();
    const onRemoved = jest.fn();

    const query = new Query<[typeof ComponentA]>(game);
    query.on('entityAdded', onAdded);
    query.on('entityRemoved', onRemoved);
    query.initialize([ComponentA]);
    expect(query.entities).toEqual([withA, withAB, withAD]);
    expect(query.addedIds).toEqual([withA, withAB, withAD]);
    expect(onAdded).toHaveBeenCalledTimes(3);

    // reset frame tracking
    game.emit('preApplyOperations');
    onAdded.mockClear();

    expect(query.entities).toEqual([withA, withAB, withAD]);
    expect(query.addedIds).toEqual([]);
    expect(query.removedIds).toEqual([]);

    // simple add case
    game.archetypeManager.addComponent(withC, new ComponentA());
    game.emit('stepComplete');

    expect(query.entities).toEqual([withA, withAB, withAD, withC]);
    expect(query.addedIds).toEqual([withC]);
    expect(query.removedIds).toEqual([]);
    expect(onAdded).toHaveBeenCalledTimes(1);

    game.emit('preApplyOperations');
    onAdded.mockClear();

    expect(query.entities).toEqual([withA, withAB, withAD, withC]);
    expect(query.addedIds).toEqual([]);
    expect(query.removedIds).toEqual([]);

    // simple remove case
    game.archetypeManager.removeComponent(withAD, ComponentA.id);
    game.emit('stepComplete');

    expect(query.entities).toEqual([withA, withAB, withC]);
    expect(query.addedIds).toEqual([]);
    expect(query.removedIds).toEqual([withAD]);
    expect(onRemoved).toHaveBeenCalledTimes(1);

    game.emit('preApplyOperations');
    onAdded.mockClear();

    expect(query.entities).toEqual([withA, withAB, withC]);
    expect(query.addedIds).toEqual([]);
    expect(query.removedIds).toEqual([]);

    // internal move archetype case
    game.archetypeManager.addComponent(withA, new ComponentC());
    game.emit('stepComplete');

    expect(query.entities).toEqual([withAB, withC, withA]);
    expect(query.addedIds).toEqual([]);
    expect(query.removedIds).toEqual([]);
    expect(onAdded).not.toHaveBeenCalled();
  });

  describe('events', () => {
    let query: Query<any>;
    const onAdded = jest.fn();
    const onRemoved = jest.fn();

    beforeEach(() => {
      query = new Query<[typeof ComponentA]>(game);
      query.initialize([ComponentA]);
      query.on('entityAdded', onAdded);
      query.on('entityRemoved', onRemoved);
      game.emit('preApplyOperations');
    });

    it('emits entityAdded events when an entity is added to matching Archetype', () => {
      addEntity(200, [new ComponentA()]);
      addEntity(201, [new ComponentA(), new ComponentC()]);
      addEntity(202, [new ComponentD()]);
      game.emit('stepComplete');
      expect(onAdded).toHaveBeenCalledTimes(2);
      expect(onAdded).toHaveBeenNthCalledWith(1, 200);
      expect(onAdded).toHaveBeenNthCalledWith(2, 201);
    });

    it('emits entityRemoved events when an entity is removed from matching Archetype', () => {
      game.archetypeManager.removeComponent(withAB, ComponentA.id);
      game.emit('stepComplete');
      expect(onRemoved).toHaveBeenCalledWith(withAB);
      expect(onAdded).not.toHaveBeenCalled();
    });

    it('does not emit added/removed when entity is moved between matching Archetypes', () => {
      game.archetypeManager.removeComponent(withAB, ComponentB.id);
      expect(onRemoved).not.toHaveBeenCalled();
      expect(onAdded).not.toHaveBeenCalled();
    });
  });
});
