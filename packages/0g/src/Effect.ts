import { Game } from './Game';
import { QueryComponentFilter } from './Query';
import { EntityImpostorFor } from './QueryIterator';

type CleanupFn = () => void | Promise<void>;
type CleanupResult = Promise<CleanupFn | void> | CleanupFn | void;

export function makeEffect<Filter extends QueryComponentFilter>(
  filter: Filter,
  effect: (entity: EntityImpostorFor<Filter>, game: Game) => CleanupResult,
) {
  return function (game: Game) {
    const query = game.queryManager.create(filter);
    const cleanups = new Array<CleanupFn>();

    async function onEntityAdded(entityId: number) {
      const entity = game.get(entityId);
      if (!entity) {
        throw new Error(
          `Effect triggered for entity ${entityId}, but it was not found`,
        );
      }
      const result = effect(entity, game);
      if (result instanceof Promise) {
        cleanups[entityId] = () =>
          result.then((clean) => {
            clean && clean();
          });
      } else if (result) {
        cleanups[entityId] = result;
      } else {
        cleanups[entityId] = () => {};
      }
    }

    function onEntityRemoved(entityId: number) {
      cleanups[entityId]();
    }

    query.on('entityAdded', onEntityAdded);
    query.on('entityRemoved', onEntityRemoved);

    return () => {
      query.off('entityAdded', onEntityAdded);
      query.off('entityRemoved', onEntityRemoved);
    };
  };
}
