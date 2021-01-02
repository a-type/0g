import { Entity } from './entity';
import { Game } from './Game';
import { Query, QueryDef } from './queries';
import { Store } from './stores';

export class FrameHandle {
  constructor(private handle: () => any, private game: Game) {
    this.attach();
  }
  attach() {
    this.game.on('step', this.handle);
  }
  detach() {
    this.game.off('step', this.handle);
  }
}

export class System {
  constructor(protected game: Game) {}

  query(queryDef: QueryDef) {
    return this.game.queries.create(queryDef);
  }

  frame(query: Query, run: (entity: Entity) => void) {
    return new FrameHandle(() => {
      query.entities.forEach(run);
    }, this.game);
  }

  watch(query: Query, stores: Store[], run: (entity: Entity) => void) {
    const versionCache = new WeakMap<Entity, string>();
    return new FrameHandle(() => {
      // TODO: consider implications of object pooling on weakmap usage - it
      // probably makes them irrelevant, but possibly also incorrect?
      // TODO: optimize this use case within Query
      query.entities.forEach((entity) => {
        const currentVersions = stores
          .map((s) => entity.get(s).__version)
          .join(',');
        if (currentVersions !== versionCache.get(entity)) {
          versionCache.set(entity, currentVersions);
          run(entity);
        }
      });
    }, this.game);
  }
}

export type SystemSpec = { new (game: Game): System };
