import { ComponentPool } from './ComponentPool';
import { Component, ComponentInstanceFor, ComponentType } from './components';
import { Game } from './Game';

/**
 * Manages pools of Components based on their Type, and
 * the presence of Components assigned to Entities.
 */
export class ComponentManager {
  pools = new Array<ComponentPool<Component>>();

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

  acquire = (typeId: number, initialValues: any) => {
    return this.pools[typeId].acquire(initialValues);
  };

  release = (instance: Component) => {
    return this.pools[instance.type].release(instance);
  };

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
