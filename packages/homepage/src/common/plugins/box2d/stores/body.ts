import * as r2d from 'r2d';

export const body = r2d.store('body', {
  mass: 0,
  velocity: { x: 0, y: 0 },
  angularVelocity: 0,
});
