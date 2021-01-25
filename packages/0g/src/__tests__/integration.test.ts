import { time } from 'console';
import { Component } from '../components';
import { EntityImpostor } from '../EntityImpostor';
import { Game } from '../Game';
import { System } from '../System';

describe('integration tests', () => {
  class OutputComponent extends Component {
    removablePresent = false;
  }

  class RemovableComponent extends Component {
    stepsSinceAdded = 0;
  }

  const stepsTillToggle = 3;

  class RemoveSyncSystem extends System {
    hasRemovable = this.query({
      all: [RemovableComponent],
    });
    notHasRemovable = this.query({
      none: [RemovableComponent],
      all: [OutputComponent],
    });

    run = this.register(() => {
      for (const ent of this.notHasRemovable) {
        console.log('Adding RemovableComponent');
        this.game.add(ent.id, RemovableComponent);
      }

      for (const ent of this.hasRemovable) {
        console.log(`Iterating on ${ent.id}`);
        const output = ent.get(OutputComponent);
        const removable = ent.get(RemovableComponent);

        // set removablePresent flag
        if (ent.added) {
          console.log('Setting removablePresent flag');
          output.removablePresent = true;
        }

        // increment steps till toggle
        console.log('Incrementing stepsSinceAdded');
        removable.stepsSinceAdded++;

        // if expired, remove it
        if (removable.stepsSinceAdded >= stepsTillToggle) {
          console.log('Removing RemovableComponent');
          this.game.remove(ent.id, RemovableComponent);
        }
      }

      for (const entId of this.hasRemovable.removed) {
        console.log(`Removed: iterating on ${entId}`);
        const entity = this.game.get(entId);
        if (!entity) continue;

        // set flag
        const output = entity.get(OutputComponent);
        console.log('Clearing removablePresent flag');
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

    const timestamp = 16 + 2 / 3;
    console.log('Step 1');
    game.step(timestamp);

    let entity: EntityImpostor<OutputComponent>;

    entity = game.get(a)!;

    expect(entity.maybeGet(OutputComponent)).not.toBe(null);
    expect(entity.get(OutputComponent).removablePresent).toBe(false);

    console.log('Step 2');
    game.step(timestamp);
    entity = game.get(a)!;

    expect(entity.get(OutputComponent).removablePresent).toBe(false);
    expect(entity.maybeGet(RemovableComponent)).not.toBe(null);
    expect(entity.maybeGet(RemovableComponent)!.stepsSinceAdded).toBe(0);

    console.log('Step 3');
    game.step(timestamp);
    entity = game.get(a)!;

    expect(entity.get(OutputComponent).removablePresent).toBe(true);
    expect(entity.maybeGet(RemovableComponent)).not.toBe(null);
    expect(entity.maybeGet(RemovableComponent)!.stepsSinceAdded).toBe(1);

    console.log('Step 4');
    game.step(timestamp);
    entity = game.get(a)!;

    expect(entity.get(OutputComponent).removablePresent).toBe(true);
    expect(entity.maybeGet(RemovableComponent)).not.toBe(null);
    expect(entity.maybeGet(RemovableComponent)!.stepsSinceAdded).toBe(2);

    console.log('Step 5');
    game.step(timestamp);
    entity = game.get(a)!;

    // hasn't been updated yet
    expect(entity.get(OutputComponent).removablePresent).toBe(true);
    expect(entity.maybeGet(RemovableComponent)).toBe(null);

    console.log('Step 6');
    game.step(timestamp);
    entity = game.get(a)!;

    expect(entity.get(OutputComponent).removablePresent).toBe(false);
    expect(entity.maybeGet(RemovableComponent)).not.toBe(null);
    expect(entity.maybeGet(RemovableComponent)!.stepsSinceAdded).toBe(0);
  });
});
