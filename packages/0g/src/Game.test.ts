import { Game } from './Game.js';
import { Component } from './Component.js';
import { describe, it, beforeEach, expect } from 'vitest';

class A extends Component(() => ({})) {}
class B extends Component(() => ({})) {}
class C extends Component(() => ({})) {}

describe('Game', () => {
  let game: Game;
  beforeEach(() => {
    game = new Game({
      components: [A, B, C],
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
});
