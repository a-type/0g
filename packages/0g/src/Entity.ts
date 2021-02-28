import { ComponentInstance, ComponentType } from './Component';
import { Poolable } from './internal/objectPool';

// Utility type: it unwraps a ComponentType to an instance, making it nullable
// if the type is not accounted for in the Entity definition, or "never" if the type
// is specifically omitted - otherwise it is non-nullable.
type DefinedInstance<
  Present extends ComponentType<any>,
  Omitted extends ComponentType<any>,
  Type extends ComponentType<any>
> = Type extends Present
  ? InstanceType<Type>
  : Type extends Omitted
  ? never
  : InstanceType<Type> | null;

export class Entity<
  DefiniteComponents extends ComponentType<any> = ComponentType<any>,
  OmittedComponents extends ComponentType<any> = never
> implements Poolable {
  private _id = 0;
  // TODO: make array
  readonly components = new Map<number, ComponentInstance<any>>();

  get id() {
    return this._id;
  }

  // TODO: hide these behind Symbols?
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

  __addComponent = (instance: ComponentInstance<any>) => {
    this.components.set(instance.type, instance);
  };

  __removeComponent = (typeId: number) => {
    const instance = this.components.get(typeId);
    this.components.delete(typeId);
    return instance;
  };

  get = <T extends DefiniteComponents>(Type: T): InstanceType<T> => {
    return this.components.get(Type.id)! as InstanceType<T>;
  };

  maybeGet = <T extends ComponentInstance<any>>(
    Type: ComponentType<T>,
  ): T | null => {
    return (this.components.get(Type.id) ?? null) as T | null;
  };

  reset() {
    this.components.clear();
    this._id = 0;
  }

  clone(other: Entity<any>) {
    other.components.forEach((value, key) => {
      this.components.set(key, value);
    });
    this._id = other.id;
  }
}
