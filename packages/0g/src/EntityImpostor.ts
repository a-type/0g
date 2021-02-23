import { GenericComponent, ComponentType } from './components';

export class EntityImpostor<QueriedComponents extends GenericComponent<any>> {
  private _id = 0;
  // TODO: make array
  readonly components = new Map<number, GenericComponent<any>>();

  get id() {
    return this._id;
  }

  __set = (
    entityId: number,
    components: GenericComponent<any>[] | Readonly<GenericComponent<any>[]>,
  ) => {
    this._id = entityId;
    this.components.clear();
    components.forEach((comp) => {
      this.components.set(comp.type, comp);
    });
  };

  get = <T extends QueriedComponents>(Type: ComponentType<T>): T => {
    return this.components.get(Type.id)! as T;
  };

  maybeGet = <T extends GenericComponent<any>>(
    Type: ComponentType<T>,
  ): T | null => {
    return (this.components.get(Type.id) ?? null) as T | null;
  };
}
