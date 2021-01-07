import { Game } from './Game';
import { ObjectPool } from './internal/objectPool';
import { ComponentInstance } from './components';
import SparseMap from 'mnemonist/sparse-map';

export class ComponentPool<T extends ComponentInstance> {
  private pool = new ObjectPool<T>(() => new this.Type());
  private entityToComponentMap = new SparseMap<T>(
    this.game.constants.maxEntities,
  );

  constructor(private Type: { new (): T; id: number }, private game: Game) {}

  add(entityId: number, initial?: Partial<T>) {
    const instance = this.pool.acquire();
    if (initial) {
      Object.assign(instance, initial);
    }
    this.entityToComponentMap.set(entityId, instance);
  }

  remove(entityId: number) {
    const instance = this.entityToComponentMap.get(entityId);
    if (!instance) {
      throw new Error(`Entity ${entityId} does not have ${this.Type.name}`);
    }
    this.pool.release(instance);
    this.entityToComponentMap.delete(entityId);
  }

  get(entityId: number) {
    return this.entityToComponentMap.get(entityId);
  }

  has(entityId: number) {
    return this.entityToComponentMap.has(entityId);
  }

  forEach(callback: (value: T, entityId: number) => void) {
    this.entityToComponentMap.forEach(callback);
  }

  get size() {
    return this.entityToComponentMap.size;
  }

  get ComponentType() {
    return this.Type;
  }
}
