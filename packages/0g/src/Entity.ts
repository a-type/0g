import { Poolable } from './internal/objectPool';
import { Query } from './Query';
import {
  ComponentType,
  ComponentInstance,
  ComponentInstanceFor,
} from './components';
import { Game } from './Game';

/**
 * An "Entity" is really an ID number, but
 * this class helps facilitate more OOP-style
 * operations which deal with the data associated
 * with any Entity.
 */
export class Entity implements Poolable {
  __queries = new Set<Query<any>>();
  __componentTypes: ComponentType[] = [];
  __alive = true;

  id: number = 0;

  constructor(private __game: Game) {}

  init(id: number, specs: ComponentType[]) {
    this.__componentTypes = specs;
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
    const val = this.__game.componentManager.get(
      this.id,
      spec.id,
    ) as ComponentInstanceFor<Spec>;
    return val || null;
  }

  add<Spec extends ComponentType>(
    spec: Spec,
    initial?: Partial<ComponentInstanceFor<Spec>>,
  ) {
    this.__game.componentManager.add(this.id, spec.id, initial);
    this.__componentTypes.push(spec);
    return this;
  }

  remove(spec: ComponentType) {
    this.__game.componentManager.remove(this.id, spec.id);
    this.__componentTypes.splice(this.__componentTypes.indexOf(spec));
    return this;
  }

  reset() {
    this.__game.componentManager.removeAll(this.id);
    this.__componentTypes = [];
    this.__queries = new Set();
  }

  get specs() {
    return {
      queries: Array.from(this.__queries.values()).map((q) => q.key),
      stores: this.__componentTypes.map((spec) => spec.name),
    };
  }
}
