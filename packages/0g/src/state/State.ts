import { Component } from '../components';
import { EntityImpostor } from '../EntityImpostor';
import { Poolable } from '../internal/objectPool';

export class State<ComponentDeps extends Component> implements Poolable {
  __alive = false;

  /**
   * Called when a State is first associated with an Entity that matches its Component
   * dependencies. This should reset the State according to any defaults and configure
   * any one-time initial properties from Component data.
   */
  initialize(entity: EntityImpostor<ComponentDeps>): Promise<void> | void {}
  /**
   * Called once after initialization, and then every time the associated Component
   * dependencies change. This should apply changes to dependent parts of the
   * State to synchronize it to the new Component status.
   */
  apply(entity: EntityImpostor<ComponentDeps>): void {}
  /**
   * Called when the Entity associated with this State is destroyed or no
   * longer matches the Component criteria. This should remove the State
   * from the game, and optionally dispose of any pooled state. State
   * classes themselves will be pooled, so if you'd prefer you can keep
   * any value references intact and re-initialize them with initialize
   * later, so long as they are no longer affecting the game in the
   * interim.
   */
  destroy(): Promise<void> | void {}

  reset() {
    this.destroy();
  }
}
