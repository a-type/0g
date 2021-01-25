import { EventEmitter } from 'events';
import { ComponentInstanceFor, ComponentType } from './components';
import { Game } from './Game';
import { Poolable } from './internal/objectPool';
import { Archetype } from './Archetype';
import { EntityImpostor } from './EntityImpostor';

export type QueryDef = {
  all: ComponentType[];
  none?: ComponentType[];
};

type ComponentsFromQueryDef<Def extends QueryDef> = ComponentInstanceFor<
  Def['all'][0]
>;

type QueryDefForQuery<Q extends Query> = Q extends Query<infer Def>
  ? Def
  : never;

export type QueryIteratorFn<Q extends Query> = {
  (entity: EntityImpostor<ComponentsFromQueryDef<QueryDefForQuery<Q>>>): any;
};

type EntityImpostorFor<Q extends Query> = EntityImpostor<
  ComponentsFromQueryDef<QueryDefForQuery<Q>>
>;

export class Query<Def extends QueryDef = QueryDef>
  extends EventEmitter
  implements Poolable {
  public def: Def = { all: [] } as any;
  private archetypes = new Array<Archetype>();
  readonly removed = new Set<number>();

  __alive = false;

  constructor(private game: Game) {
    super();
    game.on('preApplyOperations', this.cleanup);
  }

  initialize(def: Def) {
    if (!def.all.length) {
      throw new Error('Query "all" is required');
    }

    this.def = def;

    Object.values(this.game.archetypeManager.archetypes).forEach(
      this.matchArchetype,
    );
    this.game.archetypeManager.on('archetypeCreated', this.matchArchetype);
  }

  private matchArchetype = (archetype: Archetype) => {
    if (
      archetype.hasAll(this.def.all) &&
      (!this.def.none || !archetype.hasSome(this.def.none))
    ) {
      this.archetypes.push(archetype);
      archetype.on('entityRemoved', this.handleEntityRemoved);
      archetype.on('entityAdded', this.handleEntityAdded);
    }
  };

  reset = () => {
    this.archetypes = [];
    this.def = { all: [] } as any;
    this.game.archetypeManager.off('archetypeCreated', this.matchArchetype);
  };

  // closure provides iterator properties
  private iterator = ((): Iterator<EntityImpostorFor<this>> => {
    const self = this;
    let archetypeIndex = 0;
    let archetypeIterator: Iterator<EntityImpostor<any>> | null = null;
    let result: IteratorResult<EntityImpostorFor<this>> = {
      done: true,
      value: null as any,
    };
    return {
      next() {
        while (archetypeIndex < self.archetypes.length) {
          if (!archetypeIterator) {
            archetypeIterator = self.archetypes[archetypeIndex][
              Symbol.iterator
            ]();
          }
          result = archetypeIterator.next();
          // result is assigned from the current archetype iterator result -
          // if the archetype is done, we move on to the next archetype until
          // we run out.
          if (result.done) {
            archetypeIndex++;
            archetypeIterator = null;
            continue;
          }
          return result;
        }

        result.done = true;
        archetypeIndex = 0;
        return result;
      },
    } as Iterator<EntityImpostorFor<this>>;
  })();

  [Symbol.iterator]() {
    return this.iterator;
  }

  private cleanup = () => {
    this.removed.clear();
  };

  private handleEntityAdded = (entityId: number) => {
    this.removed.delete(entityId);
  };

  private handleEntityRemoved = (entityId: number) => {
    this.removed.add(entityId);
  };

  toString() {
    return JSON.stringify(this.def);
  }
}
