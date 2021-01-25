export interface AddComponentOperation {
  op: 'addComponent';
  entityId: number;
  componentId: number;
  initialValues: any;
}

export interface RemoveComponentOperation {
  op: 'removeComponent';
  entityId: number;
  componentId: number;
}

export interface DestroyEntityOperation {
  op: 'destroyEntity';
  entityId: number;
}

export interface CreateEntityOperation {
  op: 'createEntity';
  entityId: number;
}

export type Operation =
  | AddComponentOperation
  | RemoveComponentOperation
  | DestroyEntityOperation
  | CreateEntityOperation;

export type OperationQueue = Operation[];
