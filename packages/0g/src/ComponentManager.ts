import { ComponentPool } from './ComponentPool.js';
import {
  COMPONENT_CHANGE_HANDLE,
  ComponentInstance,
  ComponentInstanceInternal,
  ComponentHandle,
} from './Component2.js';
import { Game } from './Game.js';

/**
 * Manages pools of Components based on their Type, and
 * the presence of Components assigned to Entities.
 */
export class ComponentManager {
  private pools = new Array<ComponentPool>();
  private changed = new Array<boolean>();
  private unsubscribes = new Array<() => void>();

  constructor(
    public componentHandles: ComponentHandle[],
    private game: Game,
  ) {
    // initialize pools, one for each ComponentType by ID. ComponentType IDs are incrementing integers.
    Object.values(componentHandles).forEach((handle) => {
      // assign an ID
      handle.id = game.idManager.get();
      // create a pool
      this.pools[handle.id] = new ComponentPool(handle, this.game);
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
    component.$[COMPONENT_CHANGE_HANDLE] = this.onComponentChanged;
    return component;
  };

  release = (instance: ComponentInstanceInternal) => {
    delete instance.$[COMPONENT_CHANGE_HANDLE];
    return this.pools[instance.$.type.id].release(instance);
  };

  wasChangedLastFrame = (componentInstanceId: number) => {
    return !!this.changed[componentInstanceId];
  };

  private onComponentChanged = (component: ComponentInstanceInternal) => {
    this.game.enqueueOperation({
      op: 'markChanged',
      componentId: component.$.id,
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
