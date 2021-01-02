import { vecScale } from 'math2d';

export function createCapsule(width: number, height: number, segments: number) {
  const radius = width / 2;
  const rectHeight = height - width;
  const c0 = { x: -radius, y: -rectHeight / 2 };
  const c1 = { x: radius, y: -rectHeight / 2 };
  const c2 = { x: radius, y: rectHeight / 2 };
  const c3 = { x: -radius, y: rectHeight / 2 };
  const arc0 = new Array(segments).fill(null).map((_, i) => {
    const angle = -(Math.PI / 2) + (Math.PI / segments) * i;

    return vecScale(
      {
        x: Math.cos(angle),
        y: Math.sin(angle),
      },
      radius
    );
  });
  const arc1 = new Array(segments).fill(null).map((_, i) => {
    const angle = Math.PI / 2 + (Math.PI / segments) * i;

    return vecScale(
      {
        x: Math.cos(angle),
        y: Math.sin(angle),
      },
      radius
    );
  });
  return [c0, ...arc0, c1, c2, ...arc1, c3];
}
