import { EventEmitter } from 'events';
import { ComponentType } from './Component';
import { Game } from './Game';
import { Poolable } from './internal/objectPool';
import { Archetype } from './Archetype';
import { Filter, isFilter, has } from './filters';
import { EntityImpostorFor, QueryIterator } from './QueryIterator';
import { logger } from './logger';
import { Entity } from './Entity';

export type QueryComponentFilter = Array<
  Filter<ComponentType<any>> | ComponentType<any>
>;

export interface QueryEvents {
  entityAdded(entityId: number): void;
  entityRemoved(entityId: number): void;
}

type ExtractQueryDef<Q extends Query<any>> = Q extends Query<infer Def>
  ? Def
  : never;

export type QueryIteratorFn<Q extends Query<any>, Returns = void> = {
  (ent: EntityImpostorFor<ExtractQueryDef<Q>>): Returns;
};

export declare interface Query<FilterDef extends QueryComponentFilter> {
  on<U extends keyof QueryEvents>(ev: U, cb: QueryEvents[U]): this;
  off<U extends keyof QueryEvents>(ev: U, cb: QueryEvents[U]): this;
  emit<U extends keyof QueryEvents>(
    ev: U,
    ...args: Parameters<QueryEvents[U]>
  ): boolean;
}

export class Query<FilterDef extends QueryComponentFilter>
  extends EventEmitter
  implements Poolable {
  public filter: Filter<ComponentType<any>>[] = [];
  readonly archetypes = new Array<Archetype>();
  private trackedEntities: number[] = [];
  private addedThisFrame: number[] = [];
  private removedThisFrame: number[] = [];
  private changesThisFrame = 0;
  private addedIterable: {
    [Symbol.iterator]: () => AddedIterator<FilterDef>;
  };

  constructor(private game: Game) {
    super();
    this.addedIterable = {
      [Symbol.iterator]: () => new AddedIterator<FilterDef>(game, this),
    };
    // when do we reset the frame-specific tracking?
    // right before we populate new values from this frame's operations.
    game.on('preApplyOperations', this.resetStepTracking);
    // after we apply operations and register all changes for the frame,
    // we do processing of final add/remove list
    game.on('stepComplete', this.processAddRemove);
  }

  private processDef = (userDef: QueryComponentFilter) => {
    return userDef.map((fil) => (isFilter(fil) ? fil : has(fil)));
  };

  initialize(def: FilterDef) {
    logger.debug(`Initializing Query ${this.toString()}`);
    this.filter = this.processDef(def);

    Object.values(this.game.archetypeManager.archetypes).forEach(
      this.matchArchetype,
    );
    this.game.archetypeManager.on('archetypeCreated', this.matchArchetype);

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
      this.emitAdded(ent.id);
    }
  }

  private matchArchetype = (archetype: Archetype) => {
    let match = true;
    for (const filter of this.filter) {
      switch (filter.kind) {
        case 'has':
          match = archetype.includes(filter.Component);
          break;
        case 'not':
          match = archetype.omits(filter.Component);
          break;
        case 'changed':
          match = archetype.includes(filter.Component);
          break;
      }
      if (!match) return;
    }

    this.archetypes.push(archetype);
    logger.debug(`Query ${this.toString()} added Archetype ${archetype.id}`);
    archetype.on('entityRemoved', this.handleEntityRemoved);
    archetype.on('entityAdded', this.handleEntityAdded);
  };

  reset = () => {
    this.archetypes.length = 0;
    this.filter = [];
    this.game.archetypeManager.off('archetypeCreated', this.matchArchetype);
  };

  // closure provides iterator properties
  private iterator = new QueryIterator<FilterDef>(this, this.game);

  [Symbol.iterator]() {
    return this.iterator;
  }

  private handleEntityAdded = (entity: Entity) => {
    logger.debug(`Entity ${entity.id} added to query ${this.toString()}`);
    this.addToList(entity.id);
  };

  private handleEntityRemoved = (entityId: number) => {
    this.removeFromList(entityId);
  };

  toString() {
    return this.filter
      .map((filterItem) => {
        if (isFilter(filterItem)) {
          return filterItem.toString();
        }
        return (filterItem as any).name;
      })
      .join(',');
  }

  get archetypeIds() {
    return this.archetypes.map((a) => a.id);
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

  private processAddRemove = () => {
    if (this.changesThisFrame) {
      this.addedThisFrame.forEach(this.emitAdded);
      this.removedThisFrame.forEach(this.emitRemoved);
    }
  };

  private emitAdded = (entityId: number) => {
    this.emit('entityAdded', entityId);
  };

  private emitRemoved = (entityId: number) => {
    this.emit('entityRemoved', entityId);
  };
}

class AddedIterator<Def extends QueryComponentFilter>
  implements Iterator<EntityImpostorFor<Def>> {
  private index = 0;
  private result: IteratorResult<EntityImpostorFor<Def>> = {
    done: true,
    value: null as any,
  };
  constructor(private game: Game, private query: Query<any>) {}

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
