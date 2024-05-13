import { Game } from './Game.js';
import { QueryComponentFilter } from './Query.js';
import { EntityImpostorFor } from './QueryIterator.js';

export const allSystems = new Array<(game: Game) => void | (() => void)>();

export function system<Filter extends QueryComponentFilter>(
  filter: Filter,
  run: (entity: EntityImpostorFor<Filter>, game: Game) => void,
  phase: 'step' | 'preStep' | 'postStep' = 'step',
) {
  function sys(game: Game) {
    const query = game.queryManager.create(filter);

    function onPhase() {
      let ent;
      for (ent of query) {
        run(ent, game);
      }
    }

    return game.subscribe(phase, onPhase);
  }

  allSystems.push(sys);
  return sys;
}
/** @deprecated - use system */
export const makeSystem = system;
