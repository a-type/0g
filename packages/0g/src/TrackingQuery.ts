import { Game } from './Game';
import { Query, UserQueryDef, QueryEvents } from './Query';
import { EntityImpostorFor } from './QueryIterator';

interface TrackingQueryEvents extends QueryEvents {
  change(): void;
}
export declare interface TrackingQuery {
  on<U extends keyof TrackingQueryEvents>(
    ev: U,
    cb: TrackingQueryEvents[U],
  ): this;
  off<U extends keyof TrackingQueryEvents>(
    ev: U,
    cb: TrackingQueryEvents[U],
  ): this;
  emit<U extends keyof TrackingQueryEvents>(
    ev: U,
    ...args: Parameters<TrackingQueryEvents[U]>
  ): boolean;
}
export class TrackingQuery<
  Def extends UserQueryDef = UserQueryDef
> extends Query<Def> {
  private trackedEntities: number[] = [];
  private addedThisFrame: number[] = [];
  private removedThisFrame: number[] = [];
  private changesThisFrame = 0;
  private addedIterable: {
    [Symbol.iterator]: () => AddedIterator<Def>;
  };
  private readiness: boolean[] = [];

  constructor(game: Game) {
    super(game);
    this.addedIterable = {
      [Symbol.iterator]: () => new AddedIterator(game, this),
    };
    this.on('entityAdded', this.addToList);
    this.on('entityRemoved', this.removeFromList);
    // when do we reset the frame-specific tracking?
    // right before we populate new values from this frame's operations.
    game.on('preApplyOperations', this.resetStepTracking);
    // after we apply operations and register all changes for the frame,
    // we do processing of final add/remove list
    game.on('stepComplete', this.processAddRemove);
  }

  get entities() {
    return this.trackedEntities as readonly number[];
  }

  get addedIds() {
    return this.addedThisFrame as readonly number[];
  }

  get added() {
    return this.addedIterable;
  }

  get removedIds() {
    return this.removedThisFrame as readonly number[];
  }

  initialize(def: Def) {
    super.initialize(def);
    // reset all tracking arrays
    this.trackedEntities.length = 0;
    this.addedThisFrame.length = 0;
    this.removedThisFrame.length = 0;
    this.changesThisFrame = 0;
    // bootstrap entities list -
    // TODO: optimize?
    for (const ent of this) {
      this.trackedEntities.push(ent.id);
      this.addedThisFrame.push(ent.id);
    }
    if (this.trackedEntities.length) {
      this.emit('change');
    }
  }

  /**
   * Add an async function which is called with an Entity as it
   * is added to the query, and returns a cleanup callback to call when
   * the Entity is removed.
   */
  process = (
    processor: (ent: EntityImpostorFor<Def>) => Promise<() => void>,
  ) => {};

  private addToList = (entityId: number) => {
    this.trackedEntities.push(entityId);
    const removedIndex = this.removedThisFrame.indexOf(entityId);
    if (removedIndex !== -1) {
      // this was a transfer (removes happen first)
      this.removedThisFrame.splice(removedIndex, 1);
      this.changesThisFrame--;
    } else {
      // only non-transfers count as adds
      this.addedThisFrame.push(entityId);
      this.changesThisFrame++;
      this.readiness;
    }
  };

  private removeFromList = (entityId: number) => {
    const index = this.trackedEntities.indexOf(entityId);
    if (index === -1) return;

    this.trackedEntities.splice(index, 1);
    this.removedThisFrame.push(entityId);
    this.changesThisFrame++;
  };

  private resetStepTracking = () => {
    this.addedThisFrame.length = 0;
    this.removedThisFrame.length = 0;
    this.changesThisFrame = 0;
  };

  private processAddRemove = () => {
    if (this.changesThisFrame) {
      this.emit('change');
      // TODO: iterate add list, get EntityImpostors, run process
    }
  };
}

class AddedIterator<Def extends UserQueryDef>
  implements Iterator<EntityImpostorFor<Def>> {
  private index = 0;
  private result: IteratorResult<EntityImpostorFor<Def>> = {
    done: true,
    value: null as any,
  };
  constructor(private game: Game, private query: TrackingQuery) {}

  next() {
    if (this.index >= this.query.addedIds.length) {
      this.result.done = true;
      return this.result;
    }
    this.result.done = false;
    this.result.value = this.game.get(this.query.addedIds[this.index]);
    return this.result;
  }
}
