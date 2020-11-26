import { BodyConfigData } from '../stores/bodyConfig';

export function useBodyStyles(
  stores: {
    transform: { x: number; y: number; angle: number };
    bodyConfig: BodyConfigData;
  },
  pixelScale = 10
) {
  const x = stores.transform.x * pixelScale;
  const y = stores.transform.y * pixelScale;
  const angle = stores.transform.angle;
  const width =
    stores.bodyConfig.shape === 'circle'
      ? stores.bodyConfig.radius * 2 * pixelScale
      : stores.bodyConfig.width * pixelScale;
  const height =
    stores.bodyConfig.shape === 'circle'
      ? stores.bodyConfig.radius * 2 * pixelScale
      : stores.bodyConfig.height * pixelScale;

  return {
    transform: `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${
      angle ?? 0
    }rad) `,
    transformOrigin: '50% 50%',
    width,
    height,
  };
}
