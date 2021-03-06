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
  | CreateEntityOperation
  | MarkChangedOperation;

export type OperationQueue = Operation[];
