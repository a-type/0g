import { EventSubscriber } from '@a-type/utils';
import { Archetype } from './Archetype.js';
import { ComponentInstance, ComponentInstanceInternal } from './Component2.js';
import { Game } from './Game.js';
import { logger } from './logger.js';
import { getIdSignifier } from './ids.js';

export type ArchetypeManagerEvents = {
  archetypeCreated(archetype: Archetype): void;
  entityCreated(entityId: number): void;
  entityComponentAdded(
    entityId: number,
    component: ComponentInstance<any>,
  ): void;
  entityComponentRemoved(entityId: number, componentType: number): void;
  entityDestroyed(entityId: number): void;
};

export class ArchetypeManager extends EventSubscriber<ArchetypeManagerEvents> {
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
    this.emptyId = new Array(this.game.componentManager.count + 1)
      .fill('0')
      .join('');
    this.archetypes[this.emptyId] = new Archetype(this.emptyId);
  }

  private lookupEntityArchetype(entityId: number) {
    const lookupIndex = getIdSignifier(entityId);
    return this.entityLookup[lookupIndex];
  }
  private setEntityArchetype(entityId: number, archetypeId: string) {
    const lookupIndex = getIdSignifier(entityId);
    this.entityLookup[lookupIndex] = archetypeId;
  }
  private clearEntityArchetype(entityId: number) {
    const lookupIndex = getIdSignifier(entityId);
    this.entityLookup[lookupIndex] = undefined;
  }

  createEntity(entityId: number) {
    logger.debug(`Creating entity ${entityId}`);
    this.setEntityArchetype(entityId, this.emptyId);
    // allocate an Entity
    const entity = this.game.entityPool.acquire();
    entity.__set(entityId, []);
    this.getOrCreate(this.emptyId).addEntity(entity);
    this.emit('entityCreated', entityId);
  }

  addComponent(entityId: number, instance: ComponentInstanceInternal) {
    logger.debug(`Adding ${instance.$.type.name} to entity ${entityId}`);
    const oldArchetypeId = this.lookupEntityArchetype(entityId);
    if (oldArchetypeId === undefined) {
      throw new Error(
        `Tried to add component ${instance.$.type.name} to ${entityId}, but it was not found in the archetype registry`,
      );
    }
    const newArchetypeId = this.flipBit(oldArchetypeId, instance.$.type.id);
    this.setEntityArchetype(entityId, newArchetypeId);
    if (oldArchetypeId === newArchetypeId) {
      // not currently supported...
      throw new Error(
        `Tried to add component ${instance.$.type.id} to ${entityId}, but it already has that component`,
      );
    }

    const oldArchetype = this.getOrCreate(oldArchetypeId);

    // remove data from old archetype
    const entity = oldArchetype.removeEntity(entityId);
    entity.__addComponent(instance);

    const archetype = this.getOrCreate(newArchetypeId);
    // copy entity from old to new
    archetype.addEntity(entity);
    logger.debug(`Entity ${entityId} moved to archetype ${newArchetypeId}`);
    this.emit('entityComponentAdded', entityId, instance);
  }

  removeComponent(entityId: number, componentType: number) {
    logger.debug(
      `Removing ${this.game.componentManager.getTypeName(
        componentType,
      )} from entity ${entityId}`,
    );
    const oldArchetypeId = this.lookupEntityArchetype(entityId);
    if (oldArchetypeId === undefined) {
      logger.warn(
        `Tried to remove component ${this.game.componentManager.getTypeName(
          componentType,
        )} from ${entityId}, but it was not found in the archetype registry`,
      );
      return;
    }
    const oldArchetype = this.getOrCreate(oldArchetypeId);

    const entity = oldArchetype.removeEntity(entityId);
    const removed = entity.__removeComponent(componentType);

    const newArchetypeId = this.flipBit(oldArchetypeId, componentType);
    this.setEntityArchetype(entityId, newArchetypeId);
    const archetype = this.getOrCreate(newArchetypeId);
    archetype.addEntity(entity);
    logger.debug(`Entity ${entityId} moved to archetype ${newArchetypeId}`);
    this.emit('entityComponentRemoved', entityId, componentType);

    return removed;
  }

  destroyEntity(entityId: number) {
    logger.debug(`Destroying entity ${entityId}`);
    const archetypeId = this.lookupEntityArchetype(entityId);
    if (archetypeId === undefined) {
      throw new Error(
        `Tried to destroy ${entityId}, but it was not found in archetype registry`,
      );
    }
    this.clearEntityArchetype(entityId);
    const archetype = this.archetypes[archetypeId];
    const entity = archetype.removeEntity(entityId);
    this.emit('entityDestroyed', entityId);
    entity.__markRemoved();
    return entity;
  }

  getEntity(entityId: number) {
    const archetypeId = this.lookupEntityArchetype(entityId);
    if (archetypeId === undefined) {
      logger.debug(`Could not find Archetype for Entity ${entityId}`);
      return null;
    }
    const archetype = this.archetypes[archetypeId];
    return archetype.getEntity(entityId);
  }

  private getOrCreate(id: string) {
    let archetype = this.archetypes[id];
    if (!archetype) {
      archetype = this.archetypes[id] = new Archetype(id);
      logger.debug(`New Archetype ${id} created`);
      this.emit('archetypeCreated', archetype);
    }
    return archetype;
  }

  private flipBit(id: string, typeId: number) {
    return (
      id.substr(0, typeId) +
      (id[typeId] === '1' ? '0' : '1') +
      id.substr(typeId + 1)
    );
  }
}
