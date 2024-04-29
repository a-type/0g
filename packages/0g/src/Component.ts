import { Poolable } from './internal/objectPool.js';

export const COMPONENT_CHANGE_HANDLE = Symbol('Component change handle');

type ComponentUpdateFn<T> = (updater: (self: T) => void) => void;

type ComponentInitializeFn<T> = (
  instance: T,
  overrides: Partial<T>,
  id: number,
) => void;

type ComponentSerialize<Comp> = (instance: Comp) => string;
type ComponentDeserialize<Comp> = (
  serialized: string,
  additionalProperties: PropertyDescriptorMap,
) => Comp;

function defaultSerialize<Comp>(instance: Comp) {
  const gettersAndSetters: PropertyDescriptorMap = {};
  const data: Record<string, any> = {};
  const descriptors = Object.getOwnPropertyDescriptors(instance);
  Object.keys(descriptors).forEach((key) => {
    const descriptor = descriptors[key];
    if (
      typeof descriptor?.get === 'function' ||
      typeof descriptor?.set === 'function'
    ) {
      gettersAndSetters[key] = descriptor;
    } else if (
      descriptor.enumerable &&
      descriptor.value &&
      !(typeof descriptor.value === 'function')
    ) {
      data[key] = descriptor.value;
    }
  });
  return JSON.stringify(data);
}

function defaultDeserialize<Comp>(
  serialized: string,
  additionalProperties: PropertyDescriptorMap,
): Comp {
  const data = JSON.parse(serialized);
  Object.defineProperties(data, additionalProperties);
  return data as Comp;
}

function defaultInitialize<Comp>(
  target: any,
  overrides: Partial<Comp>,
  id: number,
) {
  Object.assign(target, overrides);
  target.id = id;
}

export type ComponentInstance<T> = Poolable &
  T & {
    update: ComponentUpdateFn<T>;
    updated: boolean;
    id: number;
    __type: number;
    [COMPONENT_CHANGE_HANDLE]?: (self: T) => void;
  };

export type BaseComponentType<T> = {
  new (): ComponentInstance<T>;
  id: number;
  defaults: () => T;
  initialize: ComponentInitializeFn<T>;
};

function BaseComponent<T>({
  defaults,
}: {
  defaults: () => T;
}): BaseComponentType<T> {
  return class BaseComponent implements Poolable {
    static id = 0;
    static defaults = defaults;
    static initialize: ComponentInitializeFn<ComponentInstance<T>> =
      defaultInitialize;

    id = 0;
    __type = Object.getPrototypeOf(this).constructor.id;

    constructor() {
      Object.assign(this, defaults());
    }

    [COMPONENT_CHANGE_HANDLE]?: (self: T) => void;

    reset = () => {
      Object.getPrototypeOf(this).constructor.initialize(this, defaults(), 0);
    };

    /**
     * Use this function to semantically apply mutations to a
     * Component instance and seamlessly set the updated=true flag.
     * Works well for instant changes to a Component inline with
     * the .get call to access it (see code example)
     *
     * @example
     * entity.get(MyComponent).update(myComponent => {
     *   // reference values on the instance to set new ones
     *   myComponent.value = myComponent.value + 1;
     *   // upon function completion, myComponent.updated is
     *   // set `true` for you
     * });
     */
    update: ComponentUpdateFn<T> = (updater) => {
      updater(this as any);
      this.updated = true;
    };

    /**
     * This flag must be set whenever you make changes to a
     * Component instance which you want to be reported to
     * changed() filters in queries.
     */
    set updated(_: true) {
      this[COMPONENT_CHANGE_HANDLE]?.(this as any);
    }
  } as any;
}

export interface SerializedComponentType<T> extends BaseComponentType<T> {
  serialize: ComponentSerialize<T>;
  deserialize: ComponentDeserialize<T>;
  serialized: true;
}
export interface UnserializedComponentType<T> extends BaseComponentType<T> {
  serialized: false;
}

export type ComponentType<T> =
  | SerializedComponentType<T>
  | UnserializedComponentType<T>;

export function Component<T>(
  defaults: () => T,
  {
    serialize = defaultSerialize,
    deserialize = defaultDeserialize,
  }: {
    serialize?: ComponentSerialize<T>;
    deserialize?: ComponentDeserialize<T>;
  } = {},
) {
  const Type = BaseComponent<T>({ defaults }) as SerializedComponentType<T>;
  Type.serialize = serialize;
  Type.deserialize = deserialize;
  Type.serialized = true;
  return Type;
}

export function State<T>(defaults: () => T) {
  const Type = BaseComponent<T>({ defaults }) as UnserializedComponentType<T>;
  Type.serialized = false;
  return Type;
}

export type ComponentInstanceFor<T extends ComponentType<any>> =
  T extends ComponentType<infer Shape> ? ComponentInstance<Shape> : never;
