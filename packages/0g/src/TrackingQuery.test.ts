import { EventEmitter } from 'events';
import { ArchetypeManager } from './ArchetypeManager';
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
    const onChange = jest.fn();

    const query = new TrackingQuery<[typeof ComponentA]>(game);
    query.on('change', onChange);
    query.initialize([ComponentA]);
    expect(query.entities).toEqual([withA, withAB, withAD]);
    expect(query.addedIds).toEqual([withA, withAB, withAD]);
    expect(onChange).toHaveBeenCalledTimes(1);

    // reset frame tracking
    game.emit('preApplyOperations');
    onChange.mockClear();

    expect(query.entities).toEqual([withA, withAB, withAD]);
    expect(query.addedIds).toEqual([]);
    expect(query.removedIds).toEqual([]);

    // simple add case
    game.archetypeManager.addComponent(withC, new ComponentA());
    game.emit('stepComplete');

    expect(query.entities).toEqual([withA, withAB, withAD, withC]);
    expect(query.addedIds).toEqual([withC]);
    expect(query.removedIds).toEqual([]);
    expect(onChange).toHaveBeenCalledTimes(1);

    game.emit('preApplyOperations');
    onChange.mockClear();

    expect(query.entities).toEqual([withA, withAB, withAD, withC]);
    expect(query.addedIds).toEqual([]);
    expect(query.removedIds).toEqual([]);

    // simple remove case
    game.archetypeManager.removeComponent(withAD, ComponentA.id);
    game.emit('stepComplete');

    expect(query.entities).toEqual([withA, withAB, withC]);
    expect(query.addedIds).toEqual([]);
    expect(query.removedIds).toEqual([withAD]);
    expect(onChange).toHaveBeenCalledTimes(1);

    game.emit('preApplyOperations');
    onChange.mockClear();

    expect(query.entities).toEqual([withA, withAB, withC]);
    expect(query.addedIds).toEqual([]);
    expect(query.removedIds).toEqual([]);

    // internal move archetype case
    game.archetypeManager.addComponent(withA, new ComponentC());
    game.emit('stepComplete');

    expect(query.entities).toEqual([withAB, withC, withA]);
    expect(query.addedIds).toEqual([]);
    expect(query.removedIds).toEqual([]);
    expect(onChange).not.toHaveBeenCalled();
  });
});
