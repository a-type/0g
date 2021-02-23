import { Game } from './Game';
import { ObjectPool } from './internal/objectPool';
import { GenericComponent, ComponentType } from './components';

export class ComponentPool<S> {
  private pool: ObjectPool<GenericComponent<S>>;

  constructor(private Type: ComponentType<S>, private game: Game) {
    this.pool = new ObjectPool<GenericComponent<S>>(() => new this.Type());
  }

  acquire(initial: Partial<S> = {}, id: number) {
    const instance = this.pool.acquire();
    this.Type.initialize(instance, initial, id);
    return instance;
  }

  release(instance: GenericComponent<S>) {
    this.pool.release(instance);
  }

  get ComponentType() {
    return this.Type;
  }
}
