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

export interface DestroyEntityOperation {
  op: 'destroyEntity';
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
  | DestroyEntityOperation
  | CreateEntityOperation
  | MarkChangedOperation;

export type OperationQueue = Operation[];
