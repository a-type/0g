import { ComponentInstanceFor } from '../components';
import { EntityImpostor } from '../EntityImpostor';
import { ObjectPool } from '../internal/objectPool';
import { State } from './State';
import { StateComponentDeps, StateTypeFor } from './types';

export class StatePool<T extends State<any>> {
  private pool: ObjectPool<T>;

  constructor(private Type: StateTypeFor<T>) {
    this.pool = new ObjectPool<T>(() => new this.Type());
  }

  async acquire(
    entity: EntityImpostor<ComponentInstanceFor<StateComponentDeps<T>[0]>>,
  ) {
    const instance = this.pool.acquire();
    await instance.initialize(entity);
    return instance;
  }

  release(instance: T) {
    this.pool.release(instance);
  }

  get StateType() {
    return this.Type;
  }
}
