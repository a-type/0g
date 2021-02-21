import { Game } from './Game';
import { Query, QueryComponentFilter } from './Query';

export function makeSystem<Filter extends QueryComponentFilter>(
  filter: Filter,
  run: (query: Query<Filter>, game: Game) => void,
  phase: 'step' | 'preStep' | 'postStep' = 'step',
) {
  return function (game: Game) {
    const query = game.queryManager.create(filter);

    function onPhase() {
      run(query, game);
    }

    game.on(phase, onPhase);

    return () => {
      game.off(phase, onPhase);
    };
  };
}
