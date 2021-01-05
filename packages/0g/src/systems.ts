import { Entity } from './entity';
import { Game } from './Game';
import { Query, QueryDef } from './queries';
import { ComponentType } from './components';

export class FrameHandle {
  constructor(
    private handle: () => any,
    private game: Game,
    private event: 'step' | 'postStep' | 'preStep' = 'step',
  ) {
    this.attach();
  }
  attach() {
    this.game.on(this.event as any, this.handle);
  }
  detach() {
    this.game.off(this.event as any, this.handle);
  }
}

export class System {
  constructor(protected game: Game) {}

  query(queryDef: QueryDef) {
    return this.game.queries.create(queryDef);
  }

  step(query: Query, run: (entity: Entity) => void) {
    return new FrameHandle(() => {
      query.entities.forEach(run);
    }, this.game);
  }

  watch(query: Query, stores: ComponentType[], run: (entity: Entity) => void) {
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

  postStep(query: Query, run: (entity: Entity) => void) {
    return new FrameHandle(
      () => {
        query.entities.forEach(run);
      },
      this.game,
      'postStep',
    );
  }

  preStep(query: Query, run: (entity: Entity) => void) {
    return new FrameHandle(
      () => {
        query.entities.forEach(run);
      },
      this.game,
      'preStep',
    );
  }
}

export type SystemSpec = { new (game: Game): System };
