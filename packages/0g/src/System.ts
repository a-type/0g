import { Game } from './Game';
import { QueryComponentFilter } from './Query';

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

  query<Def extends QueryComponentFilter>(queryDef: Def) {
    return this.game.queryManager.create<Def>(queryDef);
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
