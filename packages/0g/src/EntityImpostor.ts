import { ComponentInstance, ComponentType } from './Component';

export class EntityImpostor<
  DefiniteComponents extends ComponentType<any>,
  OmittedComponents extends ComponentType<any> = never
> {
  private _id = 0;
  // TODO: make array
  readonly components = new Map<number, ComponentInstance<any>>();

  get id() {
    return this._id;
  }

  __set = (
    entityId: number,
    components: ComponentInstance<any>[] | Readonly<ComponentInstance<any>[]>,
  ) => {
    this._id = entityId;
    this.components.clear();
    components.forEach((comp) => {
      this.components.set(comp.type, comp);
    });
  };

  get = <T extends DefiniteComponents>(Type: T): InstanceType<T> => {
    return this.components.get(Type.id)! as InstanceType<T>;
  };

  maybeGet = <T extends ComponentInstance<any>>(
    Type: ComponentType<T>,
  ): T | null => {
    return (this.components.get(Type.id) ?? null) as T | null;
  };
}
