import { useLayoutEffect, useRef } from 'react';
import { subscribe } from '0g';
import { stores as box2dStores } from '@0g/box2d';

export function useBodyRef<T extends HTMLElement>(
  stores: {
    transform: ReturnType<typeof box2dStores['transform']>;
    body: ReturnType<typeof box2dStores['body']>;
  },
  pixelScale = 10
) {
  const ref = useRef<T>(null);

  useLayoutEffect(() => {
    const updateBody = () => {
      if (!ref.current) return;

      const width =
        stores.body.config.shape === 'circle'
          ? stores.body.config.radius * 2 * pixelScale
          : stores.body.config.width * pixelScale;
      const height =
        stores.body.config.shape === 'circle'
          ? stores.body.config.radius * 2 * pixelScale
          : stores.body.config.height * pixelScale;

      ref.current.style.width = `${width}px`;
      ref.current.style.height = `${height}px`;
    };
    const updateTransform = () => {
      if (!ref.current) return;

      const { x, y, angle } = stores.transform;
      ref.current.style.transform = `translate(${x * pixelScale}px, ${
        y * pixelScale
      }px) translate(-50%, -50%) rotate(${angle ?? 0}rad)`;
    };

    const unsubTransform = subscribe(stores.transform, updateTransform);
    const unsubBody = subscribe(stores.body, updateBody);

    updateBody();
    updateTransform();

    return () => {
      unsubTransform();
      unsubBody();
    };
  }, [stores.transform, stores.body.config, ref]);

  return ref;
}
