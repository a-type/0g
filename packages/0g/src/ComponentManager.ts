import { ComponentPool } from './ComponentPool';
import {
  ComponentType,
  COMPONENT_CHANGE_HANDLE,
  ComponentInstance,
} from './Component';
import { Game } from './Game';

/**
 * Manages pools of Components based on their Type, and
 * the presence of Components assigned to Entities.
 */
export class ComponentManager {
  private pools = new Array<ComponentPool<any>>();
  private changed = new Array<boolean>();

  constructor(public componentTypes: ComponentType<any>[], private game: Game) {
    // initialize pools, one for each ComponentType by ID. ComponentType IDs are incrementing integers.
    Object.values(componentTypes).forEach((Type) => {
      // assign an ID
      Type.id = game.idManager.get();
      // create a pool
      this.pools[Type.id] = new ComponentPool<any>(Type, this.game);
    });

    // TODO: right time to do this?
    game.on('preApplyOperations', this.resetChanged);
  }

  acquire = (typeId: number, initialValues: any) => {
    const component = this.pools[typeId].acquire(
      initialValues,
      this.game.idManager.get(),
    );
    component[COMPONENT_CHANGE_HANDLE] = this.markChanged;
    return component;
  };

  release = (instance: ComponentInstance<any>) => {
    delete instance[COMPONENT_CHANGE_HANDLE];
    return this.pools[instance.type].release(instance);
  };

  wasChangedLastFrame = (componentInstanceId: number) => {
    return !!this.changed[componentInstanceId];
  };

  private markChanged = (component: ComponentInstance<any>) => {
    this.changed[component.id] = true;
  };

  private resetChanged = () => {
    this.changed.length = 0;
  };
}
