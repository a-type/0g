import { EventEmitter } from 'events';
import { ArchetypeManager } from './Archetype';
import { Component } from './components';
import { Game } from './Game';
import { TrackingQuery } from './TrackingQuery';
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

class MockGame extends EventEmitter {
  constructor(public archetypeManager: ArchetypeManager) {
    super();
  }
}

describe('TrackingQuery', () => {
  let game: Game;

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
    game = new MockGame(archetypeManager) as any;

    addEntity(withA, [new ComponentA()]);
    addEntity(withB, [new ComponentB()]);
    addEntity(withAB, [new ComponentA(), new ComponentB()]);
    addEntity(withC, [new ComponentC()]);
    addEntity(withD, [new ComponentD()]);
    addEntity(withAD, [new ComponentA(), new ComponentD()]);
  });

  it('maintains a list of matching entities', () => {
    const query = new TrackingQuery<[typeof ComponentA]>(game);
    query.initialize([ComponentA]);
    expect(query.entities).toEqual([withA, withAB, withAD]);
    expect(query.added).toEqual([withA, withAB, withAD]);

    // reset frame tracking
    game.emit('preApplyOperations');
    expect(query.entities).toEqual([withA, withAB, withAD]);
    expect(query.added).toEqual([]);
    expect(query.removed).toEqual([]);

    // simple add case
    game.archetypeManager.addComponent(withC, new ComponentA());

    expect(query.entities).toEqual([withA, withAB, withAD, withC]);
    expect(query.added).toEqual([withC]);
    expect(query.removed).toEqual([]);

    game.emit('preApplyOperations');

    expect(query.entities).toEqual([withA, withAB, withAD, withC]);
    expect(query.added).toEqual([]);
    expect(query.removed).toEqual([]);

    // simple remove case
    game.archetypeManager.removeComponent(withAD, ComponentA.id);

    expect(query.entities).toEqual([withA, withAB, withC]);
    expect(query.added).toEqual([]);
    expect(query.removed).toEqual([withAD]);

    game.emit('preApplyOperations');

    expect(query.entities).toEqual([withA, withAB, withC]);
    expect(query.added).toEqual([]);
    expect(query.removed).toEqual([]);

    // internal move archetype case
    game.archetypeManager.addComponent(withA, new ComponentC());

    expect(query.entities).toEqual([withAB, withC, withA]);
    expect(query.added).toEqual([]);
    expect(query.removed).toEqual([]);
  });
});
