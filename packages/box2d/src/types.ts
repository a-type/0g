export type RectangleBodyShape = {
  shape: 'rectangle';
  width: number;
  height: number;
};

export type CircleBodyShape = {
  shape: 'circle';
  radius: number;
};

export interface VectorLike {
  x: number;
  y: number;
}

export type PolygonBodyShape = {
  shape: 'polygon';
  vertices: VectorLike[];
};

export type EdgeBodyShape = {
  shape: 'edge';
  v1: VectorLike;
  v2: VectorLike;
};

export type CapsuleBodyShape = {
  shape: 'capsule';
  width: number;
  height: number;
  segments?: number;
};

export type BodyShape =
  | RectangleBodyShape
  | CircleBodyShape
  | PolygonBodyShape
  | EdgeBodyShape
  | CapsuleBodyShape;
