import { Game } from './Game.js';
import { QueryComponentFilter } from './Query.js';
import { EntityImpostorFor } from './QueryIterator.js';

export const allSystems = new Array<(game: Game) => void | (() => void)>();

type SystemRunner<Filter extends QueryComponentFilter, Result> = (
  entity: EntityImpostorFor<Filter>,
  game: Game,
  previousResult: Result,
) => Result;

export function system<Filter extends QueryComponentFilter, Result = void>(
  filter: Filter,
  run: SystemRunner<Filter, Result>,
  {
    phase = 'step',
    initialResult = undefined,
  }: {
    // TS trick to show the default value in the signature
    // but still allow any string
    phase?: 'step' | 'preStep' | 'postStep' | (string & {});
    initialResult?: Result;
  } = {},
) {
  function sys(game: Game) {
    const query = game.queryManager.create(filter);
    let result: Result;
    const entityResults = new WeakMap<EntityImpostorFor<Filter>, Result>();

    function onPhase() {
      let ent;
      for (ent of query) {
        result = run(ent, game, entityResults.get(ent) ?? initialResult!);
        entityResults.set(ent, result);
      }
    }

    return game.subscribe(`phase:${phase}`, onPhase);
  }

  allSystems.push(sys);
  return sys;
}
/** @deprecated - use system */
export const makeSystem = system;
