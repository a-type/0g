import { Game } from './Game';
import { Query, QueryDef, QueryIteratorFn } from './Query';

export class FrameHandle {
  active = true;
  constructor(private handle: () => any) {}

  run() {
    this.handle();
  }
}

export class System {
  private handles: Record<string, FrameHandle[]> = {};
  constructor(protected game: Game) {}

  query(queryDef: QueryDef) {
    return this.game.queryManager.create(queryDef);
  }

  register(
    handler: () => any,
    event: 'preStep' | 'postStep' | 'step' = 'step',
  ) {
    const handle = new FrameHandle(handler);
    this.handles[event] = this.handles[event] ?? [];
    this.handles[event].push(handle);
    return handle;
  }

  __gamePerformPhase(event: 'preStep' | 'postStep' | 'step') {
    this.handles[event]?.forEach((handle) => {
      if (handle.active) {
        handle.run();
      }
    });
  }
}

export type SystemSpec = { new (game: Game): System };
