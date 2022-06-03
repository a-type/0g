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
  OmittedComponents extends ComponentType<any> = any
> implements Poolable {
  private _id = 0;
  // TODO: make array
  readonly components = new Map<number, ComponentInstance<any>>();

  private _destroyed = true;

  get id() {
    return this._id;
  }

  get destroyed() {
    return this._destroyed;
  }

  // TODO: hide these behind Symbols?
  __set = (
    entityId: number,
    components: ComponentInstance<any>[] | Readonly<ComponentInstance<any>[]>,
  ) => {
    this._id = entityId;
    this.components.clear();
    components.forEach((comp) => {
      this.components.set(comp.__type, comp);
    });
    this._destroyed = false;
  };

  __addComponent = (instance: ComponentInstance<any>) => {
    this.components.set(instance.__type, instance);
  };

  __removeComponent = (typeId: number) => {
    const instance = this.components.get(typeId);
    this.components.delete(typeId);
    return instance;
  };

  get = <T extends ComponentType<any>>(
    Type: T,
  ): DefinedInstance<DefiniteComponents, OmittedComponents, T> => {
    const instance = (this.components.get(Type.id) ?? null) as DefinedInstance<
      DefiniteComponents,
      OmittedComponents,
      T
    >;
    console.assert(
      !instance || instance.id !== 0,
      `Entity tried to access recycled Component instance of type ${Type.name}`,
    );
    return instance;
  };

  maybeGet = <T extends ComponentInstance<any>>(
    Type: ComponentType<T>,
  ): T | null => {
    return (this.components.get(Type.id) ?? null) as T | null;
  };

  reset() {
    this.components.clear();
    // disabled to diagnose issues...
    this._id = 0;
    this._destroyed = true;
  }

  clone(other: Entity<any>) {
    other.components.forEach((value, key) => {
      this.components.set(key, value);
    });
    this._id = other.id;
  }
}
