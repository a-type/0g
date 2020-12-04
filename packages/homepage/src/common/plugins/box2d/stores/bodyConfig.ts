import * as r2d from 'r2d';

export type BodyConfigData = {
  friction: number;
  frictionAir: number;
  isStatic: boolean;
  angle: number;
  restitution: number;
  bullet: boolean;
  fixedRotation: boolean;
} & (
  | {
      shape: 'circle';
      radius: number;
      density: number;
    }
  | {
      shape: 'rectangle';
      width: number;
      height: number;
      density: number;
    }
);

export const bodyConfig = r2d.store('bodyConfig', {
  shape: 'circle',
  radius: 1,
  density: 1,
  frictionAir: 0,
  friction: 0,
  isStatic: false,
  angle: 0,
  restitution: 0,
  bullet: false,
  fixedRotation: false,
} as BodyConfigData);
