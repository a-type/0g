import { component } from './Component2.js';
import { Game } from './Game.js';
import { describe, it, beforeEach, expect } from 'vitest';

const A = component('A', () => ({}));
const B = component('B', () => ({}));
const C = component('C', () => ({}));

describe('Game', () => {
  let game: Game;
  beforeEach(() => {
    game = new Game({
      ignoreSystemsWarning: true,
    });
  });

  it('can ad-hoc query', () => {
    const matches: number[] = [];

    const withA = game.create();
    game.add(withA, A);
    const withAB = game.create();
    game.add(withAB, A);
    game.add(withAB, B);
    const withABC = game.create();
    game.add(withABC, A);
    game.add(withABC, B);
    game.add(withABC, C);
    const withC = game.create();
    game.add(withC, C);

    // step to run create enqueued operations
    game.step(0);

    game.query([A, B], (ent) => {
      matches.push(ent.id);
    });

    expect(matches).toContain(withAB);
    expect(matches).toContain(withABC);
    expect(matches).not.toContain(withA);
    expect(matches).not.toContain(withC);
  });

  it('can find entities', () => {
    const withA = game.create();
    game.add(withA, A);
    const withAB = game.create();
    game.add(withAB, A);
    game.add(withAB, B);
    const withABC = game.create();
    game.add(withABC, A);
    game.add(withABC, B);
    game.add(withABC, C);
    const withC = game.create();
    game.add(withC, C);

    // step to run create enqueued operations
    game.step(0);

    const matches = game.find([A, B]).map((ent) => ent.id);
    expect(matches).toContain(withAB);
    expect(matches).toContain(withABC);
    expect(matches).not.toContain(withA);
    expect(matches).not.toContain(withC);
  });

  it('can find one entity', () => {
    const withA = game.create();
    game.add(withA, A);
    const withAB = game.create();
    game.add(withAB, A);
    game.add(withAB, B);
    const withABC = game.create();
    game.add(withABC, A);
    game.add(withABC, B);
    game.add(withABC, C);
    const withC = game.create();
    game.add(withC, C);

    // step to run create enqueued operations
    game.step(0);

    const match = game.findFirst([A, B]);
    expect(match?.id).toBe(withAB);
  });
});
