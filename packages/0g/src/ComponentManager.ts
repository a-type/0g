import { ComponentPool } from './ComponentPool';
import {
  ComponentInstance,
  ComponentInstanceFor,
  ComponentType,
} from './components';
import { Game } from './Game';

/**
 * Manages pools of Components based on their Type, and
 * the presence of Components assigned to Entities.
 */
export class ComponentManager {
  pools = new Array<ComponentPool<ComponentInstance>>();

  constructor(public componentTypes: ComponentType[], private game: Game) {
    // initialize pools, one for each ComponentType by ID. ComponentType IDs are incrementing integers.
    Object.values(componentTypes).forEach((Type) => {
      // assign an ID
      Type.id = game.idManager.get();
      // assign default values
      this.applyDefaultValues(Type);
      // create a pool
      this.pools[Type.id] = new ComponentPool<
        ComponentInstanceFor<typeof Type>
      >(Type, this.game);
    });
  }

  /**
   * Add a Component to an Entity, optionally providing some initial data.
   */
  add(
    entityId: number,
    componentId: number,
    initial?: Partial<ComponentInstance>,
  ) {
    this.pools[componentId].add(entityId, initial);
  }

  /**
   * Remove a single Component type from an Entity.
   */
  remove(entityId: number, componentId: number) {
    this.pools[componentId].remove(entityId);
  }

  /**
   * Removes all Components from an Entity. This is not the fastest thing
   * in the world.
   */
  removeAll(entityId: number) {
    this.pools.forEach((pool) => pool.remove(entityId));
  }

  /**
   * Gets a Component assigned to an Entity by Type
   */
  get(entityId: number, componentId: number) {
    return this.pools[componentId].get(entityId);
  }

  /**
   * Returns if an Entity has a Component by Type
   */
  has(entityId: number, componentId: number) {
    return this.pools[componentId].has(entityId);
  }

  /**
   * Determines the default values of a Component - the
   * ones present initially on a brand new instance
   */
  private applyDefaultValues(Type: ComponentType) {
    const builtins = Type.builtinKeys;
    const instance = new Type();
    Type.defaultValues = Object.entries(instance).reduce(
      (acc, [key, value]) => {
        if (!builtins.includes(key)) {
          acc[key] = value;
        }
        return acc;
      },
      {} as any,
    );
  }
}
