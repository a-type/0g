import { EventEmitter } from 'events';
import { Component, ComponentType } from './components';
import { ComponentInstanceFor } from './components/types';
import { EntityImpostor } from './EntityImpostor';
import { Game } from './Game';
import { logger } from './logger';

type InstanceListFromTypes<T extends Array<ComponentType>> = {
  [K in keyof T]: T[K] extends ComponentType
    ? ComponentInstanceFor<T[K]>
    : never;
};

type ArchetypeIterator<T extends ComponentType[]> = {
  (
    components: InstanceListFromTypes<T>,
    entityId: number,
    details: { added: boolean },
  ): void;
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
  T extends ComponentType[] = ComponentType[]
> extends EventEmitter {
  private entityIds = new Array<number>();
  private components: Array<Array<Component>>;
  /** Maps entity ID -> index in component arrays */
  private entityIndexLookup = new Array<number | undefined>();
  readonly added = new Array<number>();
  readonly removed = new Array<number>();
  private entityImpostor = new EntityImpostor<ComponentInstanceFor<T[0]>>();

  constructor(public id: string) {
    super();
    // initialize component storage arrays
    const numTypes = this.countOnes(id);
    this.components = new Array<Array<Component>>(numTypes)
      .fill([])
      .map(() => new Array<Component>());
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
          self.added.includes(entityId),
        );
        entityIndex++;
        return result;
      },
    } as Iterator<EntityImpostor<InstanceListFromTypes<T>[0]>>;
  })();

  [Symbol.iterator]() {
    return this.iterator;
  }

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
    this.added.push(entityId);
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
    const componentData = new Array<Component>() as InstanceListFromTypes<T>;
    this.components.forEach((componentArray, componentIndex) => {
      componentData[componentIndex] = componentArray.splice(index, 1)[0];
    });
    this.removed.push(entityId);
    this.emit('entityRemoved', entityId);
    return componentData;
  }

  getEntity(entityId: number) {
    const entityIndex = this.entityIndexLookup[entityId];

    if (entityIndex === undefined) {
      return null;
    }

    this.entityImpostor.__set(
      entityId,
      this.getComponentList(entityIndex),
      this.added.includes(entityId),
    );
    return this.entityImpostor;
  }

  hasAll = (types: ComponentType[]) => {
    const masked = types
      .reduce((m, T) => {
        m[T.id] = '1';
        return m;
      }, this.id.split(''))
      .join('');
    return this.id === masked;
  };

  hasSome = (types: ComponentType[]) => {
    for (var T of types) {
      if (this.id[T.id] === '1') return true;
    }
    return false;
  };

  cleanup = () => {
    this.added.length = 0;
    this.removed.length = 0;
  };

  get entities() {
    return this.entityIds;
  }

  private _tmpComponentList: InstanceListFromTypes<T> = new Array<Component>() as InstanceListFromTypes<T>;
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
}

// TODO split to file

export interface ArchetypeManagerEvents {
  archetypeCreated(archetype: Archetype): void;
}
export declare interface ArchetypeManager {
  on<U extends keyof ArchetypeManagerEvents>(
    ev: U,
    cb: ArchetypeManagerEvents[U],
  ): this;
  off<U extends keyof ArchetypeManagerEvents>(
    ev: U,
    cb: ArchetypeManagerEvents[U],
  ): this;
  emit<U extends keyof ArchetypeManagerEvents>(
    ev: U,
    ...args: Parameters<ArchetypeManagerEvents[U]>
  ): boolean;
}
export class ArchetypeManager extends EventEmitter {
  // an all-0 bitstring the size of the number of Component types
  emptyId: string;

  // maps entity ids to archetypes
  entityLookup = new Array<string | undefined>();

  // maps archetype id bitstrings to Archetype instances
  archetypes: Record<string, Archetype> = {};

  constructor(private game: Game) {
    super();
    // FIXME: why +1 here? Component ids are not starting at 0... this
    // should be more elegant
    this.emptyId = new Array(
      this.game.componentManager.componentTypes.length + 1,
    )
      .fill('0')
      .join('');
    this.archetypes[this.emptyId] = new Archetype(this.emptyId);
  }

  createEntity(entityId: number) {
    logger.debug(`Creating entity ${entityId}`);
    this.entityLookup[entityId] = this.emptyId;
    this.getOrCreate(this.emptyId).addEntity(entityId, []);
  }

  private getInsertionIndex(instanceList: Component[], instance: Component) {
    let insertionIndex = instanceList.findIndex((i) => i.type > instance.type);
    if (insertionIndex === -1) {
      insertionIndex = instanceList.length;
    } else {
      insertionIndex -= 1;
    }
    return insertionIndex;
  }

  addComponent<T extends ComponentType>(
    entityId: number,
    instance: ComponentInstanceFor<T>,
  ) {
    logger.debug(`Adding ${instance.type} to entity ${entityId}`);
    const oldArchetypeId = this.entityLookup[entityId];
    if (oldArchetypeId === undefined) {
      throw new Error(
        `Tried to add component ${instance.type} to ${entityId}, but it was not found in the archetype registry`,
      );
    }
    const oldArchetype = this.getOrCreate(oldArchetypeId);

    // remove data from old archetype
    const instanceList = oldArchetype.removeEntity(entityId);
    // add new instance to instance list - must be inserted in order
    instanceList.splice(
      this.getInsertionIndex(instanceList, instance),
      0,
      instance,
    );

    const newArchetypeId = (this.entityLookup[entityId] = this.flipBit(
      oldArchetypeId,
      instance.type,
    ));
    const archetype = this.getOrCreate(newArchetypeId);
    // copy entity from old to new
    archetype.addEntity(entityId, instanceList);
    logger.debug(`Entity ${entityId} moved to archetype ${newArchetypeId}`);
  }

  removeComponent(entityId: number, componentType: number) {
    logger.debug(`Removing ${componentType} from entity ${entityId}`);
    const oldArchetypeId = this.entityLookup[entityId];
    if (oldArchetypeId === undefined) {
      throw new Error(
        `Tried to remove component ${componentType} from ${entityId}, but it was not found in the archetype registry`,
      );
    }
    const oldArchetype = this.getOrCreate(oldArchetypeId);

    const instanceList = oldArchetype.removeEntity(entityId);
    const [removedInstance] = instanceList.splice(
      instanceList.findIndex((i) => i.type === componentType),
      1,
    );

    const newArchetypeId = (this.entityLookup[entityId] = this.flipBit(
      oldArchetypeId,
      componentType,
    ));
    const archetype = this.getOrCreate(newArchetypeId);
    archetype.addEntity(entityId, instanceList);
    logger.debug(`Entity ${entityId} moved to archetype ${newArchetypeId}`);

    return removedInstance;
  }

  getEntity(entityId: number) {
    const archetypeId = this.entityLookup[entityId];
    if (archetypeId === undefined) {
      return null;
    }
    return this.archetypes[archetypeId].getEntity(entityId);
  }

  destroyEntity(entityId: number) {
    logger.debug(`Destroying entity ${entityId}`);
    const archetypeId = this.entityLookup[entityId];
    if (archetypeId === undefined) {
      throw new Error(
        `Tried to destroy ${entityId}, but it was not found in archetype registry`,
      );
    }
    this.entityLookup[entityId] = undefined;
    const archetype = this.archetypes[archetypeId];
    return archetype.removeEntity(entityId);
  }

  private getOrCreate(id: string) {
    let archetype = this.archetypes[id];
    if (!archetype) {
      archetype = this.archetypes[id] = new Archetype(id);
      this.game.on('preApplyOperations', archetype.cleanup);
      this.emit('archetypeCreated', archetype);
    }
    return archetype;
  }

  private getId(Types: ComponentType[]) {
    return Types.map((T) => T.id).reduce(this.flipBit, this.emptyId);
  }

  private flipBit(id: string, typeId: number) {
    return (
      id.substr(0, typeId) +
      (id[typeId] === '1' ? '0' : '1') +
      id.substr(typeId + 1)
    );
  }
}
