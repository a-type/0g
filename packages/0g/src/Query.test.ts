import { ArchetypeManager } from './ArchetypeManager';
import { Component } from './components';
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
  let game: Game;

  // bootstrapping
  function addEntity(eid: number, components: Component[]) {
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
      },
    } as any);
    game = {
      archetypeManager,
    } as any;

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
      expect(ent.maybeGet(ComponentB)).toBe(null);
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

  describe('events', () => {
    let query: Query;
    const onAdded = jest.fn();
    const onRemoved = jest.fn();

    beforeEach(() => {
      query = new Query<[typeof ComponentA]>(game);
      query.initialize([ComponentA]);
      query.on('entityAdded', onAdded);
      query.on('entityRemoved', onRemoved);
    });

    it('emits entityAdded events when an entity is added to matching Archetype', () => {
      addEntity(200, [new ComponentA()]);
      addEntity(201, [new ComponentA(), new ComponentC()]);
      addEntity(202, [new ComponentD()]);
      expect(onAdded).toHaveBeenCalledTimes(3);
      expect(onAdded).toHaveBeenNthCalledWith(1, 200);
      expect(onAdded).toHaveBeenNthCalledWith(2, 201);
      expect(onAdded).toHaveBeenNthCalledWith(3, 201);
    });

    it('emits entityRemoved events when an entity is removed from matching Archetype', () => {
      game.archetypeManager.removeComponent(withAB, ComponentA.id);
      expect(onRemoved).toHaveBeenCalledWith(withAB);
      expect(onAdded).not.toHaveBeenCalled();
    });

    it('emits entityRemoved and entityAdded in order when entity is moved between matching Archetypes', () => {
      game.archetypeManager.removeComponent(withAB, ComponentB.id);
      expect(onRemoved).toHaveBeenCalledWith(withAB);
      expect(onAdded).toHaveBeenCalledWith(withAB);
    });
  });
});
