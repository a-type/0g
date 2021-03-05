export interface AddComponentOperation {
  op: 'addComponent';
  entityId: number;
  componentType: number;
  initialValues: any;
}

export interface RemoveComponentOperation {
  op: 'removeComponent';
  entityId: number;
  componentType: number;
}

/**
 * At some (unguaranteed) time after a user removes
 * an Entity, it is recycled and all associated Components
 * which remain on it are removed and recycled as well.
 */
export interface DestroyEntityOperation {
  op: 'destroyEntity';
  entityId: number;
}

/**
 * Before destroying an Entity, it is first removed
 * from its Archetype and any associated Queries. This
 * allows Effects to run cleanup.
 */
export interface RemoveEntityOperation {
  op: 'removeEntity';
  entityId: number;
}

export interface CreateEntityOperation {
  op: 'createEntity';
  entityId: number;
}

export interface MarkChangedOperation {
  op: 'markChanged';
  componentId: number;
}

export type Operation =
  | AddComponentOperation
  | RemoveComponentOperation
  | RemoveEntityOperation
  | DestroyEntityOperation
  | CreateEntityOperation
  | MarkChangedOperation;

export type OperationQueue = Operation[];
