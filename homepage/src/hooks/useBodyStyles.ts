import { PX_SCALE } from '../constants';
import { BodyConfigData } from '../stores/bodyConfig';

export function useBodyStyles(stores: {
  transform: { x: number; y: number; angle: number };
  bodyConfig: BodyConfigData;
}) {
  const x = stores.transform.x * PX_SCALE;
  const y = stores.transform.y * PX_SCALE;
  const angle = stores.transform.angle;
  const width =
    stores.bodyConfig.shape === 'circle'
      ? stores.bodyConfig.radius * 2 * PX_SCALE
      : stores.bodyConfig.width * PX_SCALE;
  const height =
    stores.bodyConfig.shape === 'circle'
      ? stores.bodyConfig.radius * 2 * PX_SCALE
      : stores.bodyConfig.height * PX_SCALE;

  return {
    transform: `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${angle}rad) `,
    transformOrigin: '50% 50%',
    width,
    height,
  };
}
