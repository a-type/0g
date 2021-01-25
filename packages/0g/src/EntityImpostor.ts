import { Component } from './components';
import { ComponentTypeFor } from './components/types';

export class EntityImpostor<QueriedComponents extends Component = Component> {
  private _id = 0;
  private components = new Map<number, Component>();
  private _added = false;

  get id() {
    return this._id;
  }

  get added() {
    return this._added;
  }

  __set = (
    entityId: number,
    components: Component[] | Readonly<Component[]>,
    added: boolean,
  ) => {
    this._id = entityId;
    this._added = added;
    console.debug(`Loading impostor with ${JSON.stringify(components)}`);
    components.forEach((comp) => {
      this.components.set(comp.type, comp);
    });
  };

  get = <T extends QueriedComponents>(Type: ComponentTypeFor<T>): T => {
    return this.components.get(Type.id)! as T;
  };

  maybeGet = <T extends Component>(Type: ComponentTypeFor<T>): T | null => {
    return (this.components.get(Type.id) ?? null) as T | null;
  };
}
