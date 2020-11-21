import { BodyConfigData } from 'src/stores/bodyConfig';

export function useBodyStyles(stores: {
  transform: { x: number; y: number };
  bodyConfig: BodyConfigData;
}) {
  const x = stores.transform.x;
  const y = stores.transform.y;
  const width =
    stores.bodyConfig.shape === 'circle'
      ? stores.bodyConfig.radius * 2
      : stores.bodyConfig.width;
  const height =
    stores.bodyConfig.shape === 'circle'
      ? stores.bodyConfig.radius * 2
      : stores.bodyConfig.height;

  return {
    transform: `translate(${x}px, ${y}px)`,
    width,
    height,
  };
}
