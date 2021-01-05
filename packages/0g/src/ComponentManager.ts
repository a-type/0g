import { Game } from './Game';
import { ObjectPool } from './internal/objectPool';
import { ComponentInstance, ComponentType } from './components';

export class ComponentManager {
  private poolMap = new Map<ComponentType, ObjectPool<ComponentInstance>>();

  constructor(private game: Game) {}

  acquire<S extends ComponentType>(ComponentSpec: S) {
    let pool = this.poolMap.get(ComponentSpec);
    if (!pool) {
      pool = new ObjectPool<ComponentInstance>(() => new ComponentSpec());
      this.poolMap.set(ComponentSpec, pool);
    }
    return pool.acquire();
  }

  release(component: ComponentInstance) {
    const Spec = Object.getPrototypeOf(component).constructor;
    const pool = this.poolMap.get(Spec);
    if (!pool) {
      throw new Error(`Failed to release Component, unknown kind ${Spec.name}`);
    }
    pool.release(component);
  }
}
