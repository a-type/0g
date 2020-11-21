import { BodyConfigData } from '../stores/bodyConfig';

export function useBodyStyles(stores: {
  transform: { x: number; y: number; angle: number };
  bodyConfig: BodyConfigData;
}) {
  const x = stores.transform.x;
  const y = stores.transform.y;
  const angle = stores.transform.angle;
  const width =
    stores.bodyConfig.shape === 'circle'
      ? stores.bodyConfig.radius * 2
      : stores.bodyConfig.width;
  const height =
    stores.bodyConfig.shape === 'circle'
      ? stores.bodyConfig.radius * 2
      : stores.bodyConfig.height;

  return {
    transform: `translate(${x}px, ${y}px) rotate(${angle}rad) translate(-50%, -50%)`,
    width,
    height,
  };
}
