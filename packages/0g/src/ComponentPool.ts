import { Game } from './Game.js';
import { ObjectPool } from './internal/objectPool.js';
import { ComponentInstance, ComponentType } from './Component.js';

export class ComponentPool<S> {
  private pool: ObjectPool<ComponentInstance<S>>;

  constructor(
    private Type: ComponentType<S>,
    private game: Game,
  ) {
    this.pool = new ObjectPool<ComponentInstance<S>>(() => new this.Type());
  }

  acquire(initial: Partial<S> = {}, id: number) {
    const instance = this.pool.acquire();
    this.Type.initialize(instance, initial, id);
    return instance;
  }

  release(instance: ComponentInstance<S>) {
    this.pool.release(instance);
  }

  get ComponentType() {
    return this.Type;
  }
}
