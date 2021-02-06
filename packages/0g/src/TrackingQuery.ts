import { Game } from './Game';
import { Query, UserQueryDef, QueryEvents } from './Query';

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

  constructor(game: Game) {
    super(game);
    this.on('entityAdded', this.addToList);
    this.on('entityRemoved', this.removeFromList);
    // when do we reset the frame-specific tracking?
    // right before we populate new values from this frame's operations.
    game.on('preApplyOperations', this.resetStepTracking);
    // after we apply operations and register all changes for the frame,
    // we determine whether to emit a change event
    game.on('stepComplete', this.determineChangeState);
  }

  get entities() {
    return this.trackedEntities as readonly number[];
  }

  get added() {
    return this.addedThisFrame as readonly number[];
  }

  get removed() {
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

  private determineChangeState = () => {
    if (this.changesThisFrame) {
      this.emit('change');
    }
  };
}
