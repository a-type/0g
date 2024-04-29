import { EventEmitter } from 'events';
import { ComponentType } from './Component.js';
import { Entity } from './Entity.js';

export interface ArchetypeEvents {
  entityAdded(entity: Entity<any, any>): any;
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

/**
 * Archetype is a group of Entities which share a common component signature.
 * Archetypes are the storage system for Entities; each Entity traces back to an Archetype's
 * entities array. When Entity components change, they are moved from Archetype to Archetype.
 * Grouping in this way is a helpful shortcut to fulfilling Query filter requirements,
 * as we only need to map a small number of Archetypes -> Query, versus iterating over
 * and checking every Entity in the system at init and then on every change.
 */
export class Archetype<
  T extends ComponentType<any>[] = ComponentType<any>[],
> extends EventEmitter {
  private entities = new Array<Entity<T[number], any>>();
  /** Maps entity ID -> index in entity array */
  private entityIndexLookup = new Array<number | undefined>();

  constructor(public id: string) {
    super();
    this.setMaxListeners(10000000);
  }

  /**
   * Archetype is iterable; iterating it will iterate over its stored
   * Entities.
   */
  [Symbol.iterator]() {
    return this.entities[Symbol.iterator]();
  }

  addEntity(entity: Entity<any, any>) {
    // this is the index ("column") of this entity in the table
    const index = this.entities.length;
    // for lookup later when presented with an entityId
    this.entityIndexLookup[entity.id] = index;

    // add entity data to the column of all data arrays
    this.entities[index] = entity;
    this.emit('entityAdded', entity);
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

    const [entity] = this.entities.splice(index, 1);
    // FIXME: improve this!!! Maybe look into a linked list like that one blog post...
    // decrement all entity index lookups that fall after this index
    for (let i = 0; i < this.entityIndexLookup.length; i++) {
      if (this.entityIndexLookup[i] && this.entityIndexLookup[i]! > index) {
        this.entityIndexLookup[i]!--;
      }
    }

    this.emit('entityRemoved', entityId);
    return entity;
  }

  getEntity(entityId: number) {
    const index = this.entityIndexLookup[entityId];
    if (index === undefined) {
      throw new Error(
        `Could not find entity ${entityId} in archetype ${this.id}`,
      );
    }
    return this.entities[index];
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

  toString() {
    return this.id;
  }
}
