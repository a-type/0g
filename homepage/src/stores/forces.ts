import { r2d } from '../../../src';

export const forces = r2d.store<{
  velocity: { x: number; y: number } | null;
}>({
  velocity: null,
});
