import { ComponentPool } from './ComponentPool';
import { Component, ComponentInstanceFor, ComponentType } from './components';
import { Game } from './Game';

/**
 * Manages pools of Components based on their Type, and
 * the presence of Components assigned to Entities.
 */
export class ComponentManager {
  private pools = new Array<ComponentPool<Component>>();
  private changed = new Array<boolean>();

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

    // TODO: right time to do this?
    game.on('preApplyOperations', this.resetChanged);
  }

  acquire = (typeId: number, initialValues: any) => {
    const component = this.pools[typeId].acquire(initialValues);
    component.id = this.game.idManager.get();
    component.on('change', this.markChanged);
    return component;
  };

  release = (instance: Component) => {
    instance.off('change', this.markChanged);
    return this.pools[instance.type].release(instance);
  };

  wasChangedLastFrame = (componentInstanceId: number) => {
    return !!this.changed[componentInstanceId];
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

  private markChanged = (componentId: number) => {
    this.changed[componentId] = true;
  };

  private resetChanged = () => {
    this.changed.length = 0;
  };
}
