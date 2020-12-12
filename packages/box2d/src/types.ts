export type BaseBodyConfig = {
  friction?: number;
  isStatic?: boolean;
  angle?: number;
  restitution?: number;
  bullet?: boolean;
  fixedRotation?: boolean;
  density?: number;
  angularDamping?: number;
  linearDamping?: number;
  worldName?: string;
};

export type RectangleBodyConfig = BaseBodyConfig & {
  shape: 'rectangle';
  width: number;
  height: number;
};

export type CircleBodyConfig = BaseBodyConfig & {
  shape: 'circle';
  radius: number;
};

export type BodyConfigData = RectangleBodyConfig | CircleBodyConfig;
