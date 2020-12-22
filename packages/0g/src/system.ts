import { Game } from './Game';
import { QueryDef, queryManager, Query, MapDefsToQueries } from './queries';

export type System<Queries extends Record<string, Query<any>>> = {
  name: string;
  queries: Queries;
  run(this: System<Queries>, game: Game): void;
  readonly queryList: Query<any>[];
};

export function system<Defs extends Record<string, QueryDef>>(
  name: string,
  queryDefs: Defs,
  run: (this: System<MapDefsToQueries<Defs>>, game: Game) => void,
): System<MapDefsToQueries<Defs>> {
  const queries = Object.fromEntries(
    Object.entries(queryDefs).map(([key, def]) => [
      key,
      queryManager.create(def),
    ]),
  ) as MapDefsToQueries<Defs>;

  const system = {
    name,
    queries,
    get queryList() {
      return Object.values(this.queries);
    },
    run,
  };

  system.run.bind(system);

  return system;
}
