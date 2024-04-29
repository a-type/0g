import { Game } from './Game.js';
import { QueryComponentFilter } from './Query.js';
import { EntityImpostorFor } from './QueryIterator.js';

export function makeEffect<Filter extends QueryComponentFilter>(
  filter: Filter,
  effect: (
    entity: EntityImpostorFor<Filter>,
    game: Game,
    abortSignal: AbortSignal,
  ) => Generator<any> | void,
  cleanup?: (
    entity: EntityImpostorFor<Filter>,
    game: Game,
  ) => Generator<any> | void,
) {
  return function (game: Game) {
    const query = game.queryManager.create(filter);
    const abortControllers = new Array<AbortController>();

    async function onEntityAdded(entityId: number) {
      const entity = game.get(entityId);
      if (!entity) {
        throw new Error(
          `Effect triggered for entity ${entityId}, but it was not found`,
        );
      }
      const abortController = new AbortController();
      abortControllers[entityId] = abortController;
      const result = effect(entity, game, abortController.signal);
      if (result) {
        await pullCancelable(result, abortController.signal);
      }
    }

    async function onEntityRemoved(entityId: number) {
      abortControllers[entityId]?.abort();
      const entity = game.get(entityId);
      if (!entity) {
        throw new Error(
          `Effect cleanup triggered for entity ${entityId}, but it was not found`,
        );
      }
      const result = cleanup!(entity, game);
      if (result) {
        await pull(result);
      }
    }

    query.on('entityAdded', onEntityAdded);
    if (cleanup) {
      query.on('entityRemoved', onEntityRemoved);
    }

    return () => {
      query.off('entityAdded', onEntityAdded);
      if (cleanup) {
        query.off('entityRemoved', onEntityRemoved);
      }
    };
  };
}

async function pull(generator: Generator<any>, input?: any) {
  const { done, value } = generator.next(input);
  let nextInput = value instanceof Promise ? await value : value;
  if (!done) {
    await pull(generator, nextInput);
  }
}

async function pullCancelable(
  generator: Generator<any>,
  abortSignal: AbortSignal,
  input?: any,
) {
  if (abortSignal.aborted) return;

  const { done, value } = generator.next(input);
  let nextInput = value instanceof Promise ? await value : value;
  if (!done) {
    await pullCancelable(generator, abortSignal, nextInput);
  }
}
