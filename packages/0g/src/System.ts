import { Game } from './Game';
import { QueryComponentFilter } from './Query';
import { EntityImpostorFor } from './QueryIterator';

export function makeSystem<Filter extends QueryComponentFilter>(
  filter: Filter,
  run: (entity: EntityImpostorFor<Filter>, game: Game) => void,
  phase: 'step' | 'preStep' | 'postStep' = 'step',
) {
  return function (game: Game) {
    const query = game.queryManager.create(filter);

    function onPhase() {
      let ent;
      for (ent of query) {
        run(ent, game);
      }
    }

    game.on(phase, onPhase);

    return () => {
      game.off(phase, onPhase);
    };
  };
}
