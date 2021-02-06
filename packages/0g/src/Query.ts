import { EventEmitter } from 'events';
import { ComponentType } from './components';
import { Game } from './Game';
import { Poolable } from './internal/objectPool';
import { Archetype } from './Archetype';
import { Filter, isFilter, has } from './filters';
import { EntityImpostorFor, QueryIterator } from './QueryIterator';

export type UserQueryDef = Array<Filter<ComponentType> | ComponentType>;

export interface QueryEvents {
  entityAdded(entityId: number): void;
  entityRemoved(entityId: number): void;
}

type ExtractQueryDef<Q extends Query> = Q extends Query<infer Def>
  ? Def
  : never;

export type QueryIteratorFn<Q extends Query> = {
  (ent: EntityImpostorFor<ExtractQueryDef<Q>>): void;
};

export declare interface Query {
  on<U extends keyof QueryEvents>(ev: U, cb: QueryEvents[U]): this;
  off<U extends keyof QueryEvents>(ev: U, cb: QueryEvents[U]): this;
  emit<U extends keyof QueryEvents>(
    ev: U,
    ...args: Parameters<QueryEvents[U]>
  ): boolean;
}

export class Query<Def extends UserQueryDef = UserQueryDef>
  extends EventEmitter
  implements Poolable {
  public def: Filter<ComponentType>[] = [];
  readonly archetypes = new Array<Archetype>();

  __alive = false;

  constructor(private game: Game) {
    super();
  }

  private processDef = (userDef: UserQueryDef) => {
    return userDef.map((fil) => (isFilter(fil) ? fil : has(fil)));
  };

  initialize(def: Def) {
    if (!def.length) {
      throw new Error('Query definition cannot be empty');
    }

    this.def = this.processDef(def);

    Object.values(this.game.archetypeManager.archetypes).forEach(
      this.matchArchetype,
    );
    this.game.archetypeManager.on('archetypeCreated', this.matchArchetype);
  }

  private matchArchetype = (archetype: Archetype) => {
    let match = true;
    for (const filter of this.def) {
      switch (filter.kind) {
        case 'has':
          match = archetype.includes(filter.Component);
          break;
        case 'not':
          match = archetype.omits(filter.Component);
          break;
      }
      if (!match) return;
    }

    this.archetypes.push(archetype);
    archetype.on('entityRemoved', this.handleEntityRemoved);
    archetype.on('entityAdded', this.handleEntityAdded);
  };

  reset = () => {
    this.archetypes.length = 0;
    this.def = { all: [] } as any;
    this.game.archetypeManager.off('archetypeCreated', this.matchArchetype);
  };

  // closure provides iterator properties
  private iterator = new QueryIterator<Def>(this);

  [Symbol.iterator]() {
    return this.iterator;
  }

  private handleEntityAdded = (entityId: number) => {
    this.emit('entityAdded', entityId);
  };

  private handleEntityRemoved = (entityId: number) => {
    this.emit('entityRemoved', entityId);
  };

  toString() {
    return JSON.stringify(this.def);
  }

  get archetypeIds() {
    return this.archetypes.map((a) => a.id);
  }
}
