import { Component } from '../components';
import { makeEffect } from '../Effect';
import { EntityImpostor } from '../EntityImpostor';
import { changed, not } from '../filters';
import { Game } from '../Game';
import { logger } from '../logger';
import { makeSystem } from '../System';

const delta = 16 + 2 / 3;

describe('integration tests', () => {
  class OutputComponent extends Component {
    removablePresent = false;
  }

  class RemovableComponent extends Component {
    stepsSinceAdded = 0;
  }

  const stepsTillToggle = 3;

  const SetFlagEffect = makeEffect(
    [RemovableComponent, OutputComponent],
    (ent) => {
      logger.debug('Setting removablePresent: true');
      ent.get(OutputComponent).set({ removablePresent: true });

      return () => {
        logger.debug('Setting removablePresent: false');
        ent.get(OutputComponent).set({ removablePresent: false });
      };
    },
  );

  const ReAddRemovableEffect = makeEffect(
    [not(RemovableComponent)],
    (ent, game) => {
      logger.debug('Adding RemovableComponent');
      game.add(ent.id, RemovableComponent);
    },
  );

  const IncrementRemoveTimerSystem = makeSystem(
    [RemovableComponent],
    (query) => {
      let ent;
      for (ent of query) {
        const comp = ent.get(RemovableComponent);
        logger.debug('Incrementing stepsSinceAdded');
        comp.set({ stepsSinceAdded: comp.stepsSinceAdded + 1 });
      }
    },
  );

  const RemoveSystem = makeSystem(
    [changed(RemovableComponent)],
    (query, game) => {
      let ent;
      for (ent of query) {
        if (ent.get(RemovableComponent).stepsSinceAdded >= stepsTillToggle) {
          logger.debug('Removing RemovableComponent');
          game.remove(ent.id, RemovableComponent);
        }
      }
    },
  );

  it('adds and removes components, and queries for those operations', () => {
    const game = new Game({
      components: [OutputComponent, RemovableComponent],
      systems: [
        SetFlagEffect,
        ReAddRemovableEffect,
        IncrementRemoveTimerSystem,
        RemoveSystem,
      ],
    });

    const a = game.create();
    game.add(a, OutputComponent);

    logger.debug('Step 1');
    game.step(delta);

    let entity: EntityImpostor<OutputComponent> = game.get(a)!;

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
