import { Component } from '../components';
import { EntityImpostor } from '../EntityImpostor';
import { not } from '../filters';
import { Game } from '../Game';
import { logger } from '../logger';
import { System } from '../System';

const delta = 16 + 2 / 3;

describe('integration tests', () => {
  class OutputComponent extends Component {
    removablePresent = false;
  }

  class RemovableComponent extends Component {
    stepsSinceAdded = 0;
  }

  const stepsTillToggle = 3;

  class RemoveSyncSystem extends System {
    hasRemovable = this.trackingQuery([RemovableComponent, OutputComponent]);
    notHasRemovable = this.query([not(RemovableComponent), OutputComponent]);

    run = this.register(() => {
      for (const ent of this.notHasRemovable) {
        logger.debug('Adding RemovableComponent');
        this.game.add(ent.id, RemovableComponent);
      }

      for (const ent of this.hasRemovable) {
        logger.debug(`Iterating on ${ent.id}`);
        const output = ent.get(OutputComponent);
        const removable = ent.get(RemovableComponent);

        // set removablePresent flag
        if (this.hasRemovable.addedIds.includes(ent.id)) {
          logger.debug('Setting removablePresent flag');
          output.removablePresent = true;
        }

        // increment steps till toggle
        logger.debug('Incrementing stepsSinceAdded');
        removable.stepsSinceAdded++;

        // if expired, remove it
        if (removable.stepsSinceAdded >= stepsTillToggle) {
          logger.debug('Removing RemovableComponent');
          this.game.remove(ent.id, RemovableComponent);
        }
      }

      for (const entId of this.hasRemovable.removedIds) {
        logger.debug(`Removed: iterating on ${entId}`);
        const entity = this.game.get(entId);
        if (!entity) continue;

        // set flag
        const output = entity.get(OutputComponent);
        logger.debug('Clearing removablePresent flag');
        output.removablePresent = false;
      }
    });
  }

  it('adds and removes components, and queries for those operations', () => {
    const game = new Game({
      components: [OutputComponent, RemovableComponent],
      systems: [RemoveSyncSystem],
    });

    const a = game.create();
    game.add(a, OutputComponent);

    logger.debug('Step 1');
    game.step(delta);

    let entity: EntityImpostor<OutputComponent>;

    entity = game.get(a)!;

    expect(entity.maybeGet(OutputComponent)).not.toBe(null);
    expect(entity.get(OutputComponent).removablePresent).toBe(false);

    logger.debug('Step 2');
    game.step(delta);
    entity = game.get(a)!;

    expect(entity.get(OutputComponent).removablePresent).toBe(false);
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

    // hasn't been updated yet
    expect(entity.get(OutputComponent).removablePresent).toBe(true);
    expect(entity.maybeGet(RemovableComponent)).toBe(null);

    logger.debug('Step 6');
    game.step(delta);
    entity = game.get(a)!;

    expect(entity.get(OutputComponent).removablePresent).toBe(false);
    expect(entity.maybeGet(RemovableComponent)).not.toBe(null);
    expect(entity.maybeGet(RemovableComponent)!.stepsSinceAdded).toBe(0);
  });
});
