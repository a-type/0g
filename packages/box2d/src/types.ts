export type RectangleBodyShape = {
  shape: 'rectangle';
  width: number;
  height: number;
};

export type CircleBodyShape = {
  shape: 'circle';
  radius: number;
};

export type BodyShape = RectangleBodyShape | CircleBodyShape;
