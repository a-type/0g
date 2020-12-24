import { useRef } from 'react';
import { Entity } from '0g';
import { stores } from '0g-box2d';
import { useWatch } from '0g-react';

export function useBodyRef<T extends HTMLElement>(
  entity: Entity,
  {
    pixelScale = 10,
    cssPosition = 'absolute',
  }: {
    pixelScale?: number;
    cssPosition?: 'absolute' | 'relative' | 'fixed';
  } = {}
) {
  const ref = useRef<T>(null);

  useWatch(entity, [stores.BodyConfig, stores.Transform], () => {
    const bodyConfig = entity.get(stores.BodyConfig);
    const transform = entity.get(stores.Transform);

    const width =
      bodyConfig.shape.shape === 'circle'
        ? bodyConfig.shape.radius * 2 * pixelScale
        : bodyConfig.shape.width * pixelScale;
    const height =
      bodyConfig.shape.shape === 'circle'
        ? bodyConfig.shape.radius * 2 * pixelScale
        : bodyConfig.shape.height * pixelScale;
    const { x, y, angle } = transform;

    if (ref.current) {
      ref.current.style.position = cssPosition;
      ref.current.style.width = `${width}px`;
      ref.current.style.height = `${height}px`;
      ref.current.style.transform = `translate(${x * pixelScale}px, ${
        y * pixelScale
      }px) translate(-50%, -50%) rotate(${angle ?? 0}rad)`;
    }
  });

  return ref;
}
