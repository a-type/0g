import { Game } from './Game';
import { ObjectPool } from './internal/objectPool';
import { ComponentInstance } from './components';
import { ComponentTypeFor } from './components/types';

export class ComponentPool<T extends ComponentInstance> {
  private pool: ObjectPool<T>;

  constructor(private Type: ComponentTypeFor<T>, private game: Game) {
    this.pool = new ObjectPool<T>(() => new this.Type());
  }

  acquire(initial?: Partial<T>) {
    const instance = this.pool.acquire();
    if (initial) {
      Object.assign(instance, initial);
    }
    return instance;
  }

  release(instance: T) {
    this.pool.release(instance);
  }

  get ComponentType() {
    return this.Type;
  }
}
