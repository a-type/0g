import { ComponentPool } from './ComponentPool.js';
import {
  ComponentType,
  COMPONENT_CHANGE_HANDLE,
  ComponentInstance,
} from './Component.js';
import { Game } from './Game.js';

/**
 * Manages pools of Components based on their Type, and
 * the presence of Components assigned to Entities.
 */
export class ComponentManager {
  private pools = new Array<ComponentPool<any>>();
  private changed = new Array<boolean>();
  private unsubscribes = new Array<() => void>();

  constructor(
    public componentTypes: ComponentType<any>[],
    private game: Game,
  ) {
    // initialize pools, one for each ComponentType by ID. ComponentType IDs are incrementing integers.
    Object.values(componentTypes).forEach((Type) => {
      // assign an ID
      Type.id = game.idManager.get();
      // create a pool
      this.pools[Type.id] = new ComponentPool<any>(Type, this.game);
    });

    // TODO: right time to do this?
    this.unsubscribes.push(
      game.subscribe('preApplyOperations', this.resetChanged),
    );
  }

  acquire = (typeId: number, initialValues: any) => {
    if (!this.pools[typeId]) {
      throw new Error(`ComponentType with ID ${typeId} does not exist`);
    }
    const component = this.pools[typeId].acquire(
      initialValues,
      this.game.idManager.get(),
    );
    component[COMPONENT_CHANGE_HANDLE] = this.onComponentChanged;
    return component;
  };

  release = (instance: ComponentInstance<any>) => {
    delete instance[COMPONENT_CHANGE_HANDLE];
    return this.pools[instance.__type].release(instance);
  };

  wasChangedLastFrame = (componentInstanceId: number) => {
    return !!this.changed[componentInstanceId];
  };

  private onComponentChanged = (component: ComponentInstance<any>) => {
    this.game.enqueueOperation({
      op: 'markChanged',
      componentId: component.id,
    });
  };

  markChanged = (component: ComponentInstance<any>) => {
    this.changed[component.id] = true;
  };

  private resetChanged = () => {
    this.changed.length = 0;
  };

  getTypeName = (typeId: number) => {
    return this.pools[typeId].ComponentType.name;
  };

  destroy = () => {
    this.unsubscribes.forEach((unsub) => unsub());
    this.pools.forEach((pool) => pool.destroy());
  };
}
