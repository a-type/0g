import { EventEmitter } from 'events';
import {
  ComponentInstanceFor,
  ComponentType,
  ComponentInstance,
} from './Component';
import { EntityImpostor } from './EntityImpostor';

type InstanceListFromTypes<T extends Array<ComponentType<any>>> = {
  [K in keyof T]: T[K] extends ComponentType<any>
    ? ComponentInstanceFor<T[K]>
    : never;
};

export interface ArchetypeEvents {
  entityAdded(entityId: number): any;
  entityRemoved(entityId: number): any;
}

export declare interface Archetype {
  on<U extends keyof ArchetypeEvents>(ev: U, cb: ArchetypeEvents[U]): this;
  off<U extends keyof ArchetypeEvents>(ev: U, cb: ArchetypeEvents[U]): this;
  emit<U extends keyof ArchetypeEvents>(
    ev: U,
    ...args: Parameters<ArchetypeEvents[U]>
  ): boolean;
}

export class Archetype<
  T extends ComponentType<any>[] = ComponentType<any>[]
> extends EventEmitter {
  private entityIds = new Array<number>();
  private components: Array<Array<ComponentInstance<any>>>;
  /** Maps entity ID -> index in component arrays */
  private entityIndexLookup = new Array<number | undefined>();
  private entityImpostor = new EntityImpostor<ComponentInstanceFor<T[0]>>();

  constructor(public id: string) {
    super();
    // initialize component storage arrays
    const numTypes = this.countOnes(id);
    this.components = new Array<Array<ComponentInstance<any>>>(numTypes)
      .fill([])
      .map(() => new Array<ComponentInstance<any>>());
  }

  private iterator = (() => {
    const self = this;
    let entityIndex = 0;
    const result = {
      done: false,
      value: this.entityImpostor,
    };
    return {
      next(): IteratorResult<EntityImpostor<InstanceListFromTypes<T>[0]>> {
        if (entityIndex === self.entityIds.length) {
          entityIndex = 0;
          result.done = true;
          return result;
        } else {
          result.done = false;
        }
        const entityId = self.entityIds[entityIndex];
        result.value.__set(
          entityId,
          self.components.map(
            (l) => l[entityIndex],
          ) as InstanceListFromTypes<T>,
        );
        entityIndex++;
        return result;
      },
    } as Iterator<EntityImpostor<InstanceListFromTypes<T>[0]>>;
  })();

  [Symbol.iterator]() {
    return this.iterator;
  }

  // TODO: FIX INDEX LOGIC IN THESE TWO
  addEntity(entityId: number, componentInstances: InstanceListFromTypes<T>) {
    // this is the index ("column") of this entity in the table
    const index = this.entityIds.length;
    // for lookup later when presented with an entityId
    this.entityIndexLookup[entityId] = index;

    // add entity data to the column of all data arrays
    this.entityIds[index] = entityId;
    this.components.forEach((componentArray, componentIndex) => {
      componentArray[index] = componentInstances[componentIndex];
    });
    this.emit('entityAdded', entityId);
  }

  /**
   * Removes an entity from the archetype table, returning its
   * component data list
   */
  removeEntity(entityId: number) {
    const index = this.entityIndexLookup[entityId];
    if (index === undefined) {
      throw new Error(
        `Tried to remove ${entityId} from archetype ${this.id}, but was not present`,
      );
    }
    this.entityIndexLookup[entityId] = undefined;

    this.entityIds.splice(index, 1);
    const componentData = new Array<
      ComponentInstance<any>
    >() as InstanceListFromTypes<T>;
    this.components.forEach((componentArray, componentIndex) => {
      componentData[componentIndex] = componentArray.splice(index, 1)[0];
    });
    this.emit('entityRemoved', entityId);
    return componentData;
  }

  getEntity(entityId: number) {
    const entityIndex = this.entityIndexLookup[entityId];

    if (entityIndex === undefined) {
      return null;
    }

    this.entityImpostor.__set(entityId, this.getComponentList(entityIndex));
    return this.entityImpostor;
  }

  hasAll = (types: ComponentType<any>[]) => {
    const masked = types
      .reduce((m, T) => {
        m[T.id] = '1';
        return m;
      }, this.id.split(''))
      .join('');
    return this.id === masked;
  };

  hasSome = (types: ComponentType<any>[]) => {
    for (var T of types) {
      if (this.id[T.id] === '1') return true;
    }
    return false;
  };

  includes = (Type: ComponentType<any>) => {
    return this.id[Type.id] === '1';
  };

  omits = (Type: ComponentType<any>) => {
    return !this.includes(Type);
  };

  cleanup = () => {
    // TODO: remove if unused
  };

  get entities() {
    return this.entityIds;
  }

  private _tmpComponentList: InstanceListFromTypes<T> = new Array<
    ComponentInstance<any>
  >() as InstanceListFromTypes<T>;
  private getComponentList = (
    entityIndex: number,
  ): InstanceListFromTypes<T> => {
    this._tmpComponentList.length = 0;
    let i = 0;
    for (const list of this.components) {
      this._tmpComponentList[i] = list[entityIndex];
      i++;
    }
    return this._tmpComponentList;
  };

  private countOnes(id: string) {
    let count = 0;
    for (let i of id) {
      if (i === '1') count++;
    }
    return count;
  }

  toString() {
    return this.id;
  }
}

// TODO split to file
