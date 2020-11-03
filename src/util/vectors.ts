export type VectorLike = {
  x: number;
  y: number;
};

export function copyVec<S extends VectorLike, D extends VectorLike>(
  source: S,
  dest: D
) {
  dest.x = source.x;
  dest.y = source.y;
  return dest;
}
