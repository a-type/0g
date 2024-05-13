import { component } from '../Component2.js';
import { effect } from '../Effect.js';
import { Entity } from '../Entity.js';
import { changed, not } from '../filters.js';
import { Game } from '../Game.js';
import { logger } from '../logger.js';
import { system } from '../System.js';
import { describe, it, expect } from 'vitest';

const delta = 16 + 2 / 3;

describe('integration tests', () => {
  const OutputComponent = component('Output', () => ({
    removablePresent: false,
  }));

  const RemovableComponent = component('Removable', () => ({
    stepsSinceAdded: 0,
  }));

  const stepsTillToggle = 3;

  const SetFlagEffect = effect(
    [RemovableComponent, OutputComponent],
    function (ent) {
      logger.debug('Setting removablePresent: true');
      const output = ent.get(OutputComponent);
      output.removablePresent = true;
      output.$.changed = true;

      return () => {
        logger.debug('Setting removablePresent: false');
        const output = ent.get(OutputComponent);
        output.removablePresent = false;
        output.$.changed = true;
      };
    },
  );

  const ReAddRemovableEffect = effect(
    [not(RemovableComponent)],
    function (ent, game) {
      logger.debug('Adding RemovableComponent');
      game.add(ent.id, RemovableComponent);
    },
  );

  const IncrementRemoveTimerSystem = system([RemovableComponent], (ent) => {
    logger.debug('Incrementing stepsSinceAdded');
    const comp = ent.get(RemovableComponent);
    comp.stepsSinceAdded++;
    comp.$.changed = true;
    logger.debug(`stepsSinceAdded: ${comp.stepsSinceAdded}`);
  });

  const RemoveSystem = system([changed(RemovableComponent)], (ent, game) => {
    if (ent.get(RemovableComponent).stepsSinceAdded >= stepsTillToggle) {
      logger.debug('Removing RemovableComponent');
      game.remove(ent.id, RemovableComponent);
    }
  });

  it('adds and removes components, and queries for those operations', () => {
    const game = new Game();

    const a = game.create();
    game.add(a, OutputComponent);

    logger.debug('Step 1');
    game.step(delta);

    let entity: Entity<typeof OutputComponent> = game.get(a)!;

    expect(entity.maybeGet(OutputComponent)).not.toBe(null);
    expect(entity.get(OutputComponent).removablePresent).toBe(false);

    logger.debug('Step 2');
    game.step(delta);
    entity = game.get(a)!;

    expect(entity.get(OutputComponent).removablePresent).toBe(true);
    expect(entity.maybeGet(RemovableComponent)).not.toBe(null);
    expect(entity.maybeGet(RemovableComponent)!.stepsSinceAdded).toBe(0);

    logger.debug('Step 3');
    game.step(delta);
    entity = game.get(a)!;

    expect(entity.get(OutputComponent).removablePresent).toBe(true);
    expect(entity.maybeGet(RemovableComponent)).not.toBe(null);
    expect(entity.maybeGet(RemovableComponent)!.stepsSinceAdded).toBe(1);

    logger.debug('Step 4');
    game.step(delta);
    entity = game.get(a)!;

    expect(entity.get(OutputComponent).removablePresent).toBe(true);
    expect(entity.maybeGet(RemovableComponent)).not.toBe(null);
    expect(entity.maybeGet(RemovableComponent)!.stepsSinceAdded).toBe(2);

    logger.debug('Step 5');
    game.step(delta);
    entity = game.get(a)!;

    expect(entity.get(OutputComponent).removablePresent).toBe(false);
    expect(entity.maybeGet(RemovableComponent)).toBe(null);

    logger.debug('Step 6');
    game.step(delta);
    entity = game.get(a)!;

    expect(entity.get(OutputComponent).removablePresent).toBe(true);
    expect(entity.maybeGet(RemovableComponent)).not.toBe(null);
    expect(entity.maybeGet(RemovableComponent)!.stepsSinceAdded).toBe(0);
  });
});
