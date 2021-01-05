import { Poolable } from './internal/objectPool';
import { Query } from './Query';
import {
  ComponentType,
  ComponentInstance,
  ComponentInstanceFor,
} from './components';
import { Game } from './Game';

export class Entity implements Poolable {
  __data = new Map<ComponentType, ComponentInstance>();
  __queries = new Set<Query<any>>();
  __game: Game = null as any;
  __stores: ComponentType[] = [];
  __alive = true;

  id: string = 'unallocated';

  init(id: string, specs: ComponentType[]) {
    this.__stores = specs;
    this.id = id;
    specs.forEach((spec) => {
      this.add(spec);
    });
  }

  /**
   * Gets a Store instance of the provided type from the entity,
   * throwing if that store does not exist. The returned value is
   * readonly! Use the .set method to modify properties, or use
   * .getWritable instead if you want to assign directly. Use
   * .maybeGet if you're ok with a null value instead of throwing
   * for nonexistent stores.
   */
  get<Spec extends ComponentType>(spec: Spec) {
    const val = this.maybeGet(spec);
    if (!val) {
      throw new Error(`${spec.name} not present on entity ${this.id}`);
    }
    return val;
  }

  maybeGet<Spec extends ComponentType>(spec: Spec) {
    const val = this.getOrNull(spec);
    if (!val) return null;
    return val as Readonly<ComponentInstanceFor<Spec>>;
  }

  /**
   * Gets a Store of the given type from the entity which is
   * directly writable. If this getter is used, it is assumed that
   * the store will be modified, and any watchers will be updated next frame.
   * This getter throws if the store is not present. Use .maybeGetWritable
   * instead if you would rather get a null value.
   */
  getWritable<Spec extends ComponentType>(spec: Spec) {
    const val = this.maybeGetWritable(spec);
    if (!val) {
      throw new Error(`${spec.name} not present on entity ${this.id}`);
    }
    return val;
  }

  maybeGetWritable<Spec extends ComponentType>(spec: Spec) {
    const val = this.getOrNull(spec);
    if (!val) return null;
    // mark the store preemptively as written to
    val.mark();
    return val;
  }

  private getOrNull<Spec extends ComponentType>(
    spec: Spec,
  ): ComponentInstanceFor<Spec> | null {
    const val = this.__data.get(spec) as ComponentInstanceFor<Spec>;
    return val || null;
  }

  add<Spec extends ComponentType>(
    spec: Spec,
    initial?: Partial<ComponentInstanceFor<Spec>>,
  ) {
    this.__game.entities.addStoreToEntity(this, spec, initial);
    this.__stores.push(spec);
    return this;
  }

  remove(spec: ComponentType) {
    this.__game.entities.removeStoreFromEntity(this, spec);
    return this;
  }

  reset() {
    this.__data.forEach((data, spec) => {
      this.__game.stores.release(data);
    });
    this.__data.clear();
    this.__stores = [];
    this.__queries = new Set();
  }

  get specs() {
    return {
      queries: Array.from(this.__queries.values()).map((q) => q.key),
      stores: this.__stores.map((spec) => spec.name),
    };
  }
}
