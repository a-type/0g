import { ComponentInstanceFor, ComponentType } from './components';
import { EntityImpostor } from './EntityImpostor';
import { Changed, Filter } from './filters';
import { Game } from './Game';
import { Query, QueryComponentFilter } from './Query';
import { ComponentA, ComponentB } from './__tests__/componentFixtures';

type ComponentsFromQueryDef<Def extends QueryComponentFilter> = {
  [K in keyof Def]: Def[K] extends Filter<infer C>
    ? ComponentInstanceFor<C>
    : Def[K] extends ComponentType<any>
    ? ComponentInstanceFor<Def[K]>
    : never;
}[0];

export type EntityImpostorFor<Q extends QueryComponentFilter> = EntityImpostor<
  ComponentsFromQueryDef<Q>
>;

export class QueryIterator<Def extends QueryComponentFilter>
  implements Iterator<EntityImpostorFor<Def>> {
  private archetypeIndex = 0;
  private archetypeIterator: Iterator<EntityImpostor<any>> | null = null;
  private result: IteratorResult<EntityImpostorFor<Def>> = {
    done: true,
    value: null as any,
  };
  private changedFilters: Changed<any>[];

  constructor(private query: Query<Def>, private game: Game) {
    this.changedFilters = query.filter.filter(
      (f) => f.kind === 'changed',
    ) as Changed<any>[];
  }

  private checkChangeFilter() {
    if (this.changedFilters.length === 0) return true;
    return this.changedFilters.some((filter) => {
      this.game.componentManager.wasChangedLastFrame(
        this.result.value.get(filter.Component.prototype.constructor).id,
      );
    });
  }

  next() {
    while (this.archetypeIndex < this.query.archetypes.length) {
      if (!this.archetypeIterator) {
        this.archetypeIterator = this.query.archetypes[this.archetypeIndex][
          Symbol.iterator
        ]();
      }
      this.result = this.archetypeIterator.next();

      // if changed() filter(s) are present, ensure a change has
      // occurred in the specified components
      if (!this.checkChangeFilter()) {
        continue;
      }

      // result is assigned from the current archetype iterator result -
      // if the archetype is done, we move on to the next archetype until
      // we run out
      if (this.result.done) {
        this.archetypeIndex++;
        this.archetypeIterator = null;
        continue;
      }
      return this.result;
    }

    this.result.done = true;
    this.archetypeIndex = 0;
    return this.result;
  }
}
