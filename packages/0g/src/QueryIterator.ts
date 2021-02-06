import { ComponentInstanceFor, ComponentType } from './components';
import { EntityImpostor } from './EntityImpostor';
import { Filter } from './filters';
import { Query, UserQueryDef } from './Query';

type ComponentsFromQueryDef<Def extends UserQueryDef> = {
  [K in keyof Def]: Def[K] extends Filter<infer C>
    ? ComponentInstanceFor<C>
    : Def[K] extends ComponentType
    ? ComponentInstanceFor<Def[K]>
    : never;
}[0];

export type EntityImpostorFor<Q extends UserQueryDef> = EntityImpostor<
  ComponentsFromQueryDef<Q>
>;

export class QueryIterator<Def extends UserQueryDef>
  implements Iterator<EntityImpostorFor<Def>> {
  private archetypeIndex = 0;
  private archetypeIterator: Iterator<EntityImpostor<any>> | null = null;
  private result: IteratorResult<EntityImpostorFor<Def>> = {
    done: true,
    value: null as any,
  };

  constructor(private query: Query<Def>) {}

  next() {
    while (this.archetypeIndex < this.query.archetypes.length) {
      if (!this.archetypeIterator) {
        this.archetypeIterator = this.query.archetypes[this.archetypeIndex][
          Symbol.iterator
        ]();
      }
      this.result = this.archetypeIterator.next();
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
